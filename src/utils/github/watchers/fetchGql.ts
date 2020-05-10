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
        id
        name
        url
        databaseId
        owner {
          id
          login
          url
        }                        
        ghNode: watchers(first: $increment, after: $cursor) {
          totalCount
          edges {
            cursor
            node {
              id              
              createdAt
              databaseId
              company
              login
              name
              avatarUrl
              isEmployee
              isHireable
              isDeveloperProgramMember
              isCampusExpert
              isBountyHunter
              url
              websiteUrl
              followers(first: 1) {
                totalCount
              }
              following(first: 1) {
                totalCount
              }   
              organizations(first: 10) {
                totalCount
                edges {
                  node {
                    id
                    createdAt
                    name
                    avatarUrl
                    login
                    url
                    email
                    websiteUrl
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
