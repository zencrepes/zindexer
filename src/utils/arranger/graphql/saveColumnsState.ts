const query = `
  mutation(
    $projectId: String!
    $graphqlField: String!
    $state: ColumnStateInput!
  ) {
    saveColumnsState(projectId: $projectId, graphqlField: $graphqlField, state: $state) {
      ... on ColumnsState {
        timestamp
        __typename
      }
      __typename
    }
  }
`;
export default query;
