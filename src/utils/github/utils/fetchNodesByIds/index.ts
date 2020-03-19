import graphqlQuery from '../graphqlQuery';

export default class FetchNodesByIds {
  maxQueryIncrement: number;
  log: any; // eslint-disable-line
  cli: object;
  errorRetry: number;
  graphqlQuery: string;
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
    this.log('Started load');

    const data = await graphqlQuery(
      this.ghClient,
      this.graphqlQuery,
      { data_array: loadRepos.map((r: any) => r.id) }, // eslint-disable-line
      this.rateLimit,
      this.log,
    );

    if (data.data.nodes.length > 0) {
      return data.data.nodes;
    } else {
      this.log(
        'ERROR: Unable to load data, this could be related to permissions',
      );
    }
    return [];
  }
}
