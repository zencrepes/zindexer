/* All nodes should go through ingestNodes to ensure they receive the same treatment across all zencrepes apps */
import { differenceInDays } from 'date-fns';

interface GitHubNode {
  id: string;
  dismissedAt: string;
  createdAt: string;
}

const ingestNodes = (
  nodes: GitHubNode[],
  zsource: string,
  sourceId: string | null = null,
) => {
  const updatedNodes = nodes.map((item: GitHubNode) => {
    let dismissedAfter = null;
    if (item.dismissedAt !== null) {
      dismissedAfter = differenceInDays(
        new Date(item.dismissedAt),
        new Date(item.createdAt),
      );
    }
    return {
      ...item,
      zsource,
      zindexerSourceId: sourceId,
      dismissedAfter: dismissedAfter,
    };
  });
  return updatedNodes;
};

export default ingestNodes;
