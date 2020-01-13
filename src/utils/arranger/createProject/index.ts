import gql from 'graphql-tag';

import graphqlQuery from '../utils/graphqlQuery';
import gqlCreateProject from '../graphql/createProject';
import { exit } from '@oclif/errors';

async function createProject(
  client: any, // eslint-disable-line
  log: any, // eslint-disable-line
  projectId: string,
) {
  const data = await graphqlQuery(client, gqlCreateProject, { projectId }, log);
  const createdProject = data.data.newProject.find(
    (p: { id: string }) => p.id === projectId,
  );
  if (createdProject !== undefined) {
    return createdProject;
  }
  log('ERROR: Unable to create project');
  exit();
}
export default createProject;
