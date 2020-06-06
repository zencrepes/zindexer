import gql from 'graphql-tag';

const GQL_QUERY = gql`
  query($userLogin: String!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    user(login: $userLogin) {
      name
      login
      id
      url
    }
  }
`;

export default GQL_QUERY;
