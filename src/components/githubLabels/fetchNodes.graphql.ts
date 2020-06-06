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
        ghNode: labels(first: $increment, after: $cursor) {
          totalCount
          edges {
            cursor
            node {
              ...labelFragment
            }
          }
        }
      }
    }
  }
  ${NODE_FRAGMENT}
`;

export default GQL_QUERY;
