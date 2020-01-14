import graphqlQuery from '../utils/graphqlQuery';
import gqlDeleteProject from '../graphql/deleteProject';
import { exit } from '@oclif/errors';

async function deleteProject(
  client: any, // eslint-disable-line
  log: any, // eslint-disable-line
  projectId: string,
) {
  const data = await graphqlQuery(client, gqlDeleteProject, { projectId }, log);

  if (data.data.deleteProject.length === 0) {
    return true;
  }
  log('ERROR: Unable to create project');
  exit();
}
export default deleteProject;
