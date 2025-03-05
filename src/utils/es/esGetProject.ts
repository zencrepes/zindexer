import { ApiResponse, Client } from '@elastic/elasticsearch';

const esGetProject = async (
  client: Client,
  esIndex: string,
  id: string,
) => {
  console.log(`Fetching project data for ID: ${id}`);

  let getProject: ApiResponse<any>;
  try {
    getProject = await client.get({
      index: esIndex,
      id: id
    });
  } catch (error: any) {
    console.log(error.meta.body.error)
    if (error.meta.statusCode === 404) {
      console.log(`Project with ID: ${id} not found. It was likely deleted`);
      return {
        id: id,
        title: 'Project not found',
        number: 0,
      }
    } else {
      throw error;
    }
  }

  if (getProject.body._source !== undefined) {
    return {
      id: id,
      title: getProject.body._source.projects_v2.title,
      number: getProject.body._source.projects_v2.number,
    }
  } else {
    return null
  }  
};

export default esGetProject;
