import graphqlQuery from '../utils/graphqlQuery';
import gqlGetProjects from '../graphql/getProjects';

async function getProjects(
  client: any, // eslint-disable-line
  log: any, // eslint-disable-line
) {
  const data = await graphqlQuery(client, gqlGetProjects, {}, log);
  return data.data.projects;
}
export default getProjects;
