const query = `
  query ($cursor: String, $increment: Int) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    viewer {
      ghNode: organizations(first: $increment, after: $cursor) {
        totalCount
        edges {
          cursor
          node {
            name
            login
            id
            repositories {
              totalCount
            }
          }
        }
      }
    }
  }
`;
export default query;
