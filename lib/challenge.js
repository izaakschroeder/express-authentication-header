
'use strict';

var authHeader = require('auth-header');

/**
 * @param {Object} options Configuration options.
 * @param {String} options.scheme Name of scheme e.g. Basic
 * @param {Object} options.challenge Params to advertise e.g. realm=foo
 * @returns {Function} middleware
 */
module.exports = function challenge(options) {

	// Pre-compute cause we can.
	var ad = authHeader.challenge(options);

	// Advertise a WWW-Authenticate challenge; note that a single request
	// may have multiple challenges so we can't simply `set` a header since
	// it will overwrite everything else.
	return function challengeMiddleware(req, res, next) {
		if (!req.challenge || !req.authenticated) {
			// TODO: Make this play nice with multiple values.
			// Really there should be support in express for this kind of thing.
			res.set('WWW-Authenticate', ad);
		}
		next();
	};
};
