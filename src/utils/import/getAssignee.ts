import getUsername from './getUsername';

const getAssignee = (issue: any, users: any[]) => {
  if (issue.assignee !== null) {
    return getUsername(issue.assignee.emailAddress, users);
  } else {
    return null;
  }
};

export default getAssignee;
