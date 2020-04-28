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
        ghNode: vulnerabilityAlerts(first: $increment, after: $cursor) {
          totalCount
          edges {
            node {
              id
              createdAt
              dismissReason
              dismissedAt
              dismisser {
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
              vulnerableManifestPath
              vulnerableManifestFilename
              vulnerableRequirements
              securityVulnerability {
                updatedAt
                advisory {
                  id
                  publishedAt
                  origin
                  summary
                  description
                  severity
                  ghsaId
                  permalink
                }
                firstPatchedVersion {
                  identifier
                }
                package {
                  ecosystem
                  name
                }
                severity
                vulnerableVersionRange
              }
            }
          }
        }
      }            
    }
  }
`;
export default query;
