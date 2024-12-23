import { format } from 'date-fns';

import getUsername from './getUsername';
import cleanJiraContent from './cleanJiraContent';

const getComments = (issue: any, users: any[]) => {
  return issue.comments.edges.map((c: any) => {
    let header =''
      // '\n> Imported from Jira, on ' + format(new Date(), 'eee MMM d, yyyy');
    const author =
      c.node.author !== undefined
        ? '@' +
          getUsername(c.node.author.emailAddress, users) +
          ' (' +
          c.node.author.displayName +
          ')'
        : 'Anonymous';
    header =
      header +
      '\n> Comment by: ' +
      author +
      ' on ' +
      format(new Date(c.node.created), 'eee MMM d, yyyy');

    if (c.node.created !== c.node.updates) {
      header = header + ' _edited_';
    }
    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      created_at: new Date(c.node.created).toISOString(),
      body: header + '\n\n\n' + cleanJiraContent(c.node.body, users, issue),
    };
  });
};

export default getComments;
