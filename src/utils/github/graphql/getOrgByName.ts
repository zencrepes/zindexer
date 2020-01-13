const query = `
  query ($orgName: String!){
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    organization(login:$orgName) {
      nodeId: id
      login
      url
    }
  }
`;
export default query;
