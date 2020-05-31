import { flags } from '@oclif/command';
import cli from 'cli-ux';
import * as XRegExp from 'xregexp';

import { differenceInDays } from 'date-fns';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import esGithubLatest from '../../utils/es/esGithubLatest';
import chunkArray from '../../utils/misc/chunkArray';
import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesUpdated from '../../utils/github/utils/fetchNodesUpdated';
import fetchNodesByIds from '../../utils/github/utils/fetchNodesByIds';
import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import { getId } from '../../utils/misc/getId';
import esCheckIndex from '../../utils/es/esCheckIndex';

import esMapping from '../../utils/github/issues/esMapping';
import fetchGql from '../../utils/github/issues/fetchGql';
import zConfig from '../../utils/github/issues/zConfig';
import fetchReposWithData from '../../utils/github/issues/fetchReposWithData';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Issues extends Command {
  static description = 'Github: Fetches issues data from configured sources';

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
    const { flags } = this.parse(Issues);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubIssues,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesUpdated(
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

    // Since not all repositories have data, we start by a query giving us a list of all repositories with data
    cli.action.start('Searching for repos with data');
    const ghPayloadChunked = await chunkArray(
      sources,
      userConfig.github.fetch.maxNodes,
    );
    let reposData: Array<any> = [];
    for (const reposChunk of ghPayloadChunked) {
      const newRepos = await fetchRepos.load(reposChunk);
      reposData = [...reposData, ...newRepos];
    }
    const reposWithData = reposData
      .filter((r: any) => r.issues.totalCount > 0)
      .map((r: any) => r.id);
    cli.action.stop(' done');

    const sourcesWithData = sources.filter(s => reposWithData.includes(s.id));
    console.log(
      'Found: ' +
        reposWithData.length +
        ' repos with Issues, fetching corresponding data',
    );

    for (const currentSource of sourcesWithData) {
      let issuesIndex = userConfig.elasticsearch.dataIndices.githubIssues;

      this.log('Processing source: ' + currentSource.name);
      const recentIssue = await esGithubLatest(
        eClient,
        issuesIndex,
        currentSource.id,
      );
      cli.action.start(
        'Grabbing issues for: ' +
          currentSource.name +
          ' (ID: ' +
          currentSource.id +
          ')',
      );
      let fetchedIssues = await fetchData.load(currentSource.id, recentIssue);
      cli.action.stop(' done');

      // Add the source id to all of the documents
      fetchedIssues = fetchedIssues.map((item: any) => {
        let openedDuring = null;
        if (item.closedAt !== null) {
          openedDuring = differenceInDays(
            new Date(item.closedAt),
            new Date(item.createdAt),
          );
        }
        let issuePoints: number | null = null;
        const pointsExp = XRegExp('SP:[.\\d]');
        for (const currentLabel of item.labels.edges) {
          if (pointsExp.test(currentLabel.node.name)) {
            issuePoints = parseInt(currentLabel.node.name.replace('SP:', ''));
          } else if (pointsExp.test(currentLabel.node.description)) {
            issuePoints = parseInt(
              currentLabel.node.description.replace('SP:', ''),
            );
          } else {
            const foundPoints = userConfig.github.storyPointsLabels.find(
              (pl: any) => pl.label === currentLabel.node.name,
            );
            if (foundPoints !== undefined) {
              issuePoints = foundPoints.points;
            }
          }
        }
        return {
          ...item,
          // eslint-disable-next-line @typescript-eslint/camelcase
          zindexer_sourceid: currentSource.id,
          openedDuring: openedDuring,
          points: issuePoints,
        };
      });

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        issuesIndex = (
          userConfig.elasticsearch.dataIndices.githubIssues +
          getId(currentSource.name)
        ).toLocaleLowerCase();
      }

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, issuesIndex, esMapping);

      await esPushNodes(fetchedIssues, issuesIndex, eClient);

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        // Create an alias used for group querying
        cli.action.start(
          'Creating the Elasticsearch index alias: ' +
            userConfig.elasticsearch.dataIndices.githubIssues,
        );
        await eClient.indices.putAlias({
          index: userConfig.elasticsearch.dataIndices.githubIssues + '*',
          name: userConfig.elasticsearch.dataIndices.githubIssues,
        });
        cli.action.stop(' done');
      }
    }
  }
}
