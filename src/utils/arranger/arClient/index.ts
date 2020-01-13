import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { ApolloLink, concat } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';

import { ConfigArranger } from '../../../global';

const arClient = async (arrangerConfig: ConfigArranger) => {
  const httpLink = new HttpLink({
    uri: arrangerConfig.admin.graphQLEndpoint,
    fetch: fetch as any, // eslint-disable-line
  });
  const cache = new InMemoryCache({});
  //const cache = new InMemoryCache().restore(window.__APOLLO_STATE__)
  // eslint-disable-next-line
  const authMiddleware = new ApolloLink((operation: any, forward: any) => {
    // add the authorization to the headers
    /*
    operation.setContext({
      headers: {
        authorization: githubConfig.token ? `Bearer ${githubConfig.token}` : '',
      },
    });
    */
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

  return new ApolloClient({
    link: concat(authMiddleware, httpLink),
    //link: authLink.concat(link),
    cache,
  });
};

export default arClient;
