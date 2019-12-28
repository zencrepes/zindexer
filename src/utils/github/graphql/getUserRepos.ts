const query = `
query ($userId: ID!, $cursor: String, $increment: Int){
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
export default query;