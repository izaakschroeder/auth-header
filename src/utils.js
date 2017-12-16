'use strict';

/**
 * Determine if string provided is a token68 as defined in RFC-7235 Section 2.1 and Appendix C from startIndex on
 * @param {number} startIndex The start index to start checking for the token68
 * @param {string} str The string to extract the token68 from
 * @returns {boolean} True if the value is a valid token68 value, otherwise false
 */
function isToken68(startIndex, str) {
	let index = startIndex;
	while (index < str.length) {
		const charCode = str.charCodeAt(index);
		if (
			(charCode >= 0x30 && charCode <= 0x39) // 0-9
			|| (charCode >= 0x41 && charCode <= 0x5A) // A-Z
			|| (charCode >= 0x61 && charCode <= 0x7A) // a-z
			|| charCode === 0x2D // -
			|| charCode === 0x2E // .
			|| charCode === 0x5F // _
			|| charCode === 0x7E // ~
			|| charCode === 0x2B // +
			|| charCode === 0x2f // /
		) {
			index++;
			continue;
		}
		break;
	}
	if (index === startIndex) {
		return false;
	}

	// scan over any optional `=`s
	while (index < str.length) {
		if (str.charCodeAt(index) === 0x3D) {
			index++;
			continue;
		}
		break;
	}
	return index === str.length;
}

/**
 * Determine if string provided is a token as defined in RFC-7230 Section 3.2.6 from startIndex on
 * @param {number} startIndex The start index to start checking for the token
 * @param {string} str The string to check if it matches a token
 * @returns {boolean} True if the value is a token or false otherwise
 */
function isToken(startIndex, str) {
	let index = startIndex;

	if (index === str.length) {
		return false;
	}

	do {
		const charCode = str.charCodeAt(index);
		if (
			   charCode === 0x21 // !
			|| charCode === 0x23 // #
			|| charCode === 0x24 // $
			|| charCode === 0x25 // %
			|| charCode === 0x26 // &
			|| charCode === 0x27 // '
			|| charCode === 0x2A // *
			|| charCode === 0x2B // +
			|| charCode === 0x2D // -
			|| charCode === 0x2E // .
			|| (charCode >= 0x30 && charCode <= 0x39) // 0-9
			|| (charCode >= 0x41 && charCode <= 0x5A) // A-Z
			|| charCode === 0x5E // ^
			|| charCode === 0x5F // _
			|| charCode === 0x60 // `
			|| (charCode >= 0x5E && charCode <= 0x7A) // a-z
			|| charCode === 0x7C // |
			|| charCode === 0x7E // ~
		) {
			index++;
			continue;
		}
		break;
	} while (index < str.length);

	return index === str.length;
}

module.exports = {
	isToken,
	isToken68,
};
