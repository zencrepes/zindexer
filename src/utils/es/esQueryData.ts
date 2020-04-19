import cli from 'cli-ux';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import { ESSearchResponse, ESIndexSources } from '../../global';

const esQueryData = async (
  client: Client,
  esIndex: string,
  esQuery: any, // eslint-disable-line
) => {
  // Ensure index exists in Elasticsearch
  cli.action.start('Checking if index: ' + esIndex + ' exists');

  const healthCheck: ApiResponse = await client.cluster.health();
  if (healthCheck.body.status === 'red') {
    console.log('Elasticsearch cluster is not in an healthy state, exiting');
    console.log(healthCheck.body);
    process.exit(1);
  }
  const testIndex = await client.indices.exists({
    index: esIndex,
  });
  if (testIndex.body === false) {
    console.error(
      'Index: ' + esIndex + ' does not exists, please fix that first',
      { exit: 1 },
    );
  }
  cli.action.stop(' done');

  //Grab the active repositories from Elasticsearch
  console.log('=====================================================');
  console.log('ES INDEX: ' + esIndex);
  console.log('ES QUERY:');
  console.log(JSON.stringify(esQuery));
  console.log('=====================================================');
  cli.action.start('Querying Elasticsearch');
  const esRepos: ApiResponse<ESSearchResponse<
    ESIndexSources
  >> = await client.search({
    index: esIndex,
    body: esQuery,
  });
  //console.log(esRepos.body.hits.hits);
  const esData = esRepos.body.hits.hits.map(r => r._source);
  cli.action.stop(' done');
  return esData;
};

export default esQueryData;
