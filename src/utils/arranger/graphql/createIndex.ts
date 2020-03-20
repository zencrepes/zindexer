const query = `
  mutation(
    $projectId: String!
    $graphqlField: String!
    $esIndex: String!
  ) {
    newIndex(
      projectId: $projectId
      graphqlField: $graphqlField
      esIndex: $esIndex
    ) {
      id
    }
  }
`;
export default query;
