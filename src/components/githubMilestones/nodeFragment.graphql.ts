import gql from 'graphql-tag';

export const NODE_FRAGMENT = gql`
  fragment milestoneFragment on Milestone {
    id
    createdAt
    updatedAt
    closedAt
    description
    dueOn
    issues(first: 1) {
      totalCount
    }
    pullRequests(first: 1) {
      totalCount
    }
    number
    state
    title
    url
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
  }
`;

export default NODE_FRAGMENT;
