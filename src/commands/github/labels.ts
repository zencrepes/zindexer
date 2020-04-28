import { flags } from '@oclif/command';
import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import esPushNodes from '../../utils/es/esPushNodes';
import fetchNodesByQuery from '../../utils/github/utils/fetchNodesByQuery';
import ghClient from '../../utils/github/utils/ghClient';
import esCheckIndex from '../../utils/es/esCheckIndex';

import esGetActiveSources from '../../utils/es/esGetActiveSources';
import { getId } from '../../utils/misc/getId';

import esMapping from '../../utils/github/labels/esMapping';
import fetchGql from '../../utils/github/labels/fetchGql';

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
  };

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);
    const gClient = await ghClient(userConfig.github);

    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');

    const fetchData = new fetchNodesByQuery(
      gClient,
      fetchGql,
      this.log,
      userConfig.github.fetch.maxNodes,
      this.config.configDir,
    );

    for (const currenSource of sources) {
      this.log('Processing source: ' + currenSource.name);
      cli.action.start(
        'Grabbing labels for: ' +
          currenSource.name +
          ' (ID: ' +
          currenSource.id +
          ')',
      );
      let fetchedLabels = await fetchData.load({ repoId: currenSource.id });
      cli.action.stop(' done');

      // Add the source id to all of the documents
      fetchedLabels = fetchedLabels.map((item: any) => {
        return {
          ...item,
          // eslint-disable-next-line @typescript-eslint/camelcase
          zindexer_sourceid: currenSource.id,
        };
      });

      let labelsIndex = userConfig.elasticsearch.dataIndices.githubLabels;
      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        labelsIndex = (
          userConfig.elasticsearch.dataIndices.githubLabels +
          getId(currenSource.name)
        ).toLocaleLowerCase();
      }

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, labelsIndex, esMapping);

      await esPushNodes(fetchedLabels, labelsIndex, eClient);

      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        // Create an alias used for group querying
        cli.action.start(
          'Creating the Elasticsearch index alias: ' +
            userConfig.elasticsearch.dataIndices.githubLabels,
        );
        await eClient.indices.putAlias({
          index: userConfig.elasticsearch.dataIndices.githubLabels + '*',
          name: userConfig.elasticsearch.dataIndices.githubLabels,
        });
        cli.action.stop(' done');
      }
    }
  }
}
