import cli from 'cli-ux';
import { Config } from '../../global';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import { ESSearchResponse, ESIndexSources } from '../../global';

const esGetRemoteLinksSources = async (
  client: Client,
  userConfig: Config,
  type: string,
) => {
  // Ensure index exists in Elasticsearch
  cli.action.start(
    'Checking if index: ' +
      userConfig.elasticsearch.sysIndices.sources +
      ' exists',
  );

  const healthCheck: ApiResponse = await client.cluster.health();
  if (healthCheck.body.status === 'red') {
    console.log('Elasticsearch cluster is not in an healthy state, exiting');
    console.log(healthCheck.body);
    process.exit(1);
  }
  const testIndex = await client.indices.exists({
    index: userConfig.elasticsearch.sysIndices.sources,
  });
  if (testIndex.statusCode === 404) {
    console.error(
      'Index: ' +
        userConfig.elasticsearch.sysIndices.sources +
        ' does not exists, please configure repositories first',
      { exit: 1 },
    );
  }
  cli.action.stop(' done');

  //Grab the active repositories from Elasticsearch
  cli.action.start('Grabbing the active repositories from ElasticSearch');
  const esRepos: ApiResponse<ESSearchResponse<
    ESIndexSources
  >> = await client.search({
    index: userConfig.elasticsearch.sysIndices.sources,
    body: {
      from: 0,
      size: 10000,
      query: {
        bool: {
          filter: [
            {
              // eslint-disable-next-line
              match_phrase: {
                type: {
                  query: type,
                },
              },
            },
            {
              // eslint-disable-next-line
              match_phrase: {
                remoteLinks: {
                  query: true,
                },
              },
            },
          ],
        },
      },
    },
  });
  //console.log(esRepos.body.hits.hits);
  const activeRepos = esRepos.body.hits.hits.map(r => r._source);
  cli.action.stop(' done');
  return activeRepos;
};

export default esGetRemoteLinksSources;
