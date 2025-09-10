import { ApiResponse, Client } from '@elastic/elasticsearch';
const esGetPr = async (client: Client, esIndex: string, id: string) => {
  try {
    const searchPr: ApiResponse<any> = await client.get({
      index: esIndex,
      id: id,
    });

    if (searchPr.body?._source !== undefined) {
      return {
        title: searchPr.body._source.title,
        number: searchPr.body._source.number,
        org: searchPr.body._source.repository?.owner?.login,
        repository: searchPr.body._source.repository?.name,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching PR with id ${id} from index ${esIndex}:`,
      error,
    );
    return null;
  }
};

export default esGetPr;
