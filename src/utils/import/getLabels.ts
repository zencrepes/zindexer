const truncateLabel = (label: string, maxLength = 50) => {
  const ellipsis = '...';
  const charsToShow = maxLength - ellipsis.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);

  return label.substring(0, frontChars) + ellipsis + label.substring(label.length - backChars);
}

const getLabels = (issue: any) => {
  // By default we add a Jira label, just to indicate this issue is coming from jira
  const labels: string[] = ['Jira:' + issue.project.key];

  // Push the issue type
  labels.push(issue.type.name);

  // If the issue is in a state of progress, the corresponding status is added
  if (
    issue.status.statusCategory.key !== 'new' &&
    issue.status.statusCategory.key !== 'done'
  ) {
    labels.push('Status:' + issue.status.name);
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
        newLabel = newLabel.replace('-SNAPSHOT', '-SN');
      }
      labels.push(newLabel);
    }
  }

  if (issue.versions.totalCount > 0) {
    for (const fv of issue.versions.edges) {
      let newLabel = 'affectVersion:' + fv.node.name;
      if (newLabel.length >= 50) {
        newLabel = newLabel.replace('-SNAPSHOT', '-SN');
      }
      labels.push(newLabel);      
    }
  }

  if (issue.components.totalCount > 0) {
    for (const co of issue.components.edges) {
      const newLabel = 'Component:' + co.node.name;
      labels.push(newLabel);      
    }
  }

  if (issue.resolution !== null && issue.resolution.name !== 'Done') {
    labels.push('Resolution:' + issue.resolution.name);
  }
  if (issue.priority !== null) {
    labels.push('Priority:' + issue.priority.name);
  }

  if (issue.productArea !== undefined && issue.productArea !== null) {
    labels.push('Area:' + issue.productArea.value);
  }

  if (issue.sprints !== undefined && issue.sprints !== null && issue.sprints.totalCount > 0) {
    for (const sprint of issue.sprints.edges) {
      labels.push('Sprint:' + sprint.node.name);
    }
  }

  if (issue.points !== undefined && issue.points !== null) {
    labels.push('SP:' + issue.points);
  }

  // If a label is longer than 50 characters, we truncate it (in the middle)
  const cleanLabels = labels.map((label) => {
    if (label.length >= 50) {
      const truncatedLabel = truncateLabel(label);
      console.log(`Label: ${label} is over 50 characters, truncating it to: ${truncatedLabel}`);
      return truncatedLabel;
    }
    return label;
  });
  
  return cleanLabels;
};

export default getLabels;
