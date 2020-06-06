import { Client } from '@elastic/elasticsearch';

export const aliasEsIndex = async (
  eClient: Client,
  index: string,
  logger: Function,
) => {
  logger('Creating the Elasticsearch index alias: ' + index);
  await eClient.indices.putAlias({
    index: index + '*',
    name: index,
  });
};

export default aliasEsIndex;
