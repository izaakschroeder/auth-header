'use strict';

const format = require('../../src/format');

describe('format', function () {
	it('should produce correct token property', function () {
		const res = format({
			scheme: 'Basic',
			token: 'QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
		});
		expect(res).to.equal('Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==');
	});

	it('should quote non-token values', function () {
		const res = format({
			scheme: 'Basic',
			token: '2932ff==',
			params: {
				realm: 'with"quote',
			},
		});
		expect(res).to.equal('Basic 2932ff== realm="with\\"quote"');
	});

	it('should handle array values', function () {
		const res = format({
			scheme: 'MyAuth',
			params: {
				api: ['42146432', '934054'],
				foo: 'bar',
				baz: 'ding',
			},
		});
		expect(res).to.equal('MyAuth api=42146432 api=934054 foo=bar baz=ding');
	});

	it('should handle simple strings', function () {
		expect(format('Basic')).to.equal('Basic');
	});

	it('should fail on invalid schemes', function () {
		expect(() => {
			format(':');
		}).to.throw(TypeError);
	});

	it('should fail if input is not an object', function () {
		expect(() => {
			format(false);
		}).to.throw(TypeError);
	});

	it('should fail if params are not an object', function () {
		expect(() => {
			format({
				scheme: 'hello',
				params: false,
			});
		}).to.throw(TypeError);
	});

	it('should fail if param keys are not tokens', function () {
		expect(() => {
			format({
				scheme: 'hello',
				params: {
					':bar': 'hi',
				},
			});
		}).to.throw(TypeError);
	});

	it('should fail if params array', function () {
		expect(() => {
			format({
				scheme: 'hello',
				params: [false],
			});
		}).to.throw(TypeError);
	});
});
