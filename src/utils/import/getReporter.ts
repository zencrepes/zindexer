import getUsername from './getUsername';

const getReporter = (issue: any, users: any[]) => {
  if (issue.reporter !== null) {
    return getUsername(issue.reporter.emailAddress, users);
  } else if (issue.creator !== null) {
    return getUsername(issue.creator.emailAddress, users);
  } else {
    return null;
  }
};

export default getReporter;
