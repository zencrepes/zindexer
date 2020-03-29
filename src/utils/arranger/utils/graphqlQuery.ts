import gql from 'graphql-tag';

async function graphqlQuery(
  client: any, // eslint-disable-line
  query: any, // eslint-disable-line
  variables: any, // eslint-disable-line
  log: any, // eslint-disable-line
) {
  let data: any = {}; // eslint-disable-line
  try {
    data = await client.query({
      query: gql`
        ${query}
      `,
      variables,
      operationName: null,
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    });
  } catch (error) {
    log(error);
    console.log(error.networkError.result.errors);
  }

  if (
    data.data !== undefined &&
    data.data.errors !== undefined &&
    data.data.errors.length > 0
  ) {
    data.data.errors.forEach((error: { message: string }) => {
      log(error.message);
    });
  }

  return data;
}
export default graphqlQuery;
