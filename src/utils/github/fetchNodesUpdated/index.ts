import { format, parseISO } from 'date-fns';
import cli from 'cli-ux';

import { createWriteStream } from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

import calculateQueryIncrement from '../utils/calculateQueryIncrement';
import graphqlQuery from '../utils/graphqlQuery';
import { GithubNode } from '../../../global';

export default class FetchNodeUpdated {
  gClient: object;
  maxQueryIncrement: number;
  configDir: string;
  log: any; // eslint-disable-line
  cli: object;
  fetchedNodes: Array<object>;
  errorRetry: number;
  graphQLQuery: string;
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
    this.maxQueryIncrement = ghIncrement;
    this.configDir = configDir;

    this.log = log;
    this.cli = cli;
    this.fetchedNodes = [];
    this.errorRetry = 0;
    this.graphQLQuery = graphQLQuery;

    this.rateLimit = {
      limit: 5000,
      cost: 1,
      remaining: 5000,
      resetAt: null,
    };
  }

  public async load(repoId: string, recentNode: GithubNode | null) {
    this.fetchedNodes = [];
    //Create stream for writing nodes to cache
    this.cacheStream = createWriteStream(
      path.join(this.configDir + '/cache/', repoId + '.ndjson'),
      { flags: 'a' },
    );

    await this.getNodesPagination(null, 5, repoId, recentNode);
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
    repoId: string,
    recentNode: GithubNode | null,
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
            cursor,
            increment,
            repoId: repoId,
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
        const lastCursor = await this.loadNodes(data, callDuration, recentNode);
        const queryIncrement = calculateQueryIncrement(
          this.fetchedNodes.length,
          data.data.node.ghNode.totalCount,
          this.maxQueryIncrement,
        );
        this.log(
          'Repo: ' +
            repoId +
            ' -> Fetched Count / Remote Count / Query Increment: ' +
            this.fetchedNodes.length +
            ' / ' +
            data.data.node.ghNode.totalCount +
            ' / ' +
            queryIncrement,
        );
        if (queryIncrement > 0 && lastCursor !== null) {
          await this.getNodesPagination(
            lastCursor,
            queryIncrement,
            repoId,
            recentNode,
          );
        }
      } else {
        this.errorRetry = this.errorRetry + 1;
        this.log(
          'Error loading content, current count: ' + this.errorRetry,
          recentNode,
        );
        await this.getNodesPagination(cursor, increment, repoId, recentNode);
      }
    } else {
      this.log('Got too many load errors, stopping');
      process.exit(1);
    }
  }

  private async loadNodes(
    data: any, // eslint-disable-line
    callDuration: number,
    recentNode: GithubNode | null,
  ) {
    //    this.log('Loading from ' + OrgObj.login + ' organization')
    let lastCursor = null;
    let stopLoad = false;

    if (data.data.node.ghNode.edges.length > 0) {
      const apiPerf = Math.round(
        data.data.node.ghNode.edges.length / (callDuration / 1000),
      );
      this.log(
        'Latest call contained ' +
          data.data.node.ghNode.edges.length +
          ' nodes, oldest: ' +
          format(
            parseISO(data.data.node.ghNode.edges[0].node.updatedAt),
            'LLL do yyyy',
          ) +
          ' download rate: ' +
          apiPerf +
          ' nodes/s',
      );
    }
    for (const currentNode of data.data.node.ghNode.edges) {
      if (
        recentNode !== null &&
        new Date(currentNode.node.updatedAt).getTime() <
          new Date(recentNode.updatedAt).getTime()
      ) {
        this.log('Node already loaded, stopping entire load');
        // Issues are loaded from newest to oldest, when it gets to a point where updated date of a loaded issue
        // is equal to updated date of a local issue, it means there is no "new" content, but there might still be
        // issues that were not loaded for any reason. So the system only stops loaded if totalCount remote is equal
        //  to the total number of issues locally
        // Note Mar 21: This logic might be fine when the number of issues is relatively small, definitely problematic for large repositories.
        // Commenting it out for now, it will not keep looking in the past if load is interrupted for some reason.
        //if (data.data.node.ghNode.totalCount === cfgIssues.find({'repo.id': repoObj.id}).count()) {
        //    stopLoad = true;
        //}
        stopLoad = true;
      } else {
        const nodeObj = JSON.parse(JSON.stringify(currentNode.node)); //TODO - Replace this with something better to copy object ?
        this.fetchedNodes.push(nodeObj);

        //Write the content to the cache file
        this.cacheStream.write(JSON.stringify(nodeObj) + '\n');

        lastCursor = currentNode.cursor;
      }
      lastCursor = currentNode.cursor;
      if (stopLoad === true) {
        lastCursor = null;
      }
    }
    return lastCursor;
  }
}
