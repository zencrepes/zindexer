import { expect } from 'chai';
import getEsIndex, { getId } from '../../../src/components/esUtils/getEsIndex';

describe('components/esUtils/getEsIndex', () => {
  describe('getId', () => {
    it('lowercases and strips non-alphanumeric characters', () => {
      expect(getId('My Source-Name!')).to.equal('mysourcename');
    });
  });

  describe('getEsIndex', () => {
    it('returns the index name unchanged when oneIndex is false', () => {
      expect(getEsIndex('gh_issues_', false, 'My Source')).to.equal('gh_issues_');
    });

    it('appends a sanitized source name when oneIndex is true', () => {
      expect(getEsIndex('gh_issues_', true, 'My Source')).to.equal('gh_issues_mysource');
    });

    it('lowercases the resulting index name', () => {
      expect(getEsIndex('GH_Issues_', true, 'Source')).to.equal('gh_issues_source');
    });
  });
});
