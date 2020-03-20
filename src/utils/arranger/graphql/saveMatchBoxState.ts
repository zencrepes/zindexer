const query = `
  mutation(
    $projectId: String!
    $graphqlField: String!
    $state: [MatchBoxFieldInput]!
  ) {
    saveMatchBoxState(projectId: $projectId, graphqlField: $graphqlField, state: $state) {
      state {
        field
        __typename
      }
      __typename
    }
  }
`;
export default query;
