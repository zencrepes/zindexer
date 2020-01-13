const query = `
    mutation($projectId: String!) {
      deleteProject(id: $projectId) {
        id
      }
    }
`;
export default query;
