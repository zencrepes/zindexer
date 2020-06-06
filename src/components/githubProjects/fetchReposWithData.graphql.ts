import gql from 'graphql-tag';

const GQL_QUERY = gql`
  query($nodesArray: [ID!]!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    nodes(ids: $nodesArray) {
      ... on Repository {
        id
        owner {
          id
          login
        }
        projects(first: 1) {
          totalCount
        }
      }
    }
  }
`;

export default GQL_QUERY;
