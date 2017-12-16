'use strict';

const index = require('../../src/');

describe('index', function () {
	it('should load index file', function () {
		expect(Object.keys(index)).to.deep.equal([
			'create',
			'createUnsafe',
			'createToken68',
			'createToken68Unsafe',
			'parse',
			'InvalidHeaderError',
			'InvalidInputError',
		]);
	});
});
