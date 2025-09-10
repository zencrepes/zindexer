/* All nodes should go through ingestNodes to ensure they receive the same treatment across all zencrepes apps */
import Config from '../config/zencrepesConfig.type';
import XRegExp from 'xregexp';

import { differenceInDays } from 'date-fns';

interface GitHubNode {
  id: string;
  closedAt: string | null;
  createdAt: string;
  labels: any;
  assignees: any;
  projectCards: any;
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
    // To be able to calculate sum of points on nested aggregations, we need to store the points alongside all of the nested fields.
    // Wanted to handle this through the ES mapping with copy_to but this doesn't seem to be possible
    // See: https://github.com/elastic/elasticsearch/issues/34428
    return {
      ...item,
      assignees: {
        ...item.assignees,
        edges: item.assignees.edges.map((a: any) => {
          return { ...a, points: issuePoints };
        }),
      },
      labels: {
        ...item.labels,
        edges: item.labels.edges.map((l: any) => {
          return { ...l, points: issuePoints };
        }),
      },
      projectCards: {
        totalCount: 0,
        edges: [],
      },
      zsource,
      zindexerSourceId: sourceId,
      openedDuring: openedDuring,
      points: issuePoints,
    };
  });
  return updatedNodes;
};

export default ingestNodes;
