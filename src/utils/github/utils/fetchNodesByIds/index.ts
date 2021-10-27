import graphqlQuery from '../graphqlQuery';
import { performance } from 'perf_hooks';

export default class FetchNodesByIds {
  maxQueryIncrement: number;
  log: any; // eslint-disable-line
  cli: object;
  errorRetry: number;
  graphqlQuery: any;
  rateLimit: {
    limit: number;
    cost: number;
    remaining: number;
    resetAt: string | null;
  };
  ghClient: object;

  constructor(
    log: object,
    ghIncrement: number,
    cli: object,
    graphqlQuery: any, // eslint-disable-line
    ghClient: any, // eslint-disable-line
  ) {
    this.ghClient = ghClient;
    this.maxQueryIncrement = ghIncrement;

    this.log = log;
    this.cli = cli;
    this.errorRetry = 0;
    //this.getReposById = readFileSync(__dirname + '/../graphql/getReposById.graphql', 'utf8')
    this.graphqlQuery = graphqlQuery;

    this.rateLimit = {
      limit: 5000,
      cost: 1,
      remaining: 5000,
      resetAt: null,
    };
  }
  // eslint-disable-next-line
  public async load(loadRepos: Array<any>) {
    this.log('Fetching data for: ' + loadRepos.length + ' repos');
    const t0 = performance.now();

    const data = await graphqlQuery(
      this.ghClient,
      this.graphqlQuery,
      { nodesArray: loadRepos.map((r: any) => r.id) }, // eslint-disable-line
      this.rateLimit,
      this.log,
    );
    const t1 = performance.now();
    const callDuration = t1 - t0;

    if (data.data === undefined) {
      return []
    }

    if (data.data.nodes.length > 0) {
      const apiPerf = Math.round(
        data.data.nodes.length / (callDuration / 1000),
      );
      this.log('Fetched data at: ' + apiPerf + ' nodes/s');

      return data.data.nodes;
    } else {
      this.log(
        'ERROR: Unable to load data, this could be related to permissions',
      );
    }
    return [];
  }
}
