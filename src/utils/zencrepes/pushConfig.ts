import cli from 'cli-ux';
import { Config } from '../../global';

import esCheckIndex from '../es/esCheckIndex';
import esPushNodes from '../es/esPushNodes';
import esMappingConfig from '../mappings/config';

import fetchConfig from './fetchConfig';

// Pushes configuration to Elasticsearch for a specific dataset
const pushConfig = async (
  eClient: any,
  userConfig: Config,
  zencrepesConfig: any,
  datasetIndex: string,
) => {
  const configIndex = userConfig.elasticsearch.sysIndices.config;
  cli.action.start(
    'Pushing ZenCrepes UI default configuration to: ' + configIndex,
  );
  await esCheckIndex(eClient, userConfig, configIndex, esMappingConfig);
  const existingConfig = await fetchConfig(eClient, userConfig);
  if (
    existingConfig.find((c: any) => c.id === zencrepesConfig.id) === undefined
  ) {
    await esPushNodes(
      [
        {
          ...zencrepesConfig,
          esIndex: datasetIndex,
        },
      ],
      configIndex,
      eClient,
    );
  } else {
    console.log(
      'Config already present, skipping... (use zindexer zencrepes command to modify)',
    );
  }
  cli.action.stop(' done');
};
export default pushConfig;
