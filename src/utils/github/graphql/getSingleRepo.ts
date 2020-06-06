import gql from 'graphql-tag';

const GQL_QUERY = gql`
  query($org_name: String!, $repo_name: String!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    repository(owner: $org_name, name: $repo_name) {
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
