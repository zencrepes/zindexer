import getUsername from './getUsername';
import { format } from 'date-fns';

// Creates a Markdown link to a Jira issue
const getMarkdownJiraLink = (key: string, host: string, title: string) => {
  return '[' + key + ' - ' + title + '](' + host + '/browse/' + key + ')';
};

const getIssueLink = (link: any, issue: any) => {
  if (link.inwardIssue !== null) {
    const jiraLink = getMarkdownJiraLink(
      link.inwardIssue.key,
      issue.server.host,
      link.inwardIssue.summary,
    );
    return (
      link.type.inward +
      ': ' +
      jiraLink +
      ' (' +
      link.inwardIssue.status.name +
      ')'
    );
  } else {
    const jiraLink = getMarkdownJiraLink(
      link.outwardIssue.key,
      issue.server.host,
      link.outwardIssue.summary,
    );
    return (
      link.type.outward +
      ': ' +
      jiraLink +
      ' (' +
      link.outwardIssue.status.name +
      ')'
    );
  }
};

const getSubtaskLink = (subtask: any, issue: any) => {
  const jiraLink = getMarkdownJiraLink(
    subtask.key,
    issue.server.host,
    subtask.fields.summary,
  );
  return jiraLink + ' (' + subtask.fields.status.name + ')';
};

const getEpicChildLink = (epicChild: any, issue: any) => {
  const jiraLink = getMarkdownJiraLink(
    epicChild.key,
    issue.server.host,
    epicChild.summary,
  );
  return (
    jiraLink + ' (' + epicChild.type.name + ', ' + epicChild.status.name + ')'
  );
};

const getParentLink = (issue: any) => {
  const jiraLink = getMarkdownJiraLink(
    issue.parent.key,
    issue.server.host,
    issue.parent.summary,
  );
  return jiraLink + ' (' + issue.parent.status.name + ')';
};

const formatSprint = (sprint: any) => {
  let sprintPrint: string = sprint.name;
  if (sprint.startDate !== undefined) {
    sprintPrint =
      sprintPrint +
      ' started on ' +
      format(new Date(sprint.startDate), 'eee MMM d, yyyy');
  }
  if (sprint.completedDate !== undefined) {
    sprintPrint =
      sprintPrint +
      ' completed on ' +
      format(new Date(sprint.completedDate), 'eee MMM d, yyyy');
  }
  return sprintPrint;
};

// Build an issue markdown header based on the received issue
const getHeader = (issue: any, users: any[]) => {
  let header =
    '\n> Imported from Jira, on ' +
    format(new Date(), 'eee MMM d, yyyy') +
    '\n> Issue: [' +
    issue.key +
    '](' +
    issue.url +
    ') in project: ' +
    issue.project.name;
  if (issue.reporter !== null) {
    const reporter =
      issue.reporter !== undefined
        ? '@' +
          getUsername(issue.reporter.emailAddress, users) +
          ' (' +
          issue.reporter.displayName +
          ')'
        : 'Anonymous';
    header = header + '\n> Reporter: ' + reporter;
  }
  if (issue.assignee !== null) {
    header =
      header +
      '\n> Assignee: @' +
      getUsername(issue.assignee.emailAddress, users) +
      ' (' +
      issue.assignee.displayName +
      ')';
  } else {
    header =
      header +
      '\n> Assignee: _None found in Jira, making reporter the assignee in GitHub_';
  }
  if (issue.status.statusCategory.name !== 'Done') {
    header =
      header +
      '\n> Created: ' +
      format(new Date(issue.createdAt), 'eee MMM d, yyyy') +
      ', last updated: ' +
      format(new Date(issue.updatedAt), 'eee MMM d, yyyy');
    header = header + '\n> Status: ' + issue.status.name;
  } else {
    header =
      header +
      '\n> Created: ' +
      format(new Date(issue.createdAt), 'eee MMM d, yyyy');
    if (issue.closedAt !== null) {
      header =
        header +
        ', closed: ' +
        format(new Date(issue.closedAt), 'eee MMM d, yyyy');
    }
    header = header + '\n> Status: ' + issue.status.name;

    if (issue.resolution !== null) {
      header = header + ' (resolution: ' + issue.resolution.name + ')';
    }
  }

  if (
    issue.sprints !== undefined &&
    issue.sprints !== null &&
    issue.sprints.totalCount > 0
  ) {
    if (issue.sprints.totalCount === 1) {
      header =
        header + '\n> Sprint: ' + formatSprint(issue.sprints.edges[0].node);
    } else {
      header + '\n> **Sprints**: ';
      for (const sprint of issue.sprints.edges) {
        const fsprint = formatSprint(sprint.node);
        header = header + '\n> - ' + fsprint;
      }
      header = header + '\n>';
    }
    // console.log(header);
  }

  if (issue.parent !== undefined && issue.parent !== null) {
    const parentLink = getParentLink(issue);
    header =
      header + '\n> **Parent ' + issue.parent.type.name + '**: ' + parentLink;
  }

  if (issue.issuelinks.totalCount > 0) {
    header = header + '\n> **Links**:';
    for (const link of issue.issuelinks.edges) {
      const fLink = getIssueLink(link.node, issue);
      header = header + '\n> - ' + fLink;
    }
    header = header + '\n>';
  }

  if (issue.epicChildren !== undefined && issue.epicChildren.length > 0) {
    header = header + '\n> **Issues in Epic**:';
    for (const childIssue of issue.epicChildren) {
      const status =
        childIssue.status.statusCategory.name === 'Done' ? '[x]' : '[ ]';
      const schild = getEpicChildLink(childIssue, issue);
      header = header + '\n> - ' + status + ' ' + schild;
    }
    header = header + '\n>';
  }

  if (
    issue.initiativeChildren !== undefined &&
    issue.initiativeChildren.length > 0
  ) {
    header = header + '\n> **Issues in Initiative**:';
    for (const childIssue of issue.initiativeChildren) {
      const status =
        childIssue.status.statusCategory.name === 'Done' ? '[x]' : '[ ]';
      const schild = getEpicChildLink(childIssue, issue);
      header = header + '\n> - ' + status + ' ' + schild;
    }
    header = header + '\n';
  }

  if (issue.subtasks.totalCount > 0) {
    header = header + '\n> **Sub-Tasks**:';
    for (const subtask of issue.subtasks.edges) {
      const status =
        subtask.node.fields.status.statusCategory.name === 'Done'
          ? '[x]'
          : '[ ]';
      const stask = getSubtaskLink(subtask.node, issue);
      header = header + '\n> - ' + status + ' ' + stask;
    }
    header = header + '\n>';
  }
  return header;
};

export default getHeader;
