const query = `
  query ($orgName: String!, $repoName: String!){
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    repository(owner:$orgName, name:$repoName) {
      name
      id
      owner{
        id
        login
        url
      }
    }
  }
`;
export default query;
