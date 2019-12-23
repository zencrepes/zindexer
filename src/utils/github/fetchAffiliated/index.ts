import cli from 'cli-ux';
//import {readFileSync} from 'fs'
import * as _ from 'lodash';

import getOrgs from '../graphql/getOrgs';
import getRepos from '../graphql/getRepos';
import getUserRepos from '../graphql/getUserRepos';
import calculateQueryIncrement from '../utils/calculateQueryIncrement';
import graphqlQuery from '../utils/graphqlQuery';

import { GithubOrganization, GithubRepository } from '../../../global';

export default class FetchAffiliated {
  githubLogin: string;
  maxQueryIncrement: number;
  log: any; // eslint-disable-line
  cli: object;
  error: any; // eslint-disable-line
  fetchedRepos: Array<GithubRepository>;
  githubOrgs: Array<GithubOrganization>;
  errorRetry: number;
  totalReposCount: number;
  orgReposCount: any; // eslint-disable-line
  getOrgs: string;
  getRepos: string;
  getUserRepos: string;
  rateLimit: {
    limit: number;
    cost: number;
    remaining: number;
    resetAt: string | null;
  };
  gClient: any; // eslint-disable-line

  constructor(
    gClient: any, // eslint-disable-line
    log: object,
    error: object,
    ghLogin: string,
    ghIncrement: number,
    cli: object,
  ) {
    this.githubLogin = ghLogin;
    this.maxQueryIncrement = ghIncrement;
    this.gClient = gClient;

    this.log = log;
    this.error = error;
    this.cli = cli;
    this.fetchedRepos = [];
    this.githubOrgs = [];
    this.totalReposCount = 0;
    this.orgReposCount = {};
    this.errorRetry = 0;
    this.getOrgs = getOrgs;
    this.getRepos = getRepos;
    this.getUserRepos = getUserRepos;

    this.rateLimit = {
      limit: 5000,
      cost: 1,
      remaining: 5000,
      resetAt: null,
    };
  }

  public async load() {
    this.log('Started load');

    cli.action.start('Searching for affiliated organizations');
    await this.getOrgsPagination(null, 5);
    cli.action.stop(this.githubOrgs.length + ' found');

    this.log('Initiate Organizations Repositories load');
    for (const orgObj of this.githubOrgs) {
      cli.action.start(
        'Loading repositories for organizations: ' + orgObj.login,
      );
      await this.getReposPagination(null, 5, orgObj, 'org');
      cli.action.stop(' completed');
    }

    this.log('Initiate Users own Repositories load');
    await this.getReposPagination(
      null,
      20,
      { id: '', __typename: 'User', login: this.githubLogin },
      'user',
    );
    this.log('Organizations Repositories loaded: ' + this.totalReposCount);

    return this.fetchedRepos;
  }

  private sleep(ms: number) {
    //https://github.com/Microsoft/tslint-microsoft-contrib/issues/355
    // tslint:disable-next-line no-string-based-set-timeout
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getOrgsPagination(cursor: string | null, increment: number) {
    const data = await graphqlQuery(
      this.gClient,
      this.getOrgs,
      { repo_cursor: cursor, increment }, // eslint-disable-line
      this.rateLimit,
      this.log,
    );

    //this.log('GraphQL Response:', data)
    if (data.data !== undefined) {
      if (data.data.rateLimit !== undefined) {
        this.rateLimit = data.data.rateLimit;
      }
      //updateChip(data.data.rateLimit)
      const lastCursor = await this.loadOrganizations(data);
      const queryIncrement = calculateQueryIncrement(
        this.githubOrgs.length,
        data.data.viewer.organizations.totalCount,
        this.maxQueryIncrement,
      );
      if (queryIncrement > 0) {
        await this.getOrgsPagination(lastCursor, queryIncrement);
      }
    } else {
      this.log(data);
      this.error('Unable to make the GraphQL call to GitHub', { exit: 1 });
    }
  }
  // eslint-disable-next-line
  private async loadOrganizations(data: any) {
    let lastCursor = null;
    for (const currentOrg of data.data.viewer.organizations.edges) {
      if (currentOrg.node !== null) {
        this.githubOrgs.push(currentOrg.node);
        lastCursor = currentOrg.cursor;
      }
    }
    return lastCursor;
  }

  private async getReposPagination(
    cursor: string | null,
    increment: number,
    OrgObj: GithubOrganization,
    type: string,
  ) {
    if (this.errorRetry <= 3) {
      let data: any = {}; // eslint-disable-line
      let repositories: any = {}; // eslint-disable-line
      await this.sleep(1000); // Wait 2s between requests to avoid hitting GitHub API rate limit => https://developer.github.com/v3/guides/best-practices-for-integrators/
      try {
        if (type === 'org') {
          data = await graphqlQuery(
            this.gClient,
            this.getRepos,
            { repo_cursor: cursor, increment, org_name: OrgObj.login }, // eslint-disable-line
            this.rateLimit,
            this.log,
          );
          repositories = data.data.viewer.organization.repositories;
        } else {
          data = await graphqlQuery(
            this.gClient,
            this.getUserRepos,
            { repo_cursor: cursor, increment, login: OrgObj.login }, // eslint-disable-line
            this.rateLimit,
            this.log,
          );
          OrgObj = data.data.user;
          repositories = data.data.viewer.repositories;
        }
      } catch (error) {
        this.log(error);
      }
      //        this.log(data)
      //        this.log(OrgObj)
      if (data.data !== undefined && data.data !== null) {
        this.errorRetry = 0;
        if (this.orgReposCount[OrgObj.id] === undefined) {
          this.orgReposCount[OrgObj.id] = 0;
        }
        if (data.data.rateLimit !== undefined) {
          this.rateLimit = data.data.rateLimit;
        }
        //updateChip(data.data.rateLimit)
        const lastCursor = await this.loadRepositories(repositories, OrgObj);
        const queryIncrement = calculateQueryIncrement(
          this.orgReposCount[OrgObj.id],
          repositories.totalCount,
          this.maxQueryIncrement,
        );
        this.log(
          'Org: ' +
            OrgObj.login +
            ' -> Fetched Count / Remote Count / Query Increment: ' +
            this.orgReposCount[OrgObj.id] +
            ' / ' +
            repositories.totalCount +
            ' / ' +
            queryIncrement,
        );
        if (queryIncrement > 0) {
          await this.getReposPagination(
            lastCursor,
            queryIncrement,
            OrgObj,
            type,
          );
        }
      } else {
        this.errorRetry = this.errorRetry + 1;
        this.log('Error loading content, current count: ' + this.errorRetry);
        await this.getReposPagination(cursor, increment, OrgObj, type);
      }
    } else {
      this.log('Got too many load errors, stopping');
      process.exit(1);
    }
  }

  private async loadRepositories(
    repositories: any, // eslint-disable-line
    OrgObj: GithubOrganization,
  ) {
    //    this.log('Loading from ' + OrgObj.login + ' organization')

    let lastCursor = null;
    for (const currentRepo of repositories.edges) {
      const repoObj = JSON.parse(JSON.stringify(currentRepo.node)); //TODO - Replace this with something better to copy object ?
      repoObj.org = OrgObj;

      const existingRepo = _.find(this.fetchedRepos, function(o) {
        return o.id === repoObj.id;
      });
      //There are occurences where duplicate repos might be fetched (from the organizations, then from the user).
      //Skipping if coming from the user, giving higher priority to Organixation
      if (
        existingRepo !== undefined &&
        existingRepo.org.__typename === 'Organization' &&
        OrgObj.__typename === 'User'
      ) {
        this.log(
          'This repo already exists as part of an organization, skipping...',
        );
      } else {
        this.fetchedRepos.push(repoObj);
      }
      lastCursor = currentRepo.cursor;
    }
    this.orgReposCount[OrgObj.id] =
      this.orgReposCount[OrgObj.id] + Object.entries(repositories.edges).length;
    this.totalReposCount =
      this.totalReposCount + Object.entries(repositories.edges).length;
    //this.log('Fetched a total of ' + this.totalReposCount + ' repositories')

    return lastCursor;
  }
}
