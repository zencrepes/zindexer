import cli from 'cli-ux';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import { ESSearchResponse, GithubNode } from '../../global';

const esGithubLatest = async (client: Client, esIndex: string) => {
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

  if (testIndex.body === false) {
    return null;
  }

  //Grab the latest node from an Elasticsearch index
  cli.action.start('Querying Elasticcearch');
  const esResults: ApiResponse<ESSearchResponse<
    GithubNode
  >> = await client.search({
    index: esIndex,
    body: {
      query: {
        match_all: {}, // eslint-disable-line
      },
      size: 1,
      sort: [
        {
          updatedAt: {
            order: 'desc',
          },
        },
      ],
    },
  });
  let recentIssue: GithubNode | null = null;
  if (esResults.body.hits.hits.length > 0) {
    recentIssue = esResults.body.hits.hits[0]._source;
  }
  cli.action.stop(' done');
  return recentIssue;
};

export default esGithubLatest;
