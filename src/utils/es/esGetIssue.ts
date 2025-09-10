import { ApiResponse, Client } from '@elastic/elasticsearch';

const esGetIssue = async (
  client: Client,
  esIndex: string,
  issuesGlobalIndex: string,
  id: string,
) => {
  const searchIssue: ApiResponse<any> = await client.search({
    index: esIndex,
    body: {
      query: {
        match: {
          'issue.node_id': id,
        },
      },
      _source: [
        'issue.title',
        'issue.number',
        'repository.owner.login',
        'repository.name',
      ],
    },
  });

  if (searchIssue.body.hits.hits[0] !== undefined) {
    return {
      title: searchIssue.body.hits.hits[0]._source.issue.title,
      number: searchIssue.body.hits.hits[0]._source.issue.number,
      org: searchIssue.body.hits.hits[0]._source.repository.owner.login,
      repository: searchIssue.body.hits.hits[0]._source.repository.name,
    };
  } else {
    console.log(
      `Issue not found in Elasticsearch index: ${id} for webhook events, switching to the general Issues index`,
    );
    const searchGlobalIssue: ApiResponse<any> = await client.search({
      index: issuesGlobalIndex,
      body: {
        query: {
          match: {
            id: id,
          },
        },
        _source: [
          'title',
          'number',
          'repository.owner.login',
          'repository.name',
        ],
      },
    });
    if (searchGlobalIssue.body.hits.hits[0] !== undefined) {
      return {
        title: searchGlobalIssue.body.hits.hits[0]._source.title,
        number: searchGlobalIssue.body.hits.hits[0]._source.number,
        org: searchGlobalIssue.body.hits.hits[0]._source.repository.owner.login,
        repository: searchGlobalIssue.body.hits.hits[0]._source.repository.name,
      };
    }

    console.log(
      `The issue with id ${id} was not found in the general Issues index ${issuesGlobalIndex} either.`,
    );
    return null;
  }
};

export default esGetIssue;
