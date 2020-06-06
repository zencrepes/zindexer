import gql from 'graphql-tag';

export const NODE_FRAGMENT = gql`
  fragment vulnFragment on RepositoryVulnerabilityAlert {
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
`;

export default NODE_FRAGMENT;
