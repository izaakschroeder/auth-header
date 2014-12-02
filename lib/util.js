
'use strict';

var token = /^[^\u0000-\u001F\u007F()<>@,;:\\"/?={}\[\]\u0020\u0009]+$/;

function isToken(str) {
	return token.test(str);
}

module.exports = {
	isScheme: isToken,
	isToken: isToken
};
