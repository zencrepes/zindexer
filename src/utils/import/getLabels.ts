import getSprint from '../jira/issues/getSprint';

const getLabels = (issue: any) => {
  // By default we add a Jira label, just to indicate this issue is coming from jira
  const labels: string[] = ['Jira:' + issue.project.name];
  // Push the issue type (except is task)
  if (issue.type.name !== 'Task') {
    labels.push(issue.type.name);
  }

  // If the issue is in a state of progress, the corresponding status is added
  if (
    issue.status.statusCategory.key !== 'new' &&
    issue.status.statusCategory.key !== 'done'
  ) {
    labels.push(issue.status.name);
  }

  if (issue.labels !== undefined && issue.labels.edges.length > 0) {
    for (const label of issue.labels.edges) {
      labels.push(label.node.name);
    }
  }

  if (issue.fixVersions.totalCount > 0) {
    for (const fv of issue.fixVersions.edges) {
      labels.push('fixVersion:' + fv.node.name);
    }
  }

  if (issue.versions.totalCount > 0) {
    for (const fv of issue.versions.edges) {
      labels.push('affectVersion:' + fv.node.name);
    }
  }

  if (issue.resolution !== null && issue.resolution.name !== 'Done') {
    labels.push(issue.resolution.name);
  }
  if (issue.priority !== null) {
    labels.push('priority:' + issue.priority.name);
  }

  const sprint = getSprint(issue);
  if (sprint !== null && sprint.number !== undefined) {
    labels.push('sprint:' + sprint.number);
  }

  if (issue.points !== undefined && issue.points !== null) {
    labels.push('SP:' + issue.points);
  }

  // Need to add points handling
  // console.log(labels);
  return labels;
};

export default getLabels;
