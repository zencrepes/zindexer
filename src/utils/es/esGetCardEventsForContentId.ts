import cli from 'cli-ux';
import { ApiResponse, Client } from '@elastic/elasticsearch';

import { ESSearchResponse } from '../../global';

const esGetCardEventsForContentId = async (
  client: Client,
  esIndex: string,
  id: string,
) => {

  cli.action.start(`Fetching all previous events for content id: ${id}`);
  const searchResult: ApiResponse<ESSearchResponse<
      any
  >> = await client.search({
      index: esIndex,
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  "projects_v2_item.content_node_id": id
                }
              }
            ],
          }
        },
        _source: [
          "action",
          "projects_v2_item.node_id",
          "projects_v2_item.updated_at",
          "projects_v2_item.project_node_id",
          "sender.node_id",
          "sender.login",
          "changes",
        ],        
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
      id: h._source.projects_v2_item.node_id,
      action: h._source.action,
      date: h._source.projects_v2_item.updated_at,
      projectItem: {
        id: h._source.projects_v2_item.node_id,
      },
      project: {
        id: h._source.projects_v2_item.project_node_id,
      },       
      sender: {
        id: h._source.sender.node_id,
        login: h._source.sender.login,
      },
      change: h._source.changes,
    }
  });
  cli.action.stop(`Fetched a total of ${projectCardEvents.length} events`);

  return projectCardEvents
};

export default esGetCardEventsForContentId;
