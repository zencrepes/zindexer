import gql from 'graphql-tag';

export const NODE_FRAGMENT = gql`
  fragment projectFragment on Project {
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
    creator {
      avatarUrl
      login
      url
    }
    columns(first: 15) {
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
    pendingCards(first: 1) {
      totalCount
    }
  }
`;

export default NODE_FRAGMENT;
