import gql from 'graphql-tag';

const GQL_QUERY = gql`
  query($userId: ID!, $cursor: String, $increment: Int) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    node(id: $userId) {
      ... on User {
        ghNode: repositories(first: $increment, after: $cursor) {
          totalCount
          edges {
            cursor
            node {
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
        }
      }
    }
  }
`;

export default GQL_QUERY;
