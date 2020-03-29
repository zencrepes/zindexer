const query = `
  query ($orgName: String!){
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    organization(login:$orgName) {
      id
      login
      url
    }
  }
`;
export default query;
