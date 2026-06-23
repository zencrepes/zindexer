import { expect } from 'chai';
import { getSafeFilename } from '../../../src/utils/misc/getSafeFilename';

describe('utils/misc/getSafeFilename', () => {
  it('keeps dots, dashes and underscores', () => {
    expect(getSafeFilename('my-file_name.txt')).to.equal('my-file_name.txt');
  });

  it('lowercases the filename', () => {
    expect(getSafeFilename('Report.PDF')).to.equal('report.pdf');
  });

  it('strips characters that are not allowed in filenames', () => {
    expect(getSafeFilename('in voi/ce#1.png')).to.equal('invoice1.png');
  });

  it('coerces non-string input to a string', () => {
    expect(getSafeFilename(42 as unknown as string)).to.equal('42');
  });
});
