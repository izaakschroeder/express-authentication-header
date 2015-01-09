
'use strict';

var _ = require('lodash'),
	assign = require('./assign'),
	challenge = require('./challenge'),
	verify = require('express-authentication-verify'),
	async = require('express-async'),
	once = require('express-once');

module.exports = function create(options) {

	var result = {
		assign: assign(options),
		verify: verify(options),
		challenge: challenge(options)
	};

	return _.assign(once(async.serial(
		result.assign,
		result.verify,
		result.challenge
	)), result);
};
