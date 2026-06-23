import { expect } from 'chai';
import getAssignee from '../../../src/utils/import/getAssignee';

const users = [
  { jira: { emailAddress: 'alice@example.com' }, github: { username: 'alice-gh' } },
];

describe('utils/import/getAssignee', () => {
  it('resolves the assignee to a GitHub username', () => {
    const issue = { assignee: { emailAddress: 'alice@example.com' } } as any;
    expect(getAssignee(issue, users)).to.equal('alice-gh');
  });

  it('returns null when there is no assignee', () => {
    const issue = { assignee: null } as any;
    expect(getAssignee(issue, users)).to.equal(null);
  });

  it('returns the fallback username when the assignee is unknown', () => {
    const issue = { assignee: { emailAddress: 'ghost@example.com' } } as any;
    expect(getAssignee(issue, users)).to.equal('unkown user');
  });
});
