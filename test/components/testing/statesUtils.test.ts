import { expect } from 'chai';
import { getId } from '../../../src/components/testingStates/utils';

describe('components/testingStates/utils', () => {
  it('is deterministic for the same dependency', () => {
    const dep = { name: 'mocha', version: '7.1.1' };
    expect(getId(dep)).to.equal(getId(dep));
  });

  it('produces a valid v5 UUID', () => {
    expect(getId({ name: 'mocha', version: '7.1.1' })).to.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('treats names/versions differing only by case or punctuation as equal', () => {
    expect(getId({ name: 'My-Lib', version: '1.0.0' })).to.equal(
      getId({ name: 'mylib', version: '100' }),
    );
  });

  it('produces different ids for different dependencies', () => {
    expect(getId({ name: 'a', version: '1' })).to.not.equal(
      getId({ name: 'b', version: '1' }),
    );
  });
});
