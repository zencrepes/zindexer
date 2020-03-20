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
        ghNode: pullRequests(first: $increment, after: $cursor, orderBy: {field: UPDATED_AT, direction: DESC}) {
          totalCount
          edges {
           cursor
            node {
              nodeId: id
              createdAt
              updatedAt
              closedAt
              databaseId
              number
              url
              title
              body
              state
              author {
                login
                avatarUrl
                url
              }
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
              labels (first: 10) {
                totalCount
                edges {
                  node {
                    id
                    color
                    name
                    description
                  }
                }
              }
              milestone {
                id
                createdAt
                updatedAt
                closedAt
                description
                dueOn
                issues (first: 1) {
                  totalCount
                }
                number
                state
                title
                url
              }
              assignees(first: 4) {
                totalCount
                edges {
                  node {
                    id
                    avatarUrl
                    login
                    name
                    url
                  }
                }
              }
              comments(first: 1) {
                totalCount
              }
              participants(first: 1) {
                totalCount
              }
              projectCards(first: 5) {
                totalCount
                edges {
                  node {
                    id
                    project {
                      id
                      name
                    }
                    column {
                      id
                      name
                    }
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
