const query = `
  query ($org_name: String!, $repo_name: String!){
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    repository(owner:$org_name, name:$repo_name) {
      name
      nodeId: id
      owner{
        id
        login
        url
      }
    }
  }
`;
export default query;
