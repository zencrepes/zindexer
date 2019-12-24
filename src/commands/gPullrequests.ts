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

import getPullrequests from '../utils/github/graphql/getPullrequests';

export default class GPullrequests extends Command {
  static description =
    'Github: Fetches Pullrequests data from configured sources';

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
      getPullrequests,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currenSource of sources) {
      const pullrequestsIndex = (
        userConfig.elasticsearch.indices.githubPullrequests +
        getId(currenSource.name)
      ).toLocaleLowerCase();
      this.log('Processing source: ' + currenSource.name);
      const recentPullrequest = await esGithubLatest(
        eClient,
        pullrequestsIndex,
      );
      cli.action.start(
        'Grabbing pullrequests for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      const fetchedPullrequests = await fetchData.load(
        currenSource.id,
        recentPullrequest,
      );
      cli.action.stop(' done');

      await esPushNodes(fetchedPullrequests, pullrequestsIndex, eClient);
    }
  }
}
