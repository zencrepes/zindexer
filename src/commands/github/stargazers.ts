import { flags } from '@oclif/command';
import cli from 'cli-ux';
import * as _ from 'lodash';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import chunkArray from '../../utils/misc/chunkArray';

import fetchNodesByQuery from '../../utils/github/utils/fetchNodesByQuery';
import fetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';

import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';

import {
  esMapping,
  esSettings,
  fetchNodes,
  zConfig,
  ingestNodes,
  fetchReposWithData,
} from '../../components/githubStargazers';

import {
  checkEsIndex,
  pushEsNodes,
  getEsIndex,
  aliasEsIndex,
} from '../../components/esUtils/index';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Stargazers extends Command {
  static description =
    'Github: Fetches Stargazers data from configured sources';

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
    const { flags } = this.parse(Stargazers);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubStargazers,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesByQuery(
      gClient,
      fetchNodes,
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

    // Since not all repositories have data, we start by a query giving us a list of all repositories with stargazers
    cli.action.start('Searching for repos with stargazers');
    const ghPayloadChunked = await chunkArray(
      sources,
      userConfig.github.fetch.maxNodes,
    );
    let reposData: Array<any> = [];
    for (const reposChunk of ghPayloadChunked) {
      const newRepos = await fetchRepos.load(reposChunk);
      reposData = [...reposData, ...newRepos];
    }

    const reposWithStargazers = reposData
      .filter((r: any) => r.stargazers.totalCount > 0)
      .map((r: any) => r.id);
    cli.action.stop(' done');

    const sourcesWithStargazers = sources.filter(s =>
      reposWithStargazers.includes(s.id),
    );
    console.log(
      'Found: ' +
        sourcesWithStargazers.length +
        ' repos with Stargazers, fetching corresponding data',
    );

    for (const currentSource of sourcesWithStargazers) {
      this.log('Processing source: ' + currentSource.name);
      cli.action.start(
        'Grabbing stargazers for: ' +
          currentSource.name +
          ' (ID: ' +
          currentSource.id +
          ')',
      );
      let fetchedStargazers = await fetchData.load({
        repoId: currentSource.id,
      });
      cli.action.stop(' done');

      fetchedStargazers = ingestNodes(
        fetchedStargazers,
        'zindexer',
        currentSource.id,
        currentSource.repository,
        'stargazers',
      );

      const stargazersIndex = getEsIndex(
        userConfig.elasticsearch.dataIndices.githubStargazers,
        userConfig.elasticsearch.oneIndexPerSource,
        currentSource.name,
      );

      await checkEsIndex(
        eClient,
        stargazersIndex,
        esMapping,
        esSettings,
        this.log,
      );
      await pushEsNodes(eClient, stargazersIndex, fetchedStargazers, this.log);
    }
    if (userConfig.elasticsearch.oneIndexPerSource === true) {
      // Create an alias used for group querying
      await aliasEsIndex(
        eClient,
        userConfig.elasticsearch.dataIndices.githubStargazers,
        this.log,
      );
    }
  }
}
