import gql from 'graphql-tag';

const GQL_QUERY = gql`
  query($orgName: String!, $repoName: String!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    repository(owner: $orgName, name: $repoName) {
      name
      id
      url
      owner {
        id
        login
        url
      }
    }
  }
`;

export default GQL_QUERY;
