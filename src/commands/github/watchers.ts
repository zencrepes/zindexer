import { flags } from '@oclif/command';
import cli from 'cli-ux';
import * as _ from 'lodash';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';

import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesByQuery from '../../utils/github/utils/fetchNodesByQuery';
import fetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';

import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import esCheckIndex from '../../utils/es/esCheckIndex';

import esMapping from '../../utils/github/watchers/esMapping';
import fetchGql from '../../utils/github/watchers/fetchGql';
import fetchReposWithData from '../../utils/github/watchers/fetchReposWithData';

import zConfig from '../../utils/github/watchers/zConfig';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Watchers extends Command {
  static description = 'Github: Fetches Watchers data from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
    envUserConf: flags.string({
      required: false,
      env: 'USER_CONFIG',
      description:
        'User Configuration passed as an environment variable, takes precedence over config file',
    }),
    config: flags.boolean({
      char: 'c',
      default: false,
      description: 'Only update ZenCrepes configuration',
    }),
    reset: flags.boolean({
      char: 'r',
      default: false,
      description: 'Reset ZenCrepes configuration to default',
    }),
  };

  async run() {
    const { flags } = this.parse(Watchers);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubWatchers,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesByQuery(
      gClient,
      fetchGql,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    const fetchRepos = new fetchNodesByIds(
      this.log,
      userConfig.github.fetch.maxNodes,
      cli,
      fetchReposWithData,
      gClient,
    );

    // Since not all repositories have data, we start by a query giving us a list of all repositories with watchers
    cli.action.start('Searching for repos with watchers');
    const ghPayloadChunked = await chunkArray(
      sources,
      userConfig.github.fetch.maxNodes,
    );
    let reposData: Array<any> = [];
    for (const reposChunk of ghPayloadChunked) {
      const newRepos = await fetchRepos.load(reposChunk);
      reposData = [...reposData, ...newRepos];
    }
    const reposWithWatchers = reposData
      .filter((r: any) => r.watchers.totalCount > 0)
      .map((r: any) => r.id);
    cli.action.stop(' done');

    const sourcesWithWatchers = sources.filter(s =>
      reposWithWatchers.includes(s.id),
    );
    console.log(
      'Found: ' +
        sourcesWithWatchers.length +
        ' repos with Watchers, fetching corresponding data',
    );

    const watchersIndex = userConfig.elasticsearch.dataIndices.githubWatchers;
    let allWatchers: any[] = [];
    for (const currentSource of sourcesWithWatchers) {
      this.log('Processing source: ' + currentSource.name);
      cli.action.start(
        'Grabbing watchers for: ' +
          currentSource.name +
          ' (ID: ' +
          currentSource.id +
          ')',
      );
      let fetchedWatchers = await fetchData.load({
        repoId: currentSource.id,
      });
      cli.action.stop(' done');

      // Some data manipulation on all items
      fetchedWatchers = fetchedWatchers.map((item: any) => {
        const updatedItem = {
          ...item,
          // eslint-disable-next-line @typescript-eslint/camelcase
          zindexer_sourceid: currentSource.id,
          id: 'watchers-' + item.id,
          dataType: 'watchers',
          repository: {
            id: item._parent.id,
            name: item._parent.name,
            url: item._parent.url,
            databaseId: item._parent.databaseId,
            owner: item._parent.owner,
          },
        };
        delete updatedItem._parent;
        return updatedItem;
      });
      allWatchers = [...allWatchers, ...fetchedWatchers];
    }

    const grouppedUsers = _.groupBy(allWatchers, 'login');
    // console.log(grouppedUsers);
    const preppedUsers = Object.entries(grouppedUsers).map(
      ([name, content]) => {
        console.log('Preparring data for user: ' + name);
        const srcUser = JSON.parse(JSON.stringify(content[0]));
        delete srcUser.repository;
        return {
          ...srcUser,
          repositories: {
            edges: content.map((u: any) => {
              return { node: { ...u.repository } };
            }),
            totalCount: content.length,
          },
        };
      },
    );

    // Check if index exists, create it if it does not
    await esCheckIndex(eClient, userConfig, watchersIndex, esMapping);

    // Push all nodes to the index
    await esPushNodes(preppedUsers, watchersIndex, eClient);
  }
}
