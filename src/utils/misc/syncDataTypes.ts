import { Config } from '../../global';
import ymlMappingsTypes from '../../schemas/types';
import esCheckIndex from '../../utils/es/esCheckIndex';

// Synchronize data types between config file and Elasticsearch
// For now it doesn't handle removal of outdated index types
// eslint-disable-next-line
const syncDataTypes = async (eClient: any, userConfig: Config) => {
  //  Check if index exists, create if it does not
  await esCheckIndex(
    eClient,
    userConfig,
    userConfig.elasticsearch.indices.types,
    ymlMappingsTypes,
  );

  // There can only be one key, so we give this key the value
  const esPayload: Array<any> = []; // eslint-disable-line
  for (const [type, index] of Object.entries(
    userConfig.elasticsearch.indices,
  )) {
    esPayload.push({
      type,
      index,
    });
  }

  console.log('Pushing types data to Elastic search');
  let formattedData = '';
  for (const rec of esPayload) {
    formattedData =
      formattedData +
      JSON.stringify({
        index: {
          _index: userConfig.elasticsearch.indices.types,
          _id: (rec as any).type, // eslint-disable-line
        },
      }) +
      '\n' +
      JSON.stringify(rec) +
      '\n';
  }
  await eClient.bulk({
    index: userConfig.elasticsearch.indices.types,
    refresh: 'wait_for',
    body: formattedData,
  });
};
export default syncDataTypes;
