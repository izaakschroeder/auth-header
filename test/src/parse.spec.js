'use strict';

const InvalidHeaderError = require('../../src/error/invalid-header-error');
const parse = require('../../src/parse');

const extdAsciiStart = String.fromCharCode(0x80);
const extdAsciiMiddle = String.fromCharCode(0xCC);
const extdAsciiEnd = String.fromCharCode(0xFF);

describe('/src/parse', function () {
	[
		{
			input: 'foo',
			scheme: 'foo',
			values: [],
		},
		{
			input: 'foo ',
			scheme: 'foo',
			values: [],
		},
		{
			input: 'foo a=1',
			scheme: 'foo',
			values: [['a', '1']],
		},
		{
			input: 'foo ,a=1',
			scheme: 'foo',
			values: [['a', '1']],
		},

		// whitespace tests
		{
			input: 'foo a   =   1',
			scheme: 'foo',
			values: [['a', '1']],
		},
		{
			input: 'foo    a=1,a=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a = 1,a = 1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a=1, a=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a=1,\ta=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a=1, \ta=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a=1,\t a=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a=1, \t a=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a=1\t,a=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a=1 \t,a=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a=1\t ,a=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo  a=1 \t ,a=1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo a\t=\t1,a\t=\t1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo a \t = \t 1,a \t = \t 1',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo a=1,a=1 ',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo a=1,a=1\t',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo a=1,a=1 \t',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo a=1,a=1\t ',
			scheme: 'foo',
			values: [['a', '1'], ['a', '1']],
		},
		{
			input: 'foo , a=1',
			scheme: 'foo',
			values: [['a', '1']],
		},
		{
			input: 'foo ,\ta=1',
			scheme: 'foo',
			values: [['a', '1']],
		},
		{
			input: 'foo ,\t a=1',
			scheme: 'foo',
			values: [['a', '1']],
		},
		{
			input: 'foo , \ta=1',
			scheme: 'foo',
			values: [['a', '1']],
		},

		// token tests
		{
			input: '0foo a=1',
			scheme: '0foo',
			values: [['a', '1']],
		},
		{
			input: '9foo a=1',
			scheme: '9foo',
			values: [['a', '1']],
		},
		{
			input: '!#$%&\'*+-.^_`|~ a=1',
			scheme: '!#$%&\'*+-.^_`|~',
			values: [['a', '1']],
		},
		{
			input: 'AKZ a=1',
			scheme: 'AKZ',
			values: [['a', '1']],
		},
		{
			input: 'akz a=1',
			scheme: 'akz',
			values: [['a', '1']],
		},

		// token68 tests
		{
			input: 'foo 0',
			scheme: 'foo',
			value: '0',
		},
		{
			input: 'foo 9',
			scheme: 'foo',
			value: '9',
		},
		{
			input: 'foo A',
			scheme: 'foo',
			value: 'A',
		},
		{
			input: 'foo Z',
			scheme: 'foo',
			value: 'Z',
		},
		{
			input: 'foo a',
			scheme: 'foo',
			value: 'a',
		},
		{
			input: 'foo z',
			scheme: 'foo',
			value: 'z',
		},
		{
			input: 'foo -',
			scheme: 'foo',
			value: '-',
		},
		{
			input: 'foo .',
			scheme: 'foo',
			value: '.',
		},
		{
			input: 'foo _',
			scheme: 'foo',
			value: '_',
		},
		{
			input: 'foo ~',
			scheme: 'foo',
			value: '~',
		},
		{
			input: 'foo +',
			scheme: 'foo',
			value: '+',
		},
		{
			input: 'foo /',
			scheme: 'foo',
			value: '/',
		},
		{
			input: 'foo aaaaa=',
			scheme: 'foo',
			value: 'aaaaa=',
		},
		{
			input: 'foo aaaaa===',
			scheme: 'foo',
			value: 'aaaaa===',
		},

		// quoted string values
		{
			input: 'foo a=""',
			scheme: 'foo',
			values: [['a', '']],
		},
		{
			input: 'foo a="1"',
			scheme: 'foo',
			values: [['a', '1']],
		},
		{
			input: 'foo a=" 1"',
			scheme: 'foo',
			values: [['a', ' 1']],
		},
		{
			input: 'foo a="1 "',
			scheme: 'foo',
			values: [['a', '1 ']],
		},
		{
			input: 'foo a=" 1 "',
			scheme: 'foo',
			values: [['a', ' 1 ']],
		},
		{
			input: 'foo a="\t1"',
			scheme: 'foo',
			values: [['a', '\t1']],
		},
		{
			input: 'foo a="1\t"',
			scheme: 'foo',
			values: [['a', '1\t']],
		},
		{
			input: 'foo a="\t1\t"',
			scheme: 'foo',
			values: [['a', '\t1\t']],
		},
		{
			input: 'foo a="1", a="2"',
			scheme: 'foo',
			values: [['a', '1'], ['a', '2']],
		},
		{
			input: `foo a="${extdAsciiStart}"`,
			scheme: 'foo',
			values: [['a', extdAsciiStart]],
		},
		{
			input: `foo a="${extdAsciiMiddle}"`,
			scheme: 'foo',
			values: [['a', extdAsciiMiddle]],
		},
		{
			input: `foo a="${extdAsciiEnd}"`,
			scheme: 'foo',
			values: [['a', extdAsciiEnd]],
		},
		{
			input: 'foo a="]", a="]"',
			scheme: 'foo',
			values: [['a', ']'], ['a', ']']],
		},
		{
			input: 'foo a="~", a="~"',
			scheme: 'foo',
			values: [['a', '~'], ['a', '~']],
		},
		{
			input: 'foo a="!"',
			scheme: 'foo',
			values: [['a', '!']],
		},
		{
			input: 'foo foo="bar", baz="foo"',
			scheme: 'foo',
			values: [['foo', 'bar'], ['baz', 'foo']],
		},
		{
			input: 'foo abc="def\\"", abc="de\\"f", abc="\\"def"',
			scheme: 'foo',
			values: [['abc', 'def"'], ['abc', 'de"f'], ['abc', '"def']],
		},
		{
			input: 'foo abc="\\"", abc="\\""',
			scheme: 'foo',
			values: [['abc', '"'], ['abc', '"']],
		},
		{
			input: 'foo abc="\\"a", abc="\\"a"',
			scheme: 'foo',
			values: [['abc', '"a'], ['abc', '"a']],
		},
		{
			input: 'foo abc="a\\"", abc="a\\""',
			scheme: 'foo',
			values: [['abc', 'a"'], ['abc', 'a"']],
		},
		{
			input: `foo abc="\\${extdAsciiStart}", abc="\\${extdAsciiStart}"`,
			scheme: 'foo',
			values: [['abc', extdAsciiStart], ['abc', extdAsciiStart]],
		},
		{
			input: `foo abc="\\${extdAsciiMiddle}", abc="\\${extdAsciiMiddle}"`,
			scheme: 'foo',
			values: [['abc', extdAsciiMiddle], ['abc', extdAsciiMiddle]],
		},
		{
			input: `foo abc="\\${extdAsciiEnd}", abc="\\${extdAsciiEnd}"`,
			scheme: 'foo',
			values: [['abc', extdAsciiEnd], ['abc', extdAsciiEnd]],
		},
		{
			input: 'foo abc="\\ ", abc="\\ "',
			scheme: 'foo',
			values: [['abc', ' '], ['abc', ' ']],
		},
		{
			input: 'foo abc="\\~", abc="\\~"',
			scheme: 'foo',
			values: [['abc', '~'], ['abc', '~']],
		},
		{
			input: 'foo abc="\\\t", abc="\\\t"',
			scheme: 'foo',
			values: [['abc', '\t'], ['abc', '\t']],
		},
		{
			input: `foo abc="${extdAsciiStart}a${extdAsciiMiddle}a${extdAsciiEnd}"`,
			scheme: 'foo',
			values: [['abc', `${extdAsciiStart}a${extdAsciiMiddle}a${extdAsciiEnd}`]],
		},

		{
			input: 'foo a=1, a=2',
			scheme: 'foo',
			values: [['a', '1'], ['a', '2']],
		},
		{
			input: 'foo foo=bar, baz=foo',
			scheme: 'foo',
			values: [['foo', 'bar'], ['baz', 'foo']],
		},
		{
			input: 'foo a=foo, b="bar",',
			scheme: 'foo',
			values: [['a', 'foo'], ['b', 'bar']],
		},
	].forEach(({input, scheme, value, values, only}) => {
		(only ? it.only : it)(`should successfully parse: (${input})`, function () {
			expect(parse(input)).to.deep.equal({
				scheme,
				value: value === undefined ? null : value,
				values: values === undefined ? null : values,
			});
		});
	});

	it('should fail if passed a boolean', function () {
		expect(() => parse(true)).to.throw(InvalidHeaderError, 'Expected input to be a string');
	});

	it('should fail if passed an object', function () {
		expect(() => parse({})).to.throw(InvalidHeaderError, 'Expected input to be a string');
	});

	it('should fail if passed a null', function () {
		expect(() => parse(null)).to.throw(InvalidHeaderError, 'Expected input to be a string');
	});

	it('should fail if passed undefined', function () {
		expect(() => parse(undefined)).to.throw(InvalidHeaderError, 'Expected input to be a string');
	});

	it('should fail on invalid scheme: (@foo)', function () {
		expect(() => parse('@foo')).to.throw(InvalidHeaderError, 'Invalid auth scheme');
	});

	it('should fail on invalid scheme: (f@oo)', function () {
		expect(() => parse('f@oo')).to.throw(InvalidHeaderError, 'Invalid auth scheme; was expected a space');
	});

	it('should fail on invalid scheme: (foo@)', function () {
		expect(() => parse('foo@')).to.throw(InvalidHeaderError, 'Invalid auth scheme; was expected a space');
	});

	it('should error on empty input', function () {
		expect(() => parse('')).to.throw(InvalidHeaderError, 'Invalid auth scheme');
	});

	it('should error on invalid auth param name', function () {
		expect(() => parse('foo a=1, @')).to.throw(InvalidHeaderError, 'Invalid auth param name');
	});

	it('should error on no equals after param name', function () {
		expect(() => parse('foo a=1, a'))
			.to.throw(InvalidHeaderError, 'Unexpected character in auth param; wanted an =');
	});

	it('should error on invalid character after param name', function () {
		expect(() => parse('foo a=1, a,'))
			.to.throw(InvalidHeaderError, 'Unexpected character in auth param; wanted an =');
	});

	it('should error on missing auth param value', function () {
		expect(() => parse('foo a=1, a=')).to.throw(InvalidHeaderError, 'Invalid auth param value');
	});

	it('should error on malformed header value', function () {
		expect(() => parse('foo a=1, a=b ccc')).to.throw(InvalidHeaderError, 'Malformed value');
	});

	it('should error on quoted string with no end', function () {
		expect(() => parse('foo a=1, a="foo')).to.throw(InvalidHeaderError, 'Invalid auth param value');
	});

	it('should error on quoted string without end or value', function () {
		expect(() => parse('foo a=1, a="')).to.throw(InvalidHeaderError, 'Invalid auth param value');
	});

	it('should error invalid characters in quoted value (0x1F us char)', function () {
		expect(() => parse(`foo a=1, a="${String.fromCharCode(0x1F)}"'`))
			.to.throw(InvalidHeaderError, 'Invalid auth param value');
	});

	it('should error invalid characters in quoted value (0x7F del char)', function () {
		expect(() => parse(`foo a=1, a="${String.fromCharCode(0x7F)}"'`))
			.to.throw(InvalidHeaderError, 'Invalid auth param value');
	});

	it('should error invalid characters in quoted value (outside US-ASCII charset)', function () {
		expect(() => parse(`foo a=1, a="${String.fromCharCode(0x100)}"'`))
			.to.throw(InvalidHeaderError, 'Invalid auth param value');
	});

	it('should error invalid characters in quoted pair (0x1F us char)', function () {
		expect(() => parse(`foo a=1, a="\\${String.fromCharCode(0x1F)}"'`))
			.to.throw(InvalidHeaderError, 'Invalid auth param value');
	});

	it('should error invalid characters in quoted pair (0x7F del char)', function () {
		expect(() => parse(`foo a=1, a="\\${String.fromCharCode(0x7F)}"'`))
			.to.throw(InvalidHeaderError, 'Invalid auth param value');
	});

	it('should error invalid characters in quoted pair (outside US-ASCII charset)', function () {
		expect(() => parse(`foo a=1, a="\\${String.fromCharCode(0x100)}"'`))
			.to.throw(InvalidHeaderError, 'Invalid auth param value');
	});
});
