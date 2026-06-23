import { expect } from 'chai';
import { getRunId, getId } from '../../../src/components/testingRuns/utils';

describe('components/testingRuns/utils', () => {
  describe('getRunId', () => {
    it('is deterministic for the same id and createdAt', () => {
      const run = { id: 'run-1', createdAt: '2021-01-01T00:00:00Z' } as any;
      expect(getRunId(run)).to.equal(getRunId(run));
    });

    it('produces a valid v5 UUID', () => {
      const run = { id: 'run-1', createdAt: '2021-01-01T00:00:00Z' } as any;
      expect(getRunId(run)).to.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('produces different ids for different runs', () => {
      const a = { id: 'run-1', createdAt: '2021-01-01T00:00:00Z' } as any;
      const b = { id: 'run-2', createdAt: '2021-01-01T00:00:00Z' } as any;
      expect(getRunId(a)).to.not.equal(getRunId(b));
    });

    it('ignores non-alphanumeric characters when building the id', () => {
      const a = { id: 'run-1', createdAt: '2021-01-01' } as any;
      const b = { id: 'RUN1', createdAt: '20210101' } as any;
      expect(getRunId(a)).to.equal(getRunId(b));
    });
  });

  describe('getId', () => {
    it('is deterministic for the same dependency', () => {
      const dep = { name: 'lodash', version: '4.17.21' };
      expect(getId(dep)).to.equal(getId(dep));
    });

    it('treats names/versions differing only by case or punctuation as equal', () => {
      expect(getId({ name: 'My-Lib', version: '1.0.0' })).to.equal(
        getId({ name: 'mylib', version: '100' }),
      );
    });
  });
});
