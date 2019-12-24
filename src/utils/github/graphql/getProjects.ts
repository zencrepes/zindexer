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
        ghNode: projects(first: $increment, after: $cursor, orderBy: {field: UPDATED_AT, direction: DESC}) {
          totalCount
          edges {
            cursor
            node {
              id
              createdAt
              updatedAt
              closedAt
              databaseId
              number
              url
              name
              state
              body
              columns(first: 10) {
                totalCount
                edges {
                  node {
                    id
                    databaseId
                    name
                    cards(first: 1) {
                      totalCount
                    }
                  }
                }
              }
              pendingCards(first: 100) {
                totalCount
              }
              owner {
                ... on Repository {
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
  }
`;
export default query;
