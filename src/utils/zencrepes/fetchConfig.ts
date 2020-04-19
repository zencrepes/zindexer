import { Config } from '../../global';
import ymlMappingsDatasets from '../mappings/datasets';
import esCheckIndex from '../es/esCheckIndex';

import esQueryData from '../es/esQueryData';

const fetchConfig = async (eClient: any, userConfig: Config) => {
  const configData = await esQueryData(
    eClient,
    userConfig.elasticsearch.sysIndices.config,
    {
      from: 0,
      size: 10000,
      query: {
        match_all: {}, // eslint-disable-line
      },
    },
  );

  return configData;
};
export default fetchConfig;
