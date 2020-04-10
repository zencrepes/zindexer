import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import esGithubLatest from '../../utils/es/esGithubLatest';
import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesUpdated from '../../utils/github/utils/fetchNodesUpdated';
import ghClient from '../../utils/github/utils/ghClient';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import { getId } from '../../utils/misc/getId';
import esCheckIndex from '../../utils/es/esCheckIndex';

import esMapping from '../../utils/github/issues/esMapping';
import fetchGql from '../../utils/github/issues/fetchGql';

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
  };

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesUpdated(
      gClient,
      fetchGql,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currenSource of sources) {
      let issuesIndex = userConfig.elasticsearch.dataIndices.githubIssues;

      this.log('Processing source: ' + currenSource.name);
      const recentIssue = await esGithubLatest(
        eClient,
        issuesIndex,
        currenSource.id,
      );
      cli.action.start(
        'Grabbing issues for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      let fetchedIssues = await fetchData.load(currenSource.id, recentIssue);
      cli.action.stop(' done');

      // Add the source id to all of the documents
      fetchedIssues = fetchedIssues.map((item: any) => {
        return {
          ...item,
          zindexer_sourceid: currenSource.id,
        };
      });

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        issuesIndex = (
          userConfig.elasticsearch.dataIndices.githubIssues +
          getId(currenSource.name)
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
