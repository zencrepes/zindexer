import cli from 'cli-ux';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import { ESSearchResponse } from '../../global';

const esGetCardEventsSinceDate = async (
  client: Client,
  esIndex: string,
  startDate: string,
) => {

  cli.action.start(`Fetching project cards events recorded after: ${startDate}`);
  const searchResult: ApiResponse<ESSearchResponse<
      any
  >> = await client.search({
      index: esIndex,
      body: {
      query: {
        range: {
        'projects_v2_item.updated_at': {
          gte: startDate,
        },
        },
      },
      size: 10000,
      sort: [
        {
        'projects_v2_item.updated_at': {
          order: 'desc',
        },
        },
      ],
      },
    });

  const projectCardEvents = searchResult.body.hits.hits.map((h) => {
    return {
      type: h._source.projects_v2_item.content_type,
      id: h._source.projects_v2_item.content_node_id,
    }
  });
  cli.action.stop(`Fetched a total of  ${projectCardEvents.length} events`);

  return projectCardEvents
};

export default esGetCardEventsSinceDate;
