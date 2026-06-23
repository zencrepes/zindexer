import { expect } from 'chai';
import { getId } from '../../../src/utils/misc/getId';

describe('utils/misc/getId', () => {
  it('lowercases the input', () => {
    expect(getId('HELLO')).to.equal('hello');
  });

  it('strips non-alphanumeric characters (keeping the + sign)', () => {
    expect(getId('Hello, World!')).to.equal('helloworld');
    expect(getId('a+b')).to.equal('a+b');
  });

  it('removes spaces, dashes and punctuation', () => {
    expect(getId('My-Repo Name_123')).to.equal('myreponame123');
  });

  it('coerces non-string input to a string', () => {
    expect(getId(12345 as unknown as string)).to.equal('12345');
  });

  it('returns an empty string when nothing is alphanumeric', () => {
    expect(getId('***')).to.equal('');
  });
});
