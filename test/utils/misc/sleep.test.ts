import { expect } from 'chai';
import sleep from '../../../src/utils/misc/sleep';

describe('utils/misc/sleep', () => {
  it('returns a promise', () => {
    const result = sleep(1);
    expect(result).to.be.an.instanceof(Promise);
    return result;
  });

  it('resolves after at least the requested delay', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    // Allow a small scheduling tolerance below the requested delay
    expect(elapsed).to.be.at.least(45);
  });
});
