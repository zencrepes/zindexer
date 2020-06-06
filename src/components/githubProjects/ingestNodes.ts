/* All nodes should go through ingestNodes to ensure they receive the same treatment across all zencrepes apps */

interface GitHubNode {
  id: string;
}

const ingestNodes = (
  nodes: GitHubNode[],
  zsource: string,
  projectLevel: string,
  sourceId: string | null,
  organization: any,
  repository: any,
) => {
  const updatedNodes = nodes.map((item: GitHubNode) => {
    return {
      ...item,
      zsource,
      zindexerSourceId: sourceId,
      projectLevel,
      organization,
      repository,
    };
  });
  return updatedNodes;
};

export default ingestNodes;
