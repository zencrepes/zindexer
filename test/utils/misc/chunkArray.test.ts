import { expect } from 'chai';
import chunkArray from '../../../src/utils/misc/chunkArray';

describe('utils/misc/chunkArray', () => {
  it('splits an array into chunks of the requested size', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).to.deep.equal([[1, 2], [3, 4], [5]]);
  });

  it('returns a single chunk when the chunk size exceeds the array length', () => {
    expect(chunkArray([1, 2, 3], 10)).to.deep.equal([[1, 2, 3]]);
  });

  it('returns an empty array when the source array is empty', () => {
    expect(chunkArray([], 3)).to.deep.equal([]);
  });

  it('produces evenly sized chunks when the length is a multiple of the chunk size', () => {
    expect(chunkArray([1, 2, 3, 4], 2)).to.deep.equal([[1, 2], [3, 4]]);
  });
});
