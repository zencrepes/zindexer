const query = `
  query ($userLogin: String!){
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    user(login: $userLogin){
      name
      login
      nodeId: id
      url
    }
  }
`;
export default query;
