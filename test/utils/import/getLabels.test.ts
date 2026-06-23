import { expect } from 'chai';
import getLabels from '../../../src/utils/import/getLabels';

// Minimal Jira issue fixture covering the fields getLabels reads unconditionally
const baseIssue = () =>
  ({
    project: { key: 'PROJ' },
    type: { name: 'Bug' },
    status: { name: 'In Progress', statusCategory: { key: 'indeterminate' } },
    labels: { edges: [] },
    fixVersions: { totalCount: 0, edges: [] },
    versions: { totalCount: 0, edges: [] },
    components: { totalCount: 0, edges: [] },
    resolution: null,
    priority: null,
  } as any);

describe('utils/import/getLabels', () => {
  it('always adds a Jira project label and the issue type', () => {
    const labels = getLabels(baseIssue());
    expect(labels).to.include('Jira:PROJ');
    expect(labels).to.include('Bug');
  });

  it('adds a Status label when the status category is in progress', () => {
    expect(getLabels(baseIssue())).to.include('Status:In Progress');
  });

  it('does not add a Status label for new/done categories', () => {
    const issue = baseIssue();
    issue.status = { name: 'Done', statusCategory: { key: 'done' } };
    expect(getLabels(issue)).to.not.include('Status:Done');
  });

  it('appends issue labels, components and priority', () => {
    const issue = baseIssue();
    issue.labels = { edges: [{ node: { name: 'frontend' } }] };
    issue.components = { totalCount: 1, edges: [{ node: { name: 'API' } }] };
    issue.priority = { name: 'High' };
    const labels = getLabels(issue);
    expect(labels).to.include('frontend');
    expect(labels).to.include('Component:API');
    expect(labels).to.include('Priority:High');
  });

  it('truncates labels longer than 50 characters in the middle', () => {
    const issue = baseIssue();
    const longName = 'x'.repeat(80);
    issue.labels = { edges: [{ node: { name: longName } }] };
    const labels = getLabels(issue);
    const truncated = labels.find((l: string) => l.includes('...'));
    expect(truncated).to.be.a('string');
    expect((truncated as string).length).to.be.at.most(50);
  });
});
