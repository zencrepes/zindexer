/*
    Handle mutation of GraphQL nodes with the GitHub API
*/

import GQL_RATELIMIT from './graphql/getRateLimit.graphql';
import checkRateLimit from './utils/checkRateLimit';
import sleep from '../../utils/misc/sleep';

interface options {
  rateLimitCheck: number; // Every X mutations, perform a GraphQL call to check the rate limits
}

export const mutateGithubNodes = async (ghClient: any, nodes: any[], mutationQuery: any, getMutationVariables: any, progressData: any, postMutationFunction: any, options: Partial<options> = {}) => {
  let data: any = {}; // eslint-disable-line
  let cpt = 0;
  let totalCpt = 0;
  const {
    rateLimitCheck = 100
  } = options;

  console.log(`Will trigger the mutation of ${nodes.length} nodes`);

  for (const node of nodes) {
    // Reset the counter
    if (cpt === rateLimitCheck) {
      cpt = 0
    }
    // Checking rate limit every rateLimitCheck requests
    if (cpt === 0) {
      try {
        data = await ghClient.query({
          query: GQL_RATELIMIT,
          fetchPolicy: 'no-cache',
          errorPolicy: 'ignore',
        });
      } catch (error) {
        console.log(JSON.stringify(GQL_RATELIMIT));
        console.log('There was an error performing the GraphQL query to collect rateLimit data');
        console.log(error);
      }
      if (data.data.rateLimit !== undefined) {
        console.log(
          'GitHub Tokens - remaining: ' +
            data.data.rateLimit.remaining +
            ' query cost: ' +
            data.data.rateLimit.cost +
            ' (token will reset at: ' +
            data.data.rateLimit.resetAt +
            ')',
        );
        await checkRateLimit(data.data.rateLimit.resetAt, data.data.rateLimit.remaining, 105);
      } else {
        process.exit()
      }
      cpt = 0;
    }
    cpt++;
    totalCpt++;

    // Updating nodes one by one
    console.log(`${totalCpt}/${nodes.length} ${progressData(node)}`);
    try {
      data = await ghClient.query({
        query: mutationQuery,
        variables: getMutationVariables(node),
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      });
    } catch (error) {
      console.log(JSON.stringify(mutationQuery));
      console.log('There was an error performing the GraphQL query to mutate the node');
      console.log(error);
    }
    await sleep(250);

    if (
      data.data !== undefined &&
      data.data.errors !== undefined &&
      data.data.errors.length > 0
    ) {
      data.data.errors.forEach((error: { message: string }) => {
        console.log(error.message);
      });
    } else {
      if (postMutationFunction !== undefined && postMutationFunction !== null) {
        await postMutationFunction(node)
      }
    }
  }
};
export default mutateGithubNodes;
