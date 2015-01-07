
// We use multiple `WWW-Authenticate` headers following the notes herein: http://stackoverflow.com/questions/10239970/what-is-the-delimiter-for-www-authenticate-for-multiple-schemes

'use strict';

var _ = require('lodash'),
	parse = require('./parse'),
	format = require('./format');

function Header(options) {
	if (this instanceof Header === false) {
		return new Header(options);
	} else if (_.isNull(options) || _.isUndefined(options)) {
		this.values = [ ];
	} else if (_.isArray(options)) {
		this.values = _.map(options, Header.single);
	} else {
		this.values = [ Header.single(options) ];
	}
}

Header.single = function single(value) {
	if (_.isObject(value)) {
		return value;
	} else if (_.isString(value)) {
		return parse(value);
	} else {
		throw new TypeError();
	}
};

Header.parse = function _parse(str) {
	return new Header(str);
};

Header.format = Header.challenge = function _format(scheme, params) {
	return format(scheme, params);
};

Object.defineProperty(Header.prototype, 'length', {
	get: function getLength() {
		return this.values.length;
	}
});

Header.createIsMatch = function createIsMatch(scheme, query) {
	scheme = scheme.toLowerCase();
	return function isMatch(value) {
		return scheme === value.scheme.toLowerCase() &&
			// TODO: Convert this to `_.isMatch(value.params, query)` when
			// lodash ^3.0.0 hits npm. Additional note: ^3.0.0 also resolves
			// _.find(x, { }) === x[0], wherewas ^2.4.1 resolves to null thus
			// this _.isEmpty check.
			(_.isEmpty(query) || _.find([value.params], query));
	};
};

Header.prototype.is = function _is(type, query) {
	return !!this.for(type, query);
};

Header.prototype.for = function _for(type, query) {
	var result = _.filter(this.values, Header.createIsMatch(type, query));
	if (result.length === 0) {
		return null;
	} else if (result.length > 1) {
		throw new Error();
	} else {
		return result[0];
	}
};

module.exports = Header;
