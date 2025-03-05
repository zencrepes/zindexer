import { ApiResponse, Client } from '@elastic/elasticsearch';

const esGetIssue = async (
  client: Client,
  esIndex: string,
  id: string,
) => {

  const searchIssue: ApiResponse<any> = await client.search({
    index: esIndex,
    body: {
      query: {
        match: {
          'issue.node_id': id
        }
      },
      _source: [
        "issue.title",
        "issue.number",
        "repository.owner.login",
        "repository.name",
      ]      
    }
  });

  if (searchIssue.body.hits.hits[0] !== undefined) {
    return {
      title: searchIssue.body.hits.hits[0]._source.issue.title,
      number:searchIssue.body.hits.hits[0]._source.issue.number,
      org: searchIssue.body.hits.hits[0]._source.repository.owner.login,
      repository: searchIssue.body.hits.hits[0]._source.repository.name,
    }
  } else {
    return null
  }
};

export default esGetIssue;
