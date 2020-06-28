import gql from 'graphql-tag';

const GQL_QUERY = gql`
  mutation($issueId: ID!, $issueBody: String!) {
    updateIssue(input: { id: $issueId, body: $issueBody }) {
      issue {
        id
      }
    }
  }
`;

export default GQL_QUERY;
