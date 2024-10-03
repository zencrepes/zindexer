import gql from 'graphql-tag';

const GQL_QUERY = gql`
  mutation($labelId: ID!, $color: String!, $description: String) {
    updateLabel(input: { id: $labelId, color: $color, description: $description }) {
      label {
        id
      }
    }
  }
`;

export default GQL_QUERY;
