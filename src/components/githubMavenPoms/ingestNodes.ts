/* All nodes should go through ingestNodes to ensure they receive the same treatment across all zencrepes apps */
import * as xmljs from 'xml-js'

interface MavenPom {
  version: string
  artifactId: string
  name: string
  description: string
  parent: {
    groupId: string
    artifactId: string
    version: string
  }
  raw: string
}

interface GitHubNode {
  id: string;
  pom: null | MavenPom
}

const ingestNodes = (nodes: GitHubNode[], zsource: string) => {
  const updatedNodes = nodes
    .filter((i: GitHubNode) => i !== null)
    .map((item: any) => {
      let pom = null
      let hasPom = false
      let hasParent = false
      if (item.pom !== null) {
        hasPom = true
        const parsedPom: any = JSON.parse(xmljs.xml2json(item.pom.text, {compact: true, ignoreComment: true}))
        let parent = null
        if (parsedPom.project.parent !== undefined) {
          hasParent = true
          parent = {
            groupId: parsedPom.project.parent.groupId._text,
            artifactId: parsedPom.project.parent.artifactId._text,
            version: parsedPom.project.parent.version._text,
          }
        }
        pom = {
          version: parsedPom.project.version !== undefined ? parsedPom.project.version._text: null,
          artifactId: parsedPom.project.artifactId !== undefined ? parsedPom.project.artifactId._text: null,
          name: parsedPom.project.name !== undefined ? parsedPom.project.name._text: null,
          description: parsedPom.project.description !== undefined ? parsedPom.project.description._text: null,
          parent,
        }
      }
      let lastCommitMainBranch = null;
      if (item.recentCommitsMainBranch !== null && item.recentCommitsMainBranch.target.history.edges.length > 0) {
        lastCommitMainBranch = item.recentCommitsMainBranch.target.history.edges[0].node
      }
      return {
        ...item,
        pom,
        hasPom,
        hasParent,
        lastCommitMainBranch,
        zsource,
      };
    });
  return updatedNodes;
};

export default ingestNodes;
