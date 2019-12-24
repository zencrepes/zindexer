import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../base';
import esClient from '../utils/es/esClient';
import esGithubLatest from '../utils/es/esGithubLatest';
import esPushNodes from '../utils/es/esPushNodes';
import fetchNodesUpdated from '../utils/github/fetchNodesUpdated';
import ghClient from '../utils/github/ghClient';

import esGetActiveSources from '../utils/es/esGetActiveSources';
import { getId } from '../utils/misc/getId';

import getMilestones from '../utils/github/graphql/getMilestones';

export default class GMilestones extends Command {
  static description =
    'Github: Fetches milestones data from configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesUpdated(
      gClient,
      getMilestones,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currenSource of sources) {
      const milestonesIndex = (
        userConfig.elasticsearch.indices.githubMilestones +
        getId(currenSource.name)
      ).toLocaleLowerCase();
      this.log('Processing source: ' + currenSource.name);
      const recentMilestone = await esGithubLatest(eClient, milestonesIndex);
      cli.action.start(
        'Grabbing milestones for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      const fetchedMilestones = await fetchData.load(
        currenSource.id,
        recentMilestone,
      );
      cli.action.stop(' done');

      await esPushNodes(fetchedMilestones, milestonesIndex, eClient);
    }
  }
}
