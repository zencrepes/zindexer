import { expect } from 'chai';
import getUsername from '../../../src/utils/import/getUsername';

const users = [
  { jira: { emailAddress: 'alice@example.com' }, github: { username: 'alice-gh' } },
  { jira: { emailAddress: 'bob@example.com' }, github: { username: 'bob-gh' } },
];

describe('utils/import/getUsername', () => {
  it('returns the GitHub username matching the Jira email', () => {
    expect(getUsername('alice@example.com', users)).to.equal('alice-gh');
  });

  it('returns the fallback string when no user matches', () => {
    expect(getUsername('nobody@example.com', users)).to.equal('unkown user');
  });

  it('returns the fallback string when the user list is empty', () => {
    expect(getUsername('alice@example.com', [])).to.equal('unkown user');
  });
});
