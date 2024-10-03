import gql from 'graphql-tag';

const GQL_QUERY = gql`
  query {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
  }
`;

export default GQL_QUERY;
