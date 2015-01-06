
'use strict';

var _ = require('lodash'),
	util = require('./util');

function buildChallenge(params, options) {

	options = _.assign({
		separator: ' ',
		quote: false
	}, options);

	if (_.isArray(params)) {
		return _.chain(params)
			.map(function processPair(pair) {
				var key, values = null;

				// Figure out which is key and which is value
				if (_.isArray(pair)) {
					key = pair[0];
					values = pair[1];
				} else if (_.isString(pair)) {
					key = pair;
				} else {
					throw new TypeError();
				}

				if (values && !util.isToken(key)) {
					throw new TypeError();
				}

				if (!values) {
					return [ key ];
				}

				if (!_.isArray(values)) {
					values = [ values ];
				}

				return _.chain(values)
					.map(function handleQuotes(value) {
						if (options.quote || (value && !util.isToken(value))) {
							return '"' + value.replace(/"/g, '\\"') + '"';
						} else {
							return value;
						}
					})
					.map(function stringify(value) {
						return key + '=' + value;
					})
					.value();
			})
			.flatten(true)
			.join(options.separator)
			.value();
	} else if (_.isNull(params) || _.isUndefined(params)) {
		return null;
	} else if (_.isString(params)) {
		return buildChallenge([params]);
	} else if (_.isObject(params)) {
		return buildChallenge(_.pairs(params));
	} else {
		throw new TypeError();
	}
}

function buildHeader(scheme, token, params) {
	var obj;

	if (_.isString(scheme)) {
		obj = { scheme: scheme, token: token, params: params };
	} else {
		obj = scheme;
	}

	if (!_.isObject(obj)) {
		throw new TypeError();
	} else if (!util.isScheme(obj.scheme)) {
		throw new TypeError('Invalid scheme.');
	}

	params = buildChallenge(obj.params);
	token = buildChallenge(obj.token);

	return obj.scheme
		+ (token ? ' ' + token : '')
		+ (params ? ' ' + params : '');
}

module.exports = buildHeader;
