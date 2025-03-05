import { ApiResponse, Client } from '@elastic/elasticsearch';

const esGetPr = async (
  client: Client,
  esIndex: string,
  id: string,
) => {

  const searchPr: ApiResponse<any> = await client.get({
    index: esIndex,
    id: id
  });

  if (searchPr.body._source !== undefined) {
    return {
      title: searchPr.body._source.title,
      number: searchPr.body._source.number,
      org: searchPr.body._source.repository.owner.login,
      repository: searchPr.body._source.repository.name,
    }
  } else {
    return null
  }  
};

export default esGetPr;
