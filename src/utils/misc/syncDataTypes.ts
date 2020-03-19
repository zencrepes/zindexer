import { Config } from '../../global';
import ymlMappingsTypes from '../mappings/types';
import esCheckIndex from '../../utils/es/esCheckIndex';

// Synchronize data types between config file and Elasticsearch
// For now it doesn't handle removal of outdated index types
// eslint-disable-next-line
const syncDataTypes = async (eClient: any, userConfig: Config) => {
  //  Check if index exists, create if it does not
  await esCheckIndex(
    eClient,
    userConfig,
    userConfig.elasticsearch.sysIndices.types,
    ymlMappingsTypes,
  );

  // There can only be one key, so we give this key the value
  const esPayload: Array<any> = []; // eslint-disable-line
  for (const [key, esIndex] of Object.entries(
    userConfig.elasticsearch.sysIndices,
  )) {
    esPayload.push({
      key,
      esIndex,
      type: 'system',
    });
  }
  for (const [key, esIndex] of Object.entries(
    userConfig.elasticsearch.dataIndices,
  )) {
    esPayload.push({
      key,
      esIndex,
      type: 'data',
    });
  }

  console.log('Pushing types data to Elastic search');
  let formattedData = '';
  for (const rec of esPayload) {
    formattedData =
      formattedData +
      JSON.stringify({
        index: {
          _index: userConfig.elasticsearch.sysIndices.types,
          _id: (rec as any).key, // eslint-disable-line
        },
      }) +
      '\n' +
      JSON.stringify(rec) +
      '\n';
  }
  await eClient.bulk({
    index: userConfig.elasticsearch.sysIndices.types,
    refresh: 'wait_for',
    body: formattedData,
  });
};
export default syncDataTypes;
