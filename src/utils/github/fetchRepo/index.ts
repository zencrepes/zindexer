import cli from 'cli-ux';

import getSingleRepo from '../graphql/getSingleRepo';
import graphqlQuery from '../utils/graphqlQuery';

export default class FetchRepo {
  gClient: any; // eslint-disable-line
  maxQueryIncrement: number;
  log: any; // eslint-disable-line
  cli: object;
  fetchedRepos: Array<object>;
  errorRetry: number;
  getSingleRepo: string;
  rateLimit: {
    limit: number;
    cost: number;
    remaining: number;
    resetAt: string | null;
  };

  // eslint-disable-next-line
  constructor(gClient: any, log: object, ghIncrement: number, cli: object) {
    this.gClient = gClient;
    this.maxQueryIncrement = ghIncrement;

    this.log = log;
    this.cli = cli;
    this.fetchedRepos = [];
    this.errorRetry = 0;
    //this.getSingleRepo = readFileSync(__dirname + '/../graphql/getSingleRepo.graphql', 'utf8')
    this.getSingleRepo = getSingleRepo;

    this.rateLimit = {
      limit: 5000,
      cost: 1,
      remaining: 5000,
      resetAt: null,
    };
  }

  public async load(login: string, repo: string) {
    this.log('Started load');

    cli.action.start('Loading repository: ' + login + '/' + repo);
    const data = await graphqlQuery(
      this.gClient,
      this.getSingleRepo,
      { org_name: login, repo_name: repo }, // eslint-disable-line
      this.rateLimit,
      this.log,
    );
    if (data.data.repository !== null) {
      const repoObj = JSON.parse(JSON.stringify(data.data.repository)); //TODO - Replace this with something better to copy object ?
      repoObj.org = {
        login: data.data.repository.owner.login,
        name: data.data.repository.owner.login,
        id: data.data.repository.owner.id,
        url: data.data.repository.owner.url,
      };
      this.fetchedRepos.push(repoObj);
    } else {
      this.log(
        'ERROR: Either this repository does not exist, or you do not have the necessary permissions',
      );
    }

    cli.action.stop(' completed');
    return this.fetchedRepos;
  }
}
