'use strict';

const token = /^[^\u0000-\u001F\u007F()<>@,;:\\"/?={}[\]\u0020\u0009]+$/;

function isToken(str) {
	return typeof str === 'string' && token.test(str);
}

module.exports = {
	isToken,
	isScheme: isToken,
	quote: (str) => `"${str.replace(/"/g, '\\"')}"`,
	unquote: (str) => str.substr(1, str.length - 2).replace(/\\"/g, '"'),
};
