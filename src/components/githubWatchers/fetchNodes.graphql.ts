import gql from 'graphql-tag';

import { NODE_FRAGMENT } from './nodeFragment.graphql';

const GQL_QUERY = gql`
  query($repoId: ID!, $cursor: String, $increment: Int) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    node(id: $repoId) {
      ... on Repository {
        id
        name
        url
        databaseId
        owner {
          id
          login
          url
        }
        ghNode: watchers(first: $increment, after: $cursor) {
          totalCount
          edges {
            cursor
            node {
              ...watcherFragment
            }
          }
        }
      }
    }
  }
  ${NODE_FRAGMENT}
`;

export default GQL_QUERY;
