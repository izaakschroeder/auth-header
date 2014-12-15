
'use strict';

var _ = require('lodash'),
	util = require('./util');

// lol dis
var body = /((?:[a-zA-Z0-9._~+\/-]+=*(?:\s+|$))|[^\u0000-\u001F\u007F()<>@,;:\\"/?={}\[\]\u0020\u0009]+)(?:=([^\\"=\s,]+|"(?:[^"\\]|\\.)*"))?/g;

function normalize(prev, cur) {
	// Fixup quoted strings and tokens with spaces around them
	if (cur.charAt(0) === '"') {
		cur = cur.substr(1, cur.length - 2).replace(/\\"/g, '"');
	} else {
		cur = cur.trim();
	}

	// Marshal
	if (_.isArray(prev)) {
		return prev.concat(cur);
	} else if (prev) {
		return [ prev, cur ];
	} else {
		return cur;
	}
}

function parseProperties(scheme, string) {
	var res = null, params = { }, token = null;

	while ((res = body.exec(string)) !== null) {
		if (res[2]) {
			params[res[1]] = normalize(params[res[1]], res[2]);
		} else {
			token = normalize(token, res[1]);
		}
	}

	return {
		scheme: scheme,
		params: params,
		token: token
	};
}


function parseAuthorization(str) {
	if (!_.isString(str)) {
		throw new TypeError('Header value must be a string.');
	}

	var start = str.indexOf(' '),
		scheme = str.substr(0, start);

	if (!util.isScheme(scheme)) {
		throw new TypeError('Invalid scheme ' + scheme + '.');
	}

	return parseProperties(scheme, str.substr(start));
}

module.exports = parseAuthorization;
