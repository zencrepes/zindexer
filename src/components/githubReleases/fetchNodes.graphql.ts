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
        ghNode: releases(
          first: $increment
          after: $cursor
          orderBy: { field: CREATED_AT, direction: DESC }
        ) {
          totalCount
          edges {
            cursor
            node {
              ...releaseFragment
            }
          }
        }
      }
    }
  }
  ${NODE_FRAGMENT}
`;

export default GQL_QUERY;
