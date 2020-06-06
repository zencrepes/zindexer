import gql from 'graphql-tag';

export const NODE_FRAGMENT = gql`
  fragment stargazerFragment on User {
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
`;

export default NODE_FRAGMENT;
