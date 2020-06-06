/* All nodes should go through ingestNodes to ensure they receive the same treatment across all zencrepes apps */

interface GitHubNode {
  id: string;
}

const ingestNodes = (nodes: GitHubNode[], zsource: string) => {
  const updatedNodes = nodes.map((item: GitHubNode) => {
    return {
      ...item,
      zsource,
    };
  });
  return updatedNodes;
};

export default ingestNodes;
