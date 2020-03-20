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
        ghNode: milestones(first: $increment, after: $cursor, orderBy: {field: UPDATED_AT, direction: DESC}) {
          totalCount
          edges {
           cursor
            node {
              nodeId: id
              createdAt
              updatedAt
              closedAt
              description
              dueOn
              issues (first: 1) {
                totalCount
              }
              pullRequests(first: 1) {
                totalCount
              }
              number
              state
              title
              url
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
