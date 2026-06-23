import { expect } from 'chai';
import getReporter from '../../../src/utils/import/getReporter';

const users = [
  { jira: { emailAddress: 'alice@example.com' }, github: { username: 'alice-gh' } },
  { jira: { emailAddress: 'bob@example.com' }, github: { username: 'bob-gh' } },
];

describe('utils/import/getReporter', () => {
  it('uses the reporter when present', () => {
    const issue = {
      reporter: { emailAddress: 'alice@example.com' },
      creator: { emailAddress: 'bob@example.com' },
    } as any;
    expect(getReporter(issue, users)).to.equal('alice-gh');
  });

  it('falls back to the creator when there is no reporter', () => {
    const issue = {
      reporter: null,
      creator: { emailAddress: 'bob@example.com' },
    } as any;
    expect(getReporter(issue, users)).to.equal('bob-gh');
  });

  it('returns null when neither reporter nor creator are present', () => {
    const issue = { reporter: null, creator: null } as any;
    expect(getReporter(issue, users)).to.equal(null);
  });
});
