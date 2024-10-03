const getLabels = (issue: any) => {
  // By default we add a Jira label, just to indicate this issue is coming from jira
  const labels: string[] = ['Jira:' + issue.project.key];
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
      let newLabel = 'fixVersion:' + fv.node.name;
      if (newLabel.length >= 50) {
        newLabel.replace('-SNAPSHOT', '-SN');
      }
      labels.push(newLabel);
    }
  }

  if (issue.versions.totalCount > 0) {
    for (const fv of issue.versions.edges) {
      let newLabel = 'affectVersion:' + fv.node.name;
      if (newLabel.length >= 50) {
        newLabel.replace('-SNAPSHOT', '-SN');
      }
      labels.push(newLabel);      
    }
  }

  if (issue.resolution !== null && issue.resolution.name !== 'Done') {
    labels.push(issue.resolution.name);
  }
  if (issue.priority !== null) {
    labels.push('Priority:' + issue.priority.name);
  }

  if (issue.productArea !== undefined && issue.productArea !== null) {
    labels.push('Area:' + issue.productArea.value);
  }

  // const sprint = getSprint(issue);
  // if (sprint !== null && sprint.number !== undefined) {
  //   labels.push('sprint:' + sprint.number);
  // }

  if (issue.points !== undefined && issue.points !== null) {
    labels.push('SP:' + issue.points);
  }

  // Need to add points handling
  // console.log(labels);
  return labels;
};

export default getLabels;
