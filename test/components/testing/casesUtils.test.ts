import { expect } from 'chai';
import { getCaseId, getId } from '../../../src/components/testingCases/utils';

describe('components/testingCases/utils', () => {
  describe('getCaseId', () => {
    it('is deterministic for the same case', () => {
      const testCase = { id: 'case-1', createdAt: '2021-01-01T00:00:00Z' } as any;
      expect(getCaseId(testCase)).to.equal(getCaseId(testCase));
    });

    it('produces a valid v5 UUID', () => {
      const testCase = { id: 'case-1', createdAt: '2021-01-01T00:00:00Z' } as any;
      expect(getCaseId(testCase)).to.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('produces different ids for different cases', () => {
      const a = { id: 'case-1', createdAt: '2021-01-01T00:00:00Z' } as any;
      const b = { id: 'case-2', createdAt: '2021-01-01T00:00:00Z' } as any;
      expect(getCaseId(a)).to.not.equal(getCaseId(b));
    });
  });

  describe('getId', () => {
    it('is deterministic for the same dependency', () => {
      const dep = { name: 'chai', version: '4.0.0' };
      expect(getId(dep)).to.equal(getId(dep));
    });
  });
});
