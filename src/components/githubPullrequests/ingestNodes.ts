/* All nodes should go through ingestNodes to ensure they receive the same treatment across all zencrepes apps */
import Config from '../config/zencrepesConfig.type';

import { differenceInDays } from 'date-fns';

interface GitHubNode {
  id: string;
  closedAt: string | null;
  createdAt: string;
  labels: any;
}

const ingestNodes = (
  nodes: GitHubNode[],
  zsource: string,
  userConfig: Config,
  sourceId: string | null = null,
) => {
  const updatedNodes = nodes.map((item: GitHubNode) => {
    let openedDuring = null;
    if (item.closedAt !== null) {
      openedDuring = differenceInDays(
        new Date(item.closedAt),
        new Date(item.createdAt),
      );
    }
    return {
      ...item,
      zsource,
      zindexerSourceId: sourceId,
      openedDuring: openedDuring,
    };
  });
  return updatedNodes;
};

export default ingestNodes;
