import { flags } from '@oclif/command';

import cli from 'cli-ux';

import Command from '../../base';
import esClient from '../../utils/es/esClient';
import { getId } from '../../utils/misc/getId';

import esGetActiveSources from '../../utils/es/esGetActiveSources';

import esMapping from '../../utils/circleci/pipelines/esMapping';
import esCheckIndex from '../../utils/es/esCheckIndex';
import esPushNodes from '../../utils/es/esPushNodes';

import fetchData from '../../utils/circleci/utils/fetchData';

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
  };

  async run() {
    const userConfig = this.userConfig;
    const eClient = await esClient(userConfig.elasticsearch);

    // Get active sources from Github only
    const sources = await esGetActiveSources(eClient, userConfig, 'GITHUB');
    if (sources.length === 0) {
      this.error(
        'The script could not find any active sources. Please configure sources first.',
        { exit: 1 },
      );
    }
    for (const currenSource of sources) {
      const pipelinesIndex = (
        userConfig.elasticsearch.dataIndices.circleciPipelines +
        getId(currenSource.name)
      ).toLocaleLowerCase();

      const fetchedPipelines = await fetchData(
        'project/gh/' + currenSource.name + '/pipeline',
        userConfig.circleci.token,
        [],
      );

      // Check if index exists, create it if it does not
      await esCheckIndex(eClient, userConfig, pipelinesIndex, esMapping);

      // Before pushing nodes to ES, we replace id by nodeId
      // eslint-disable-next-line
      const pipelines = fetchedPipelines.map((pipeline: any) => {
        if (pipeline.id !== undefined) {
          pipeline.nodeId = pipeline.id;
          delete pipeline.id;
        }
        return pipeline;
      });
      await esPushNodes(pipelines, pipelinesIndex, eClient);

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
