# Node HTTP Authorization Header Parser and Generator

[![Dependency Status](https://david-dm.org/MitMaro/http-authorization-header.svg)][1]
[![Build Status](https://travis-ci.org/MitMaro/http-authorization-header.svg?branch=master)][2]
[![Coverage Status](https://coveralls.io/repos/github/MitMaro/http-authorization-header/badge.svg?branch=master)][3]
[![NPM version](https://img.shields.io/npm/v/@mitmaro/http-authorization-header.svg)][4]
[![GitHub license](https://img.shields.io/badge/license-ISC-blue.svg)][5]

Parses and generates HTTP Authorization and Proxy-Authorization headers strictly following [RFC-7235][6]. Supports
legacy style auth-schemes (Basic, Digest, Bearer) as well as the more modern key-value auth params.

## Install

    npm install --save @mitmaro/http-authorization-header

## Usage

### Parse Header

```ecmascript 6
const http = require('http');
const {parse} = require('@mitmaro/http-authorization-header');

const httpServer = http.createServer((req, res) => {
    const authHeader = req.getHeader('Authorization');
    // authHeader => 'myscheme foo=bar, baz=foobar, buzz="quoted \"value!\""
    
    const authData = parse(authHeader);
    
    console.log(authData);
    /*
    {
        scheme: 'myscheme',
        values: [
            ['foo', 'bar'],
            ['baz', 'foobar],
            ['buzz', 'quotes "value!"']
        ]
    }
    */
}).listen();
```
### Create Header

```ecmascript 6
const {create, createToken68} = require('@mitmaro/http-authorization-header');

// legacy header value support (Basic, Digest, Bearer)
const basicAuthHeader = createToken68('Basic', Buffer.from('username:password').toString('base64'));
// Basic dXNlcm5hbWU6cGFzc3dvcmQ=

// modern form
const rfc7235Header = create('Custom', [['foo', 'bar'], ['foo', 'fuzz'], ['buzz', 'quoted "value!"']]);
// Custom foo=bar,foo=fuzz,buzz="quoted \"value!\""
```

### All exports
```ecmascript 6
const {
	create,
	createUnsafe,
	createToken68,
	createToken68Unsafe,
	parse,
	InvalidHeaderError,
	InvalidInputError,
} = require('@mitmaro/http-authorization-header');
```

## API

### `parse(headerValue: string): {scheme: string, value: ?string, values: ?Array.<Array.<string, string>>}`

Parses a authorization header value returning the parsed data as a JavaScript object. If the header cannot be
successfully parsed due to invalid input, a `InvalidHeaderError` will be thrown.

For legacy headers the return will contain values for the properties that are strings, a `scheme` and a `value`.

```
// Basic Zm9vOmJhcg==
{
    scheme: 'Basic',
    value: 'Zm9vOmJhcg=='
}
```

For modern headers the return will contain important properties, a `scheme` and `values`. `scheme` is astring while
`values` in an array of 2-tuples, where each 2-tuple contains the auth param name and value, respectively.

```
// Custom foo=bar,foo=fuzz,buzz="quoted \"value!\""
{
    scheme: 'Custom',
    values: [
        ['foo', 'bar'],
        ['foo', 'fuzz'],
        ['buzz', 'quoted "value!"']
    ]
}
```

### `create(scheme: string [, params: Array.<Array.<string, string>>]): string`

The `create` function creates a Authorization header value from a scheme as an optional array of 2-tuple, where each
2-tuple contains the auth-param name and value, respectively. Auth param values are automatically quotes only when
needed. A `InvalidInputError` will be thrown if the provided values are not valid.

```ecmascript 6
create('Custom', [
    ['foo', 'bar'],
    ['foo', 'fuzz'],
    ['buzz', 'quoted "value!"']
]);
// Custom foo=bar,foo=fuzz,buzz="quoted \"value!\""
```

### `createUnsafe(scheme: string [, params: Array.<Array.<string, string>>]): string`

The `createUnsafe` function is identical to `create` in every way except that it does not perform any input validation.
It is faster for cases where you can be sure the values provided will not cause an error.

### `createToken68(scheme: string [, token: string]): string`

The `createToken68` function can be used to generate legacy auth-schemes (Basic, Digest, Bearer) Authorization header
values. It takes a `scheme` and an optional `token`. You are responsible for encoding the `token` using base64,
base64url, base32, base16 or another compatible encoding. An `InvalidInputError` will be thrown if any of the input
values are invalid.

```ecmascript 6
createToken68('Basic', Buffer.from('username:password').toString('base64'));
// Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

### `createToken68Unsafe(scheme: string [, token: string]): string`

The `createToken68Unsafe` function is identical to `createToken68` in every way except that it does not perform any
input validation. It is faster for cases where you can be sure the values provided will not cause an error.

## Errors

### `InvalidInputError`

Thrown when the input provided to a creation function is not compliant with RFC-7235. The message will contain a
description of why the input was invalid.

### `InvalidHeaderError`

Thrown when the header value provided to the parse function is not compliant with RFC-7235. The message will
contain a description of why the header value was invalid.

## Contributing

If the library is not in compliance with RFC-7235 then create an issue explaining the issue with sample data, or even
better create a pull request that adds a test that fails.

## Development

Development is done using Node 8 and NPM 5, and tested against both Node 6 and Node 8. To get started

* Install Node 8 from [NodeJS.org][7] or using [nvm]
* Clone the repository using `git clone git@github.com:MitMaro/http-authorization-header.git`
* `cd http-authorization-header`
* Install the dependencies `npm install`
* Make changes, add tests, etc.
* Run linting and test suite using `npm run test`

## License

Based on [auth-header][8] which was licensed under [CC0-1.0][9]. This project is released under the
[ISC license][LICENSE].

[1]:https://david-dm.org/MitMaro/http-authorization-header
[2]:https://travis-ci.org/MitMaro/http-authorization-header
[3]:https://coveralls.io/github/MitMaro/http-authorization-header?branch=master
[4]:https://www.npmjs.com/package/@mitmaro/http-authorization-header
[5]:https://raw.githubusercontent.com/MitMaro/http-authorization-header/master/LICENSE
[6]:https://tools.ietf.org/html/rfc7235
[7]:https://nodejs.org/en/download/
[8]:https://github.com/izaakschroeder/auth-header
[9]:https://creativecommons.org/publicdomain/zero/1.0/
[nvm]:https://github.com/creationix/nvm#installation
