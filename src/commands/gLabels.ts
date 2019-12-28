import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../base';
import esClient from '../utils/es/esClient';
import esGithubLatest from '../utils/es/esGithubLatest';
import esPushNodes from '../utils/es/esPushNodes';
import fetchNodesByQuery from '../utils/github/fetchNodesByQuery';
import ghClient from '../utils/github/ghClient';

import esGetActiveSources from '../utils/es/esGetActiveSources';
import { getId } from '../utils/misc/getId';

import getLabels from '../utils/github/graphql/getLabels';

export default class GLabels extends Command {
  static description = 'Github: Fetches labels attached to configured sources';

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesByQuery(
      gClient,
      getLabels,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currenSource of sources) {
      const labelsIndex = (
        userConfig.elasticsearch.indices.githubLabels + getId(currenSource.name)
      ).toLocaleLowerCase();
      this.log('Processing source: ' + currenSource.name);
      cli.action.start(
        'Grabbing labels for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      const fetchedLabels = await fetchData.load({ repoId: currenSource.id });
      cli.action.stop(' done');

      await esPushNodes(fetchedLabels, labelsIndex, eClient);
    }
  }
}
