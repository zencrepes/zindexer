import { format, parseISO } from 'date-fns';
import cli from 'cli-ux';

import { createWriteStream } from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

import getPullrequests from '../graphql/getPullrequests';
import calculateQueryIncrement from '../utils/calculateQueryIncrement';
import graphqlQuery from '../utils/graphqlQuery';

import { GithubPullrequest } from '../../../global';

export default class FetchPullrequests {
  gClient: object;
  maxQueryIncrement: number;
  configDir: string;
  log: any; // eslint-disable-line
  cli: object;
  fetchedPullrequests: Array<object>;
  errorRetry: number;
  getPullrequests: string;
  rateLimit: {
    limit: number;
    cost: number;
    remaining: number;
    resetAt: string | null;
  };
  cacheStream: any; // eslint-disable-line

  constructor(
    gClient: object,
    log: object,
    ghIncrement: number,
    configDir: string,
  ) {
    this.gClient = gClient;
    this.maxQueryIncrement = ghIncrement;
    this.configDir = configDir;

    this.log = log;
    this.cli = cli;
    this.fetchedPullrequests = [];
    this.errorRetry = 0;
    //this.getPullrequests = readFileSync(__dirname + '/../graphql/getPullrequests.graphql', 'utf8')
    this.getPullrequests = getPullrequests;

    this.rateLimit = {
      limit: 5000,
      cost: 1,
      remaining: 5000,
      resetAt: null,
    };
  }

  public async load(
    repoId: string,
    recentPullrequest: GithubPullrequest | null,
  ) {
    this.fetchedPullrequests = [];
    //Create stream for writing issues to cache
    this.cacheStream = createWriteStream(
      path.join(this.configDir + '/cache/', repoId + '.ndjson'),
      { flags: 'a' },
    );

    await this.getPullrequestsPagination(null, 5, repoId, recentPullrequest);
    this.cacheStream.end();
    return this.fetchedPullrequests;
  }

  private sleep(ms: number) {
    //https://github.com/Microsoft/tslint-microsoft-contrib/issues/355
    // tslint:disable-next-line no-string-based-set-timeout
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getPullrequestsPagination(
    cursor: string | null,
    increment: number,
    repoId: string,
    recentPullrequest: GithubPullrequest | null,
  ) {
    if (this.errorRetry <= 3) {
      let data: any = {}; // eslint-disable-line
      await this.sleep(1000); // Wait 1s between requests to avoid hitting GitHub API rate limit => https://developer.github.com/v3/guides/best-practices-for-integrators/
      const t0 = performance.now();
      try {
        data = await graphqlQuery(
          this.gClient,
          this.getPullrequests,
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
        const lastCursor = await this.loadPullrequests(
          data,
          callDuration,
          recentPullrequest,
        );
        const queryIncrement = calculateQueryIncrement(
          this.fetchedPullrequests.length,
          data.data.node.pullRequests.totalCount,
          this.maxQueryIncrement,
        );
        this.log(
          'Repo: ' +
            repoId +
            ' -> Fetched Count / Remote Count / Query Increment: ' +
            this.fetchedPullrequests.length +
            ' / ' +
            data.data.node.pullRequests.totalCount +
            ' / ' +
            queryIncrement,
        );
        if (queryIncrement > 0 && lastCursor !== null) {
          await this.getPullrequestsPagination(
            lastCursor,
            queryIncrement,
            repoId,
            recentPullrequest,
          );
        }
      } else {
        this.errorRetry = this.errorRetry + 1;
        this.log(
          'Error loading content, current count: ' + this.errorRetry,
          recentPullrequest,
        );
        await this.getPullrequestsPagination(
          cursor,
          increment,
          repoId,
          recentPullrequest,
        );
      }
    } else {
      this.log('Got too many load errors, stopping');
      process.exit(1);
    }
  }

  private async loadPullrequests(
    data: any, // eslint-disable-line
    callDuration: number,
    recentPullrequest: GithubPullrequest | null,
  ) {
    //    this.log('Loading from ' + OrgObj.login + ' organization')
    let lastCursor = null;
    let stopLoad = false;

    if (data.data.node.pullRequests.edges.length > 0) {
      const apiPerf = Math.round(
        data.data.node.pullRequests.edges.length / (callDuration / 1000),
      );
      this.log(
        'Latest call contained ' +
          data.data.node.pullRequests.edges.length +
          ' issues, oldest: ' +
          format(
            parseISO(data.data.node.pullRequests.edges[0].node.updatedAt),
            'LLL do yyyy',
          ) +
          ' download rate: ' +
          apiPerf +
          ' issues/s',
      );
    }
    for (const currentPullrequest of data.data.node.pullRequests.edges) {
      if (
        recentPullrequest !== null &&
        new Date(currentPullrequest.node.updatedAt).getTime() <
          new Date(recentPullrequest.updatedAt).getTime()
      ) {
        this.log('Pullrequest already loaded, stopping entire load');
        // Pullrequests are loaded from newest to oldest, when it gets to a point where updated date of a loaded issue
        // is equal to updated date of a local issue, it means there is no "new" content, but there might still be
        // issues that were not loaded for any reason. So the system only stops loaded if totalCount remote is equal
        //  to the total number of issues locally
        // Note Mar 21: This logic might be fine when the number of issues is relatively small, definitely problematic for large repositories.
        // Commenting it out for now, it will not keep looking in the past if load is interrupted for some reason.
        //if (data.data.node.pullRequests.totalCount === cfgPullrequests.find({'repo.id': repoObj.id}).count()) {
        //    stopLoad = true;
        //}
        stopLoad = true;
      } else {
        const issueObj = JSON.parse(JSON.stringify(currentPullrequest.node)); //TODO - Replace this with something better to copy object ?
        this.fetchedPullrequests.push(issueObj);

        //Write the content to the cache file
        this.cacheStream.write(JSON.stringify(issueObj) + '\n');

        lastCursor = currentPullrequest.cursor;
      }
      lastCursor = currentPullrequest.cursor;
      if (stopLoad === true) {
        lastCursor = null;
      }
    }
    return lastCursor;
  }
}
