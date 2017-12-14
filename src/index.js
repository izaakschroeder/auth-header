'use strict';

// TODO
// coveralls
// npm deploy
// fork repo
// replace content with repo
// move towards 1.0.0

const InvalidHeaderError = require('./error/invalid-header-error');
const InvalidInputError = require('./error/invalid-input-error');
const {create, createUnsafe, createToken68, createToken68Unsafe} = require('./create');
const parse = require('./parse');

module.exports = {
	create,
	createUnsafe,
	createToken68,
	createToken68Unsafe,
	parse,
	InvalidHeaderError,
	InvalidInputError,
};
