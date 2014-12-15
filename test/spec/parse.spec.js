
'use strict';

var parse = require('parse');

describe('parse', function() {
	it('should fail on invalid schemes', function() {
		expect(function() {
			parse('@foo');
		}).to.throw(TypeError);
	});

	it('should fail if a boolean', function() {
		expect(function() {
			parse(true);
		}).to.throw(TypeError);
	});

	it('should fail if an object', function() {
		expect(function() {
			parse({ });
		}).to.throw(TypeError);
	});

	it('should fail if null', function() {
		expect(function() {
			parse(null);
		}).to.throw(TypeError);
	});

	it('should coalesce many values', function() {
		var result = parse('foo a=1 a=2 a=3');
		expect(result).to.deep.equal({
			scheme: 'foo',
			token: null,
			params: {
				a: ['1', '2', '3']
			}
		});
	});

	it('should handle Basic', function() {
		var result = parse('Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==');
		expect(result).to.deep.equal({
			scheme: 'Basic',
			token: 'QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
			params: { }
		});
	});

	it('should handle Basic with post-parameters', function() {
		var result = parse('Basic 2932ff== realm="with\\"quote"');
		expect(result).to.deep.equal({
			scheme: 'Basic',
			token: '2932ff==',
			params: {
				realm: 'with"quote'
			}
		});
	});

	it('should handle Basic with pre-parameters', function() {
		var result = parse('Basic realm="foo" QWxhZGRpbjpvcGVuIHNlc2FtZQ==');
		expect(result).to.deep.equal({
			scheme: 'Basic',
			token: 'QWxhZGRpbjpvcGVuIHNlc2FtZQ==',
			params: {
				realm: 'foo'
			}
		});
	});

	it('should handle AWS4-HMAC-SHA256', function() {
		var result = parse('AWS4-HMAC-SHA256 Credential=EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=host;range;x-amz-date, Signature=fe5f80f77d5fa3beca038a248ff02');
		expect(result).to.deep.equal({
			scheme: 'AWS4-HMAC-SHA256',
			token: null,
			params: {
				Credential: 'EXAMPLE/20130524/us-east-1/s3/aws4_request',
				SignedHeaders: 'host;range;x-amz-date',
				Signature: 'fe5f80f77d5fa3beca038a248ff02'
			}
		});
	});

	it('should handle Bearer', function() {
		var result = parse('Bearer mF_9.B5f-4.1JqM');
		expect(result).to.deep.equal({
			scheme: 'Bearer',
			token: 'mF_9.B5f-4.1JqM',
			params: { }
		});
	});

	it('should handle Digest', function() {
		var result = parse('Digest realm="testrealm@host.com", qop="auth,auth-int", nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093", opaque="5ccc069c403ebaf9f0171e9517f40e41"');
		expect(result).to.deep.equal({
			scheme: 'Digest',
			token: null,
			params: {
				realm: 'testrealm@host.com',
				qop: 'auth,auth-int',
				nonce: 'dcd98b7102dd2f0e8b11d0f600bfb0c093',
				opaque: '5ccc069c403ebaf9f0171e9517f40e41'
			}
		});
	});

	it('should handle custom schemes', function() {
		var result = parse('MyAuth api=42146432 api=934054 foo=bar baz="ding"');
		expect(result).to.deep.equal({
			scheme: 'MyAuth',
			token: null,
			params: {
				api: [ '42146432', '934054' ],
				foo: 'bar',
				baz: 'ding'
			}
		});
	});
});
