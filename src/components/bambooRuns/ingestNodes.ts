interface BambooRun {
  id: string;
  key: string;
  number: number;
  buildStartedTime: string;
  buildCompletedTime: string;
  buildDurationInSeconds: number;
  successfulTestCount: number;
  failedTestCount: number;
  quarantinedTestCount: number;
  skippedTestCount: number;
  successful: string;
  state: string;
  plan: {
    key: string;
    shortKey: string;
    shortName: string;
    name: string;
  }
  url: string;
  'status-code'?: number;
}

const ingestNodes = (
  nodes: BambooRun[],
  source: any,
  zsource: string,
) => {
  // Removing all runs that might not exist on the server
  const updatedNodes = nodes.filter((item: BambooRun) => item['status-code'] === undefined).map((item: BambooRun) => {
    // console.log(item);
    const runTotal: number = item.successfulTestCount + item.failedTestCount + item.quarantinedTestCount + item.skippedTestCount
    return {
      id: source.id + '-' + item.key,
      key: item.key,
      plan: {
        id: item.plan.key,
        shortKey: item.plan.shortKey,
        name: item.plan.shortName,
        project: {
          id: item.plan.key.replace('-' + item.plan.shortKey, ''),
          name: item.plan.name.replace(item.plan.shortName, ''),
        }
      },    
      name: item.key,
      number: item.number,
      startedAt: item.buildStartedTime,
      completedAt: item.buildCompletedTime,
      duration: item.buildDurationInSeconds,
      runTotal: runTotal,
      runSuccess: item.successfulTestCount,
      runSuccessRate: item.successfulTestCount * 100 / runTotal,
      runFailure: item.failedTestCount,
      runFailureRate: item.failedTestCount * 100 / runTotal,
      runSkipped: item.skippedTestCount,
      runQuarantined: item.quarantinedTestCount,
      successful: item.successful,
      state: item.state,
      url: item.url,
      withTests: runTotal > 0 ? true: false,
      zsource,
      zindexerSourceId: source.id
    }
  });
  return updatedNodes;
};

export default ingestNodes;
