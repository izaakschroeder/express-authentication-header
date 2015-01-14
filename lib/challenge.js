
'use strict';

var _ = require('lodash'),
	authHeader = require('auth-header');

/**
 * @param {Object} options Configuration options.
 * @param {String} options.scheme Name of scheme e.g. Basic
 * @param {Object} options.challenge Params to advertise e.g. realm=foo
 * @param {Boolean} options.advertise: True to enable
 * @returns {Function} middleware
 */
module.exports = function challenge(options) {

	//
	if (_.isString(options)) {
		options = {
			scheme: options
		};
	}

	// Defaults
	options = _.assign({
		advertise: true
	}, options);

	// Pre-compute cause we can.
	var ad = authHeader.challenge(options);

	// Advertise a WWW-Authenticate challenge; note that a single request
	// may have multiple challenges so we can't simply `set` a header since
	// it will overwrite everything else.
	return function challengeMiddleware(req, res, next) {
		if (!options.advertise) {
			next();
		} else if (!req.challenge || !req.authenticated) {
			res.append('WWW-Authenticate', ad);
			next();
		} else {
			next();
		}

	};
};
