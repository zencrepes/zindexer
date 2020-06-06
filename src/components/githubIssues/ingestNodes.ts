/* All nodes should go through ingestNodes to ensure they receive the same treatment across all zencrepes apps */
import Config from '../config/zencrepesConfig.type';
import XRegExp from 'xregexp';

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
    let issuePoints: number | null = null;
    const pointsExp = XRegExp('SP:[.\\d]');
    for (const currentLabel of item.labels.edges) {
      if (pointsExp.test(currentLabel.node.name)) {
        issuePoints = parseInt(currentLabel.node.name.replace('SP:', ''));
      } else if (pointsExp.test(currentLabel.node.description)) {
        issuePoints = parseInt(
          currentLabel.node.description.replace('SP:', ''),
        );
      } else {
        const foundPoints = userConfig.github.storyPointsLabels.find(
          (pl: any) => pl.label === currentLabel.node.name,
        );
        if (foundPoints !== undefined) {
          issuePoints = foundPoints.points;
        }
      }
    }
    return {
      ...item,
      zsource,
      zindexerSourceId: sourceId,
      openedDuring: openedDuring,
      points: issuePoints,
    };
  });
  return updatedNodes;
};

export default ingestNodes;
