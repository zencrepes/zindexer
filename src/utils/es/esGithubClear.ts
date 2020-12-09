import cli from 'cli-ux';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import { ESSearchResponse, GithubNode } from '../../global';

const esGithubClear = async (
  client: Client,
  esIndex: string,
  sourceId: string,
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
  cli.action.stop(' done');

  if (testIndex.statusCode === 404) {
    return null;
  }

  //Grab the latest node from an Elasticsearch index
  cli.action.start('Deleting all previous nodes for source with id: ' + sourceId);
  await client.deleteByQuery({
    index: esIndex,
    body: {
      query: {
        match: {
          zindexerSourceId: {
            query: sourceId,
          },
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/camelcase
    wait_for_completion: true,
  });
  cli.action.stop(' done');
};

export default esGithubClear;
