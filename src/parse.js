'use strict';

const InvalidTokenError = require('./error/invalid-header-error');
const {isToken68} = require('./utils');

/**
 * Skip over spaces and tabs from startIndex
 * @param {number} startIndex The index to start skipping from
 * @param {string} str The string to skip spaces on
 * @returns {number} The new index after spaces are skipped
 */
function skipSpacesTabs(startIndex, str) {
	let index = startIndex;
	while (index < str.length) {
		const charCode = str.charCodeAt(index);
		if (charCode === 0x20 || charCode === 0x09) {
			index++;
			continue;
		}
		break;
	}
	return index;
}

/**
 * Skip over spaces from startIndex
 * @param {number} startIndex The index to start skipping from
 * @param {string} str The string to skip spaces on
 * @returns {number} The new index after spaces are skipped
 */
function skipSpaces(startIndex, str) {
	let index = startIndex;
	while (index < str.length) {
		if (str.charCodeAt(index) === 0x20) {
			index++;
			continue;
		}
		break;
	}
	return index;
}

/**
 * Extracts a token as defined in RFC-7230 Section 3.2.6
 * @param {number} startIndex The start index to start extracting the token
 * @param {string} str The string to extract the token from
 * @throws {InvalidTokenError} If no token was found
 * @returns {Array.<string, number>} The token value and the new index
 */
function extractToken(startIndex, str) {
	let index = startIndex;

	if (index === str.length) {
		throw new InvalidTokenError('Unexpected end of string');
	}

	do {
		const charCode = str.charCodeAt(index);
		if (
			(charCode >= 0x30 && charCode <= 0x39) // 0-9
			|| (charCode >= 0x41 && charCode <= 0x5A) // A-Z
			|| (charCode >= 0x61 && charCode <= 0x7A) // a-z
			|| charCode === 0x21 // !
			|| charCode === 0x23 // #
			|| charCode === 0x24 // $
			|| charCode === 0x25 // %
			|| charCode === 0x26 // &
			|| charCode === 0x27 // '
			|| charCode === 0x2A // *
			|| charCode === 0x2B // +
			|| charCode === 0x2D // -
			|| charCode === 0x2E // .
			|| charCode === 0x5E // ^
			|| charCode === 0x5F // _
			|| charCode === 0x60 // `
			|| charCode === 0x7C // |
			|| charCode === 0x7E // ~
		) {
			index++;
			continue;
		}
		break;
	} while (index < str.length);

	if (index === startIndex) {
		throw new InvalidTokenError('Invalid token');
	}

	return [str.slice(startIndex, index), index];
}

/**
 * Extracts a quoted-string as defined in RFC-7230 Section 3.2.6
 * @param {number} startIndex The start index to start extracting the quoted string
 * @param {string} value The string to extract the double quoted value from
 * @throws {InvalidTokenError} If non-ascii characters are found, a matching quote is not found or an unexpected
 * character is found
 * @returns {Array.<string, number>} The value without the surrounding quotes and the new index
 */
function extractQuotedString(startIndex, value) {
	let str = value;
	let index = startIndex + 1;
	let quotedPair = false;
	let removedCharacters = 0;

	if (index === str.length) {
		throw new InvalidTokenError('Unexpected end of string');
	}
	do {
		const charCode = str.charCodeAt(index);

		// inside quoted pair
		if (quotedPair) {
			if (
				   charCode === 0x09 // horizontal tab
				|| (charCode >= 0x20 && charCode <= 0x7E) // space + printing chars
				|| (charCode >= 0x80 && charCode <= 0xFF) // extended ascii
			) {
				// remove quoted pair and replace with value: \" becomes "
				str = `${str.slice(0, index - 1)}${str.slice(index)}`;
				removedCharacters++;
			}
			else {
				throw new InvalidTokenError('Invalid character in quoted string');
			}
			quotedPair = false;
			continue;
		}

		// end of string found
		if (charCode === 0x22) { // "
			return [str.slice(startIndex + 1, index), index + removedCharacters + 1];
		}

		if (charCode === 0x5C) { // \
			quotedPair = true;
			index++;
			continue;
		}

		if (
			   charCode === 0x09 // tab
			|| charCode === 0x20 // space
			|| charCode === 0x21 // !
			// skip "
			|| (charCode >= 0x23 && charCode <= 0x5B) // # to [
			// skip \
			|| (charCode >= 0x5D && charCode <= 0x7E) // ] to ~
			// skip del
			|| (charCode >= 0x80 && charCode <= 0xFF) // extended ascii
		) {
			index++;
		}
		else {
			throw new InvalidTokenError('Invalid character in quoted string');
		}
	} while (index < str.length);
	throw new InvalidTokenError('Invalid character in token');
}

/**
 * Parses a Authorization header value to extract the values
 * @param {string} headerValue The header values
 * @returns {{scheme: string, value: ?string, values: ?Array.<Array.<string, string>>}} The parsed header value
 */
module.exports = function parseAuthorization(headerValue) {
	let token;

	if (typeof headerValue !== 'string') {
		throw new InvalidTokenError('Expected input to be a string');
	}

	let index = 0;
	try {
		token = extractToken(index, headerValue);
	}
	catch (err) {
		throw new InvalidTokenError('Invalid auth scheme', err);
	}
	const authScheme = token[0];
	index = token[1];

	// only auth-scheme with no auth-params
	if (index === headerValue.length) {
		return {
			scheme: authScheme,
			value: null,
			values: [],
		};
	}

	const newIndex = skipSpaces(index, headerValue);

	if (newIndex === index) {
		throw new InvalidTokenError('Invalid auth scheme; was expected a space');
	}
	index = newIndex;

	if (isToken68(index, headerValue)) {
		return {
			scheme: authScheme,
			value: headerValue.slice(index),
			values: null,
		};
	}

	// skip leading comma if it exists
	if (headerValue.charAt(index) === ',') {
		index = skipSpacesTabs(++index, headerValue);
	}

	let value;
	const values = [];

	while (index < headerValue.length) {
		try {
			[token, index] = extractToken(index, headerValue);
		}
		catch (err) {
			throw new InvalidTokenError('Invalid auth param name', err);
		}
		// check for equals that can be padded with whitespace
		index = skipSpacesTabs(index, headerValue);
		if (headerValue.charAt(index) !== '=') {
			throw new InvalidTokenError('Unexpected character in auth param; wanted an =');
		}
		index = skipSpacesTabs(index + 1, headerValue);

		try {
			// extract the value as either a token or a quoted string
			[value, index] = headerValue.charAt(index) === '"'
				? extractQuotedString(index, headerValue)
				: extractToken(index, headerValue);
		}
		catch (err) {
			throw new InvalidTokenError('Invalid auth param value', err);
		}

		values.push([token, value]);
		index = skipSpacesTabs(index, headerValue);
		if (headerValue.charAt(index) !== ',') {
			break;
		}
		index++;
		index = skipSpacesTabs(index, headerValue);
	}
	if (index !== headerValue.length) {
		throw new InvalidTokenError('Malformed value');
	}

	return {
		scheme: authScheme,
		value: null,
		values,
	};
};
