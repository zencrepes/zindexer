import graphqlQuery from '../utils/graphqlQuery';
import { exit } from '@oclif/errors';

async function saveAggsState(
  client: any, // eslint-disable-line
  log: any, // eslint-disable-line
  projectId: string,
  graphqlField: string,
  gqlQuery: string,
  state: any, // eslint-disable-line
) {
  const data = await graphqlQuery(
    client,
    gqlQuery,
    { projectId, graphqlField, state },
    log,
  );
  if (data.data !== undefined) {
    return true;
  }

  log('ERROR: Unable to create index');
  exit();
}
export default saveAggsState;
