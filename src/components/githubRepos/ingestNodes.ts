/* All nodes should go through ingestNodes to ensure they receive the same treatment across all zencrepes apps */

interface GitHubNode {
  id: string;
  recentCommitsMaster: any;
}

const ingestNodes = (nodes: GitHubNode[], zsource: string) => {
  const updatedNodes = nodes
    .filter((i: GitHubNode) => i !== null)
    .map((item: GitHubNode) => {
      const currentYear = new Date().getFullYear();
      let currentYearMasterCommits = 0;
      if (
        item.recentCommitsMaster !== undefined &&
        item.recentCommitsMaster !== null
      ) {
        const yearCommits = item.recentCommitsMaster.target.history.edges.filter(
          (cn: any) =>
            new Date(cn.node.pushedDate).getFullYear() === currentYear,
        );
        currentYearMasterCommits = yearCommits.length;
      }
      return {
        ...item,
        zsource,
        currentYearMasterCommits,
      };
    });
  return updatedNodes;
};

export default ingestNodes;
