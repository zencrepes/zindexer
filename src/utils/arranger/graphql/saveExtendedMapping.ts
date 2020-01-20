const query = `
  mutation(
    $projectId: String!
    $graphqlField: String!
    $state: [ExtendedMappingSetFieldInput]!
  ) {
    saveExtendedMapping(projectId: $projectId, graphqlField: $graphqlField, input: $state) {
      field
      __typename
    }
  }
`;
export default query;
