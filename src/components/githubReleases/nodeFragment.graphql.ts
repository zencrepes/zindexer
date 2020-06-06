import gql from 'graphql-tag';

export const NODE_FRAGMENT = gql`
  fragment releaseFragment on Release {
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
`;

export default NODE_FRAGMENT;
