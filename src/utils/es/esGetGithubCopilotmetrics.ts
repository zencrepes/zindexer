import cli from 'cli-ux';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import { ESSearchResponse } from '../../global';

const esGetGithubCopilotmetrics = async (client: Client, esIndex: string) => {
  cli.action.start(`Fetching all copilot metrics from Elasticsearch`);
  const searchResult: ApiResponse<ESSearchResponse<any>> = await client.search({
    index: esIndex,
    body: {
      query: {
        match_all: {},
      },
      size: 10000,
      sort: [
        {
          date: {
            order: 'desc',
          },
        },
      ],
    },
  });

  const copilotmetrics = searchResult.body.hits.hits;
  cli.action.stop(
    `Fetched a total of ${copilotmetrics.length} days containing copilot metrics`,
  );

  return copilotmetrics;
};

export default esGetGithubCopilotmetrics;
