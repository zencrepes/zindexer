const query = `
    mutation($projectId: String!) {
      newProject(id: $projectId) {
        id
        __typename
      }
    }
`;
export default query;
