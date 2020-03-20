const query = `
  query ($repo_cursor: String, $increment: Int, $org_name: String!){
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    organization(login: $org_name) {
      nodeId: id
      login
      name
      repositories(first: $increment, after: $repo_cursor) {
        totalCount
        edges {
          cursor
          node {
            name
            url
            id
          }
        }
      }
    }
  }
`;
export default query;
