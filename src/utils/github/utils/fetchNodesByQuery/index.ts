import cli from 'cli-ux';
import { createWriteStream } from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

import getOrgs from '../../graphql/getOrgs';
import getRepos from '../../graphql/getOrgRepos';
import getUserRepos from '../../graphql/getUserRepos';
import calculateQueryIncrement from '../calculateQueryIncrement';
import graphqlQuery from '../graphqlQuery';
import { getId } from '../../../misc/getId';

/*
  Fetch an unknown quantity of nodes resulting of a query
*/
export default class FetchNodesByQuery {
  gClient: object;
  graphQLQuery: string;
  configDir: string;
  maxQueryIncrement: number;
  log: any; // eslint-disable-line
  cli: object;
  fetchedNodes: Array<any>; // eslint-disable-line
  error: any; // eslint-disable-line
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
  cacheStream: any; // eslint-disable-line

  constructor(
    gClient: object,
    graphQLQuery: string,
    log: object,
    ghIncrement: number,
    configDir: string,
  ) {
    this.gClient = gClient;
    this.graphQLQuery = graphQLQuery;
    this.log = log;
    this.maxQueryIncrement = ghIncrement;
    this.configDir = configDir;

    this.cli = cli;
    this.totalReposCount = 0;
    this.orgReposCount = {};
    this.errorRetry = 0;
    this.getOrgs = getOrgs;
    this.getRepos = getRepos;
    this.getUserRepos = getUserRepos;
    this.fetchedNodes = [];

    this.rateLimit = {
      limit: 5000,
      cost: 1,
      remaining: 5000,
      resetAt: null,
    };
  }

  public async load(queryParams: object) {
    this.fetchedNodes = [];

    this.cacheStream = createWriteStream(
      path.join(
        this.configDir + '/cache/',
        getId(JSON.stringify(queryParams)) + '.ndjson',
      ),
      { flags: 'a' },
    );

    await this.getNodesPagination(null, 5, queryParams);
    this.cacheStream.end();

    return this.fetchedNodes;
  }

  private sleep(ms: number) {
    //https://github.com/Microsoft/tslint-microsoft-contrib/issues/355
    // tslint:disable-next-line no-string-based-set-timeout
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getNodesPagination(
    cursor: string | null,
    increment: number,
    queryParams: object,
  ) {
    if (this.errorRetry <= 3) {
      let data: any = {}; // eslint-disable-line
      await this.sleep(1000); // Wait 1s between requests to avoid hitting GitHub API rate limit => https://developer.github.com/v3/guides/best-practices-for-integrators/
      const t0 = performance.now();
      try {
        data = await graphqlQuery(
          this.gClient,
          this.graphQLQuery,
          {
            ...queryParams,
            cursor,
            increment,
          },
          this.rateLimit,
          this.log,
        );
      } catch (error) {
        this.log(error);
      }
      const t1 = performance.now();
      const callDuration = t1 - t0;
      //        this.log(data)
      //        this.log(OrgObj)
      if (data.data !== undefined && data.data !== null) {
        this.errorRetry = 0;
        if (data.data.rateLimit !== undefined) {
          this.rateLimit = data.data.rateLimit;
        }
        //updateChip(data.data.rateLimit)
        // const ghNode =
        //   data.data.viewer !== undefined
        //     ? data.data.viewer.ghNode
        //     : data.data.node.ghNode;
        const ghData =
          data.data.viewer !== undefined ? data.data.viewer : data.data.node;
        const lastCursor = await this.loadNodes(ghData, callDuration);
        const queryIncrement = calculateQueryIncrement(
          this.fetchedNodes.length,
          ghData.ghNode.totalCount,
          this.maxQueryIncrement,
        );
        this.log(
          'Params: ' +
            JSON.stringify(queryParams) +
            ' -> Fetched Count / Remote Count / Query Increment: ' +
            this.fetchedNodes.length +
            ' / ' +
            ghData.ghNode.totalCount +
            ' / ' +
            queryIncrement,
        );
        if (queryIncrement > 0 && lastCursor !== null) {
          await this.getNodesPagination(
            lastCursor,
            queryIncrement,
            queryParams,
          );
        }
      } else {
        this.errorRetry = this.errorRetry + 1;
        this.log('Error loading content, current count: ' + this.errorRetry);
        await this.getNodesPagination(cursor, increment, queryParams);
      }
    } else {
      this.log('Got too many load errors, stopping');
      process.exit(1);
    }
  }

  private async loadNodes(
    ghData: any, // eslint-disable-line
    callDuration: number,
  ) {
    const parentData = JSON.parse(JSON.stringify(ghData)); //TODO - Replace this with something better to copy object ?
    if (parentData.ghNode.edges !== undefined) {
      delete parentData.ghNode.edges;
    }
    let lastCursor = null;
    if (ghData.ghNode.edges.length > 0) {
      const apiPerf = Math.round(
        ghData.ghNode.edges.length / (callDuration / 1000),
      );
      this.log(
        'Latest call contained ' +
          ghData.ghNode.edges.length +
          ' nodes, download rate: ' +
          apiPerf +
          ' nodes/s',
      );
    }
    for (const currentNode of ghData.ghNode.edges) {
      let nodeObj = JSON.parse(JSON.stringify(currentNode.node)); //TODO - Replace this with something better to copy object ?
      nodeObj = { ...nodeObj, _parent: parentData };
      // Special treatment for stargazers since data is attached under edges
      if (currentNode.starredAt !== undefined) {
        nodeObj = { ...nodeObj, starredAt: currentNode.starredAt };
      }
      this.fetchedNodes.push(nodeObj);
      //Write the content to the cache file
      this.cacheStream.write(JSON.stringify(nodeObj) + '\n');

      lastCursor = currentNode.cursor;
    }
    return lastCursor;
  }
}
