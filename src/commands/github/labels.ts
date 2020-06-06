import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import fetchNodesByQuery from '../../utils/github/utils/fetchNodesByQuery';
import ghClient from '../../utils/github/utils/ghClient';

import esClient from '../../utils/es/esClient';
import esGetActiveSources from '../../utils/es/esGetActiveSources';

import {
  esMapping,
  esSettings,
  fetchNodes,
  zConfig,
  ingestNodes,
} from '../../components/githubLabels';

import {
  getEsIndex,
  checkEsIndex,
  pushEsNodes,
  aliasEsIndex,
} from '../../components/esUtils/index';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Labels extends Command {
  static description = 'Github: Fetches labels attached to configured sources';

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
    const { flags } = this.parse(Labels);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.githubLabels,
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

    for (const currentSource of sources) {
      this.log('Processing source: ' + currentSource.name);
      cli.action.start(
        'Grabbing labels for: ' +
          currentSource.name +
          ' (ID: ' +
          currentSource.id +
          ')',
      );
      let fetchedLabels = await fetchData.load({
        repoId: currentSource.id,
      });
      cli.action.stop(' done');

      // Add the source id to all of the documents
      fetchedLabels = ingestNodes(fetchedLabels, 'zindexer', currentSource.id);

      const labelsIndex = getEsIndex(
        userConfig.elasticsearch.dataIndices.githubLabels,
        userConfig.elasticsearch.oneIndexPerSource,
        currentSource.name,
      );

      await checkEsIndex(eClient, labelsIndex, esMapping, esSettings, this.log);
      await pushEsNodes(eClient, labelsIndex, fetchedLabels, this.log);

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        // Create an alias used for group querying
        await aliasEsIndex(
          eClient,
          userConfig.elasticsearch.dataIndices.githubLabels,
          this.log,
        );
      }
    }
  }
}
