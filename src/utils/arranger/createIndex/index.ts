import gql from 'graphql-tag';

import graphqlQuery from '../utils/graphqlQuery';
import gqlCreateIndex from '../graphql/createIndex';
import { exit } from '@oclif/errors';

async function createProject(
  client: any, // eslint-disable-line
  log: any, // eslint-disable-line
  projectId: string,
  graphqlField: string,
  esIndex: string,
) {
  const data = await graphqlQuery(
    client,
    gqlCreateIndex,
    { projectId, graphqlField, esIndex },
    log,
  );
  if (data.data.newIndex !== undefined) {
    return true;
  }
  log('ERROR: Unable to create index');
  exit();
}
export default createProject;
