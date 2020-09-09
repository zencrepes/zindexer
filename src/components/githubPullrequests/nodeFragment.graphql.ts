import gql from 'graphql-tag';

export const NODE_FRAGMENT = gql`
  fragment prFragment on PullRequest {
    id
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
    timelineItems(first: 30, itemTypes: [CROSS_REFERENCED_EVENT]) {
      totalCount
      edges {
        node {
          ... on CrossReferencedEvent {
            id
            createdAt
            referencedAt
            resourcePath
            isCrossRepository
            url
            willCloseTarget
            source {
              ... on Issue {
                typename: __typename
                id
                number
                title
                state
                url
              }
              ... on PullRequest {
                typename: __typename
                id
                number
                title
                state
                url
              }
            }
            target {
              ... on Issue {
                typename: __typename
                id
                number
                title
                state
                url
              }
              ... on PullRequest {
                typename: __typename
                id
                number
                title
                state
                url
              }
            }
          }
        }
      }
    }
    labels(first: 10) {
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
      issues(first: 1) {
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
    reviewRequests(first: 5) {
      totalCount
      edges {
        node {
          requestedReviewer {
            ... on User {
              login
              avatarUrl
              url
            }
          }
        }
      }
    }
    reviewDecision
    reviews(first: 5) {
      edges {
        node {
          state
          author {
            login
            url
            avatarUrl
          }
        }
      }
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
`;

export default NODE_FRAGMENT;
