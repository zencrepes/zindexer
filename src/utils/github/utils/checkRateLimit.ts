/*
    Check if rate limit is reached, and if so, wait for the rate limit to reset
*/

import sleep from "../../misc/sleep";

export const checkRateLimit = async (resetAt: number, remainingTokens: number, submissionBuffer: number = 5) => {
  // Submission buffer is necessary when performing queries/mutations in batches,
  // It corresponds to the number of tokens that are expected to be consumed before the next time
  // the code goes through checkRateLimit
  if (remainingTokens <= submissionBuffer && resetAt !== null) {
    console.log(
      new Date().toISOString() +
        ': Exhausted all available tokens, will resuming querying after ' +
        new Date(resetAt * 1000),
    );
    const sleepDuration =
      new Date(resetAt * 1000).getTime() - new Date().getTime();
    console.log(
      new Date().toISOString() +
        ': Will resume querying in: ' +
        sleepDuration +
        's',
    );
    await sleep(sleepDuration + 600000); // (Pausing for an extra 10mn after retry time)
    console.log(new Date().toISOString() + ': Ready to resume querying');
  }
};
export default checkRateLimit;
