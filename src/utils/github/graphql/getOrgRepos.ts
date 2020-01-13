const query = `
  query ($orgId: ID!, $cursor: String, $increment: Int){
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    node(id: $orgId) {
      ... on Organization {
        ghNode: repositories(first: $increment, after: $cursor) {
          totalCount
          edges {
            cursor
            node {
              name
              nodeId: id
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
