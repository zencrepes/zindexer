import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink, concat } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
//import {readFileSync} from 'fs'
import fetch from 'node-fetch';

import graphqlQuery from '../utils/graphqlQuery';

export default class GetNodesByIds {
  githubToken: string;
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
  client: object;

  constructor(
    log: object,
    ghToken: string,
    ghIncrement: number,
    cli: object,
    graphqlQuery: any, // eslint-disable-line
  ) {
    this.githubToken = ghToken;
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

    const httpLink = new HttpLink({
      uri: 'https://api.github.com/graphql',
      fetch: fetch as any, // eslint-disable-line
    });
    const cache = new InMemoryCache();
    //const cache = new InMemoryCache().restore(window.__APOLLO_STATE__)

    // eslint-disable-next-line
    const authMiddleware = new ApolloLink((operation: any, forward: any) => {
      // add the authorization to the headers
      operation.setContext({
        headers: {
          authorization: this.githubToken ? `Bearer ${this.githubToken}` : '',
        },
      });
      return forward(operation).map(
        (response: {
          errors: Array<object> | undefined;
          data: { errors: Array<object> };
        }) => {
          if (response.errors !== undefined && response.errors.length > 0) {
            response.data.errors = response.errors;
          }
          return response;
        },
      );
    });

    this.client = new ApolloClient({
      link: concat(authMiddleware, httpLink),
      //link: authLink.concat(link),
      cache,
    });
  }
  // eslint-disable-next-line
  public async load(loadRepos: Array<any>) {
    this.log('Started load');

    const data = await graphqlQuery(
      this.client,
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
