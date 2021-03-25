import gql from 'graphql-tag';

const GQL_QUERY = gql`
  query($nodesArray: [ID!]!) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    nodes(ids: $nodesArray) {
      ... on Repository {
        id
        createdAt
        databaseId
        defaultBranchRef {
          id
          name
          prefix
        }
        description
        name
        nameWithOwner
        isArchived
        isDisabled
        isFork        
        owner {
          id
          login
          url
        }
        pushedAt
        repositoryTopics(first: 10) {
          totalCount
          edges {
            node {
              id
              topic {
                id
                name
              }
              url
            }
          }
        }
        url
        updatedAt
      }
    }
  }
`;

export default GQL_QUERY;
