import * as jsYaml from 'js-yaml';
import { ApiResponse, Client } from '@elastic/elasticsearch';

const checkEsIndex = async (
  client: Client,
  index: string,
  YmlMapping: string,
  YmlSettings: string,
  logger: Function,
) => {
  logger('Checking if index: ' + index + ' exists');
  const healthCheck: ApiResponse = await client.cluster.health();
  if (healthCheck.body.status === 'red') {
    logger(
      'WARNING ==== Elasticsearch cluster is not in an healthy state ==== WARNING',
    );
    logger(healthCheck.body);
  }
  const testIndex: any = await client.indices.exists({ index: index });
  if (testIndex.body === false) {
    logger('Elasticsearch Index ' + index + ' does not exist, creating');
    const mappings = await jsYaml.safeLoad(YmlMapping);
    const settings = await jsYaml.safeLoad(YmlSettings);
    await client.indices.create({
      index: index,
      body: { settings, mappings },
    });
  }
};

export default checkEsIndex;
