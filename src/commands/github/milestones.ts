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

import esMapping from '../../utils/github/milestones/esMapping';
import fetchGql from '../../utils/github/milestones/fetchGql';

export default class Milestones extends Command {
  static description =
    'Github: Fetches milestones data from configured sources';

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
      let milestonesIndex =
        userConfig.elasticsearch.dataIndices.githubMilestones;

      this.log('Processing source: ' + currenSource.name);
      const recentMilestone = await esGithubLatest(
        eClient,
        milestonesIndex,
        currenSource.id,
      );
      cli.action.start(
        'Grabbing milestones for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      let fetchedMilestones = await fetchData.load(
        currenSource.id,
        recentMilestone,
      );
      cli.action.stop(' done');

      // Add the source id to all of the documents
      fetchedMilestones = fetchedMilestones.map((item: any) => {
        return {
          ...item,
          zindexer_sourceid: currenSource.id,
        };
      });

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        milestonesIndex = (
          userConfig.elasticsearch.dataIndices.githubMilestones +
          getId(currenSource.name)
        ).toLocaleLowerCase();
      }
      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, milestonesIndex, esMapping);

      await esPushNodes(fetchedMilestones, milestonesIndex, eClient);

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        // Create an alias used for group querying
        cli.action.start(
          'Creating the Elasticsearch index alias: ' +
            userConfig.elasticsearch.dataIndices.githubMilestones,
        );
        await eClient.indices.putAlias({
          index: userConfig.elasticsearch.dataIndices.githubMilestones + '*',
          name: userConfig.elasticsearch.dataIndices.githubMilestones,
        });
        cli.action.stop(' done');
      }
    }
  }
}
