import gql from 'graphql-tag';

const GQL_QUERY_POM = gql`
  query($nodesArray: [ID!]!, $branchName: String!, $expression: String) {
    rateLimit {
      limit
      cost
      remaining
      resetAt
    }
    nodes(ids: $nodesArray) {
      ... on Repository {
        id
        pom: object(expression: $expression) {
          ... on Blob {
            text
          }
        }
        recentCommitsMainBranch: ref(qualifiedName: $branchName) {
          name
          target {
            ... on Commit {
              id
              history(first: 20) {
                totalCount
                edges {
                  node {
                    pushedDate
                    messageHeadline
                    author {
                      date
                      email
                      user {
                        name
                        login
                        id
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
  }
`;

export default GQL_QUERY_POM;
