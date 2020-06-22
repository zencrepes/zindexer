import { format } from 'date-fns';
import jira2md from 'jira2md';

import getUsername from './getUsername';

const getComments = (issue: any, users: any[]) => {
  return issue.comments.edges.map((c: any) => {
    let header =
      '\n> Imported from Jira, on ' + format(new Date(), 'eee MMM d, yyyy');
    header =
      header +
      '\n> Comment by: @' +
      getUsername(c.node.author.emailAddress, users) +
      ' (' +
      c.node.author.displayName +
      ') on ' +
      format(new Date(c.node.created), 'eee MMM d, yyyy');

    if (c.node.created !== c.node.updates) {
      header = header + ' _edited_';
    }

    return {
      // eslint-disable-next-line @typescript-eslint/camelcase
      created_at: new Date(c.node.created).toISOString(),
      body: header + '\n\n\n' + jira2md.to_markdown(c.node.body),
    };
  });
};

export default getComments;
