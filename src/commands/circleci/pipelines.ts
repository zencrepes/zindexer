import { flags } from '@oclif/command';

import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import { getId } from '../../utils/misc/getId';

import esGetActiveSources from '../../utils/es/esGetActiveSources';

import esMapping from '../../utils/circleci/pipelines/esMapping';
import zConfig from '../../utils/circleci/pipelines/zConfig';

import esCheckIndex from '../../utils/es/esCheckIndex';
import esPushNodes from '../../utils/es/esPushNodes';

import fetchData from '../../utils/circleci/utils/fetchData';

import pushConfig from '../../utils/zencrepes/pushConfig';

export default class Pipelines extends Command {
  static description = 'Fetches pipelines data from configured sources';

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
    const { flags } = this.parse(Pipelines);

    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    // Push Zencrepes configuration only if there was no previous configuration available
    await pushConfig(
      eClient,
      userConfig,
      zConfig,
      userConfig.elasticsearch.dataIndices.circleciPipelines,
      flags.reset,
    );

    if (flags.config === true) {
      return;
    }

    // Get active sources from Github only
    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');
    if (sources.length === 0) {
      this.error(
        'The script could not find any active sources. Please configure sources first.',
        { exit: 1 },
      );
    }
    for (const currentSource of sources) {
      console.log('Processing pipelines for source: ' + currentSource.name);

      let pipelinesIndex =
        userConfig.elasticsearch.dataIndices.circleciPipelines;
      if (userConfig.elasticsearch.oneIndexPerSource === true) {
        pipelinesIndex = (
          userConfig.elasticsearch.dataIndices.circleciPipelines +
          getId(currentSource.name)
        ).toLocaleLowerCase();
      }

      const fetchedPipelines = await fetchData(
        'project/gh/' + currentSource.name + '/pipeline',
        userConfig.circleci.token,
        [],
      );

      if (fetchedPipelines.length > 0) {
        // Check if index exists, create it if it does not
        await esCheckIndex(eClient, userConfig, pipelinesIndex, esMapping);

        // Before pushing nodes to ES, we replace id by nodeId
        // eslint-disable-next-line
        const pipelines = fetchedPipelines.map((pipeline: any) => {
          return {
            ...pipeline,
            source: currentSource,
            createdAt: pipeline.createdAt,
            updatedAt: pipeline.updatedAt,
            triggeredAt: pipeline.trigger.received_at,
          };
        });
        await esPushNodes(pipelines, pipelinesIndex, eClient);
      }
    }
    if (userConfig.elasticsearch.oneIndexPerSource === true) {
      // Create an alias used for group querying
      cli.action.start(
        'Creating the Elasticsearch index alias: ' +
          userConfig.elasticsearch.dataIndices.circleciPipelines,
      );
      await eClient.indices.putAlias({
        index: userConfig.elasticsearch.dataIndices.circleciPipelines + '*',
        name: userConfig.elasticsearch.dataIndices.circleciPipelines,
      });
      cli.action.stop(' done');
    }
  }
}
