import gql from 'graphql-tag';

import { NODE_FRAGMENT } from './nodeFragment.graphql';

const GQL_QUERY = gql`
  query($nodesArray: [ID!]!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    nodes(ids: $nodesArray) {
      ... on PullRequest {
        ...prFragment
      }
    }
  }
  ${NODE_FRAGMENT}
`;

export default GQL_QUERY;
