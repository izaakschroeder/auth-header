'use strict';

const {RuntimeError} = require('jeepers');

module.exports = class InvalidHeaderError extends RuntimeError {};
