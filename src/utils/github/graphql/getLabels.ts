const query = `
  query($repoId: ID!, $cursor: String, $increment: Int,) {
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
              id
              url
              color
              name
              description
              isDefault
              createdAt
              updatedAt
              issues(first: 1) {
                totalCount
              }
              pullRequests(first: 1) {
                totalCount
              }              
              repository {
                id
                name
                url
                databaseId
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
  }
`;
export default query;
