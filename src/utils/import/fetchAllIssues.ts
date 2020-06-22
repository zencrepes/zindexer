import cli from 'cli-ux';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import { ESSearchResponse, GithubNode } from '../../global';

const esPagination = async (
  client: Client,
  esIndex: string,
  from: number,
  size: number,
  total: number,
  issues: any[],
) => {
  cli.action.start('Querying Elasticsearch');
  const esResults: ApiResponse<ESSearchResponse<
    GithubNode
  >> = await client.search({
    index: esIndex,
    body: {
      from,
      size,
      query: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        match_all: {},
      },
      sort: [
        {
          createdAt: {
            order: 'desc',
          },
        },
      ],
    },
  });
  if (esResults.body.hits.hits.length > 0) {
    const newIssues = esResults.body.hits.hits.map(i => i._source);
    issues = [...issues, ...newIssues];
  }
  if (total > issues.length) {
    issues = await esPagination(
      client,
      esIndex,
      issues.length,
      size,
      total,
      issues,
    );
  }
  cli.action.stop(' done');
  return issues;
};

const fetchAllIssues = async (
  client: Client,
  esIndex: string,
  windowSize: number,
) => {
  // Ensure index exists in Elasticsearch
  cli.action.start('Checking if index: ' + esIndex + ' exists');
  let issues: any[] = [];

  const healthCheck: ApiResponse = await client.cluster.health();
  if (healthCheck.body.status === 'red') {
    console.log('Elasticsearch cluster is not in an healthy state, exiting');
    console.log(healthCheck.body);
    process.exit(1);
  }
  cli.action.stop(' done');

  const countDocuments: ApiResponse = await client.count({
    index: esIndex,
    body: {
      query: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        match_all: {},
      },
    },
  });

  const docCount = countDocuments.body.count;

  issues = await esPagination(client, esIndex, 0, windowSize, docCount, issues);

  return issues;
};

export default fetchAllIssues;
