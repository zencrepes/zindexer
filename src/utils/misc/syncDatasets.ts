import { Config } from '../../global';
import ymlMappingsDatasets from '../mappings/datasets';
import esCheckIndex from '../es/esCheckIndex';
import fetchConfig from '../zencrepes/fetchConfig';

// Synchronize data types between config file and Elasticsearch
// For now it doesn't handle removal of outdated index types
// eslint-disable-next-line
const syncDataDatasets = async (eClient: any, userConfig: Config) => {
  //  Check if index exists, create if it does not
  await esCheckIndex(
    eClient,
    userConfig,
    userConfig.elasticsearch.sysIndices.config,
    ymlMappingsDatasets,
  );

  const currentConfig = await fetchConfig(eClient, userConfig);

  // There can only be one key, so we give this key the value
  const esPayload: Array<any> = []; // eslint-disable-line
  for (const [key, esIndex] of Object.entries(
    userConfig.elasticsearch.sysIndices,
  )) {
    let configEsIndex: any = currentConfig.find((c: any) => c.key === key);
    if (configEsIndex === undefined) {
      configEsIndex = { facets: [] };
    }
    esPayload.push({
      ...configEsIndex,
      key,
      esIndex,
      type: 'system',
      active: false,
      name: 'key',
    });
  }
  for (const [key, esIndex] of Object.entries(
    userConfig.elasticsearch.dataIndices,
  )) {
    let configEsIndex: any = currentConfig.find((c: any) => c.key === key);
    if (configEsIndex === undefined) {
      configEsIndex = { facets: [] };
    }
    esPayload.push({
      ...configEsIndex,
      key,
      esIndex,
      type: 'data',
      active: true,
      name: 'key',
    });
  }

  console.log('Pushing datasets data to Elasticsearch');
  let formattedData = '';
  for (const rec of esPayload) {
    formattedData =
      formattedData +
      JSON.stringify({
        index: {
          _index: userConfig.elasticsearch.sysIndices.config,
          _id: (rec as any).key, // eslint-disable-line
        },
      }) +
      '\n' +
      JSON.stringify(rec) +
      '\n';
  }
  await eClient.bulk({
    index: userConfig.elasticsearch.sysIndices.config,
    refresh: 'wait_for',
    body: formattedData,
  });
};
export default syncDataDatasets;
