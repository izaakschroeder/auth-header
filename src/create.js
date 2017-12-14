'use strict';

const {isToken, isToken68} = require('./utils');
const InvalidInputError = require('./error/invalid-input-error');

/**
 * Double quote a provided string, escaping embedded quotes with a `\"`
 * @param {string} str The string to quote
 * @returns {string} The quoted string
 */
function quoteString(str) {
	let value = str;
	let index = 0;
	while (index < str.length) {
		if (value.charAt(index) === '"') {
			value = `${value.slice(0, index)}\\${value.slice(index)}`;
			index++;
		}
		index++;
	}

	return `"${value}"`;
}

/**
 * Create a Token68 based authorization value without any validation checks
 * @param {string} scheme The auth scheme
 * @param {string=} token A Token68 formatted auth parameter
 * @returns {string} A formatted authorization header value
 */
function createToken68Unsafe(scheme, token) {
	return token === undefined ? scheme : `${scheme} ${token}`;
}

/**
 * Create a Token68 based authorization value with validation checks
 * @param {string} scheme The auth scheme
 * @param {string=} token A Token68 formatted auth parameter
 * @returns {string} A formatted authorization header value
 * @throws {InvalidInputError} If `scheme` or `token` are not valid values
 */
function createToken68(scheme, token) {
	if (!isToken(0, scheme)) {
		throw new InvalidInputError('Scheme provided contains invalid characters');
	}

	if (token !== undefined && !isToken68(0, token)) {
		throw new InvalidInputError('Token provided contains invalid characters');
	}

	return createToken68Unsafe(scheme, token);
}

/**
 * Create a authorization value without validation checks
 * @param {string} scheme The auth scheme
 * @param {Array.<Array.<string, string>>} params An array of tuple pairs of key and value
 * @returns {string} A formatted authorization header value
 */
function createUnsafe(scheme, params) {
	const paramValues = [];
	for (const [name, value] of params) {
		paramValues.push(`${name}=${isToken(0, value) ? value : quoteString(value)}`);
	}
	return paramValues.length ? `${scheme} ${paramValues.join(',')}` : scheme;
}

/**
 * Create a authorization value with validation checks
 * @param {string} scheme The auth scheme
 * @param {Array.<Array.<string, string>>} params An array of tuple pairs of key and value
 * @returns {string} A formatted authorization header value
 * @throws {InvalidInputError} If `scheme` or a param name are not valid values
 */
function create(scheme, params = []) {
	if (!isToken(0, scheme)) {
		throw new InvalidInputError('Scheme provided contains invalid characters');
	}

	for (const [name] of params) {
		if (!isToken(0, name)) {
			throw new InvalidInputError('Params provided contains invalid param name');
		}
	}
	return createUnsafe(scheme, params);
}

module.exports = {
	create,
	createUnsafe,
	createToken68,
	createToken68Unsafe,
};
