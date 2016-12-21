import {expect} from 'chai';
import InvalidHeaderError from '../../src/invalid-header-error';

describe('InvalidHeaderError', () => {
  it('should inherit from Error', () => {
    expect(new InvalidHeaderError()).to.be.an.instanceof(Error);
  });

  it('should set given message', () => {
    expect(new InvalidHeaderError('foobar').message).to.equal('foobar');
  });
});
