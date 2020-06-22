import getUsername from './getUsername';

const getReporter = (issue: any, users: any[]) => {
  if (issue.reporter !== null) {
    return getUsername(issue.reporter.emailAddress, users);
  } else {
    return getUsername(issue.creator.emailAddress, users);
  }
};

export default getReporter;
