'use strict';

const InvalidInputError = require('../../src/error/invalid-input-error');
const {create, createToken68} = require('../../src/create');

describe('/src/create', function () {
	describe('#create', function () {
		[
			{
				description: 'with only scheme',
				scheme: 'foo',
				params: [],
				value: 'foo',
			},
			{
				description: 'with valid characters and boundaries on scheme',
				scheme: '!#$%&\'*+-.09AZ^_`az|~',
				params: [],
				value: '!#$%&\'*+-.09AZ^_`az|~',
			},
			{
				description: 'with token only values',
				scheme: 'foo',
				params: [['bar', 'baz'], ['bar', 'baz']],
				value: 'foo bar=baz,bar=baz',
			},
			{
				description: 'with quotes in values',
				scheme: 'foo',
				params: [['bar', '"baz'], ['bar', 'b"az'], ['bar', 'ba"z'], ['bar', 'baz"']],
				value: 'foo bar="\\"baz",bar="b\\"az",bar="ba\\"z",bar="baz\\""',
			},
			{
				description: 'with mixed values',
				scheme: 'foo',
				params: [['bar', 'b"az'], ['bar', 'baz']],
				value: 'foo bar="b\\"az",bar=baz',
			},
			{
				description: 'with empty values',
				scheme: 'foo',
				params: [['bar', 'baz'], ['bar', '']],
				value: 'foo bar=baz,bar=""',
			},
		].forEach(({description, scheme, params, value, only}) => {
			(only ? it.only : it)(`should create ${description}`, function () {
				expect(create(scheme, params)).to.equal(value);
			});
		});

		it('should error if invalid token is provided (space)', function () {
			expect(() => create(String.fromCharCode(0x20)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided (")', function () {
			expect(() => create(String.fromCharCode(0x22)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided [(]', function () {
			expect(() => create(String.fromCharCode(0x28)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided [)]', function () {
			expect(() => create(String.fromCharCode(0x29)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided (,)', function () {
			expect(() => create(String.fromCharCode(0x2C)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided (/)', function () {
			expect(() => create(String.fromCharCode(0x2F)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided (:)', function () {
			expect(() => create(String.fromCharCode(0x3A)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided (@)', function () {
			expect(() => create(String.fromCharCode(0x40)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided ([)', function () {
			expect(() => create(String.fromCharCode(0x5B)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided (])', function () {
			expect(() => create(String.fromCharCode(0x5D)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided ({)', function () {
			expect(() => create(String.fromCharCode(0x7B)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided (})', function () {
			expect(() => create(String.fromCharCode(0x7D)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token is provided (del 0x7F)', function () {
			expect(() => create(String.fromCharCode(0x7F)))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		// won't repeat all invalid param names here as it is the same check as the scheme
		it('should error if invalid param name is provided (")', function () {
			expect(() => create('foo', [['bar"', 'baz']]))
				.to.throw(InvalidInputError, 'Params provided contains invalid param name');
		});
	});

	describe('#createToken68', function () {
		// skipping exhaustive checks for token68 values as it's already tested in the parser
		// skipping exhaustive checks for scheme values as it's already tested in the #create tests
		[
			{
				description: 'with only scheme',
				scheme: 'foo',
				token: undefined,
				value: 'foo',
			},
			{
				description: 'with basic scheme and value',
				scheme: 'foo',
				token: 'aaa=',
				value: 'foo aaa=',
			},
		].forEach(({description, scheme, token, value, only}) => {
			(only ? it.only : it)(`should create ${description}`, function () {
				expect(createToken68(scheme, token)).to.equal(value);
			});
		});

		it('should error if invalid scheme is provided (")', function () {
			expect(() => createToken68('"'))
				.to.throw(InvalidInputError, 'Scheme provided contains invalid characters');
		});

		it('should error if invalid token68 value is provided (")', function () {
			expect(() => createToken68('foo', '"'))
				.to.throw(InvalidInputError, 'Token provided contains invalid characters');
		});
	});
});
