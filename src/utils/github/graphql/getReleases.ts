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
      ghNode: releases(first: $increment, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) {
        totalCount
        edges {
         cursor
          node {
            id
            createdAt
            updatedAt
            author {
              id
              login
              name
              company
            }
            description
            isDraft
            isPrerelease
            name
            publishedAt
            tagName
            url           
          }
        }
      }       
    }            
  }
}
`;
export default query;
