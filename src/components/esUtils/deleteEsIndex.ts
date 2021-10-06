import { Client } from '@elastic/elasticsearch';

export const deleteEsIndex = async (
  eClient: Client,
  index: string,
  logger: Function,
) => {
  logger('Deleting the Elasticsearch index: ' + index);
  await eClient.indices.delete({
    index: index,
  });
};

export default deleteEsIndex;
