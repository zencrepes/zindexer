import { expect } from 'chai';
import cleanJiraContent from '../../../src/utils/import/cleanJiraContent';

const users = [
  {
    jira: { emailAddress: 'alice@example.com', name: 'alice', key: 'alice', displayName: 'Alice A' },
    github: { username: 'alice-gh' },
  },
];

describe('utils/import/cleanJiraContent', () => {
  it('replaces a Jira user mention (by email) with the GitHub username', () => {
    const result = cleanJiraContent('Ping [~alice@example.com] please', users, undefined);
    expect(result).to.contain('@alice-gh');
    expect(result).to.contain('Alice A');
  });

  it('replaces a Jira user mention by name', () => {
    const result = cleanJiraContent('Ping [~alice] please', users, undefined);
    expect(result).to.contain('@alice-gh');
  });

  it('leaves plain text untouched apart from markdown conversion', () => {
    const result = cleanJiraContent('Just some plain text', users, undefined);
    expect(result).to.contain('Just some plain text');
  });

  it('strips leftover {quote} markers', () => {
    const result = cleanJiraContent('Some {quote} text', users, undefined);
    expect(result).to.not.contain('{quote}');
  });
});
