import gql from 'graphql-tag';

const GQL_QUERY = gql`
  query($orgName: String!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    organization(login: $orgName) {
      id
      login
      url
    }
  }
`;

export default GQL_QUERY;
