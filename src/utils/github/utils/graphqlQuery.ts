async function sleep(ms: number) {
  //https://github.com/Microsoft/tslint-microsoft-contrib/issues/355
  // tslint:disable-next-line no-string-based-set-timeout
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function graphqlQuery(
  client: any, // eslint-disable-line
  query: any, // eslint-disable-line
  variables: any, // eslint-disable-line
  rateLimit: any, // eslint-disable-line
  log: any, // eslint-disable-line
) {
  //  log('Remaining GitHub tokens: ' + rateLimit.remaining);
  // Logic to pause if remaining ratelimit is lower than 50
  if (rateLimit.remaining - rateLimit.cost < 50 && rateLimit.resetAt !== null) {
    log(
      'No token available, will resuming querying after ' + rateLimit.resetAt,
    );
    const sleepDuration =
      (new Date(rateLimit.resetAt).getTime() - new Date().getTime()) / 1000;
    log('Will resume querying in: ' + sleepDuration + 's');
    await sleep(sleepDuration + 10000);
    log('Ready to resume querying');
  }
  let data: any = {}; // eslint-disable-line
  try {
    data = await client.query({
      query,
      variables,
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    });
  } catch (error) {
    console.log(JSON.stringify(query));
    console.log(variables);
    console.log('THIS IS AN ERROR');
    log(error);
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
  }

  return data;
}
export default graphqlQuery;
