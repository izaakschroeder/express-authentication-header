
'use strict';

var _ = require('lodash'),
	header = require('auth-header');

/**
 * Assign the relevant authentication header as the challenge for the request,
 * optionally transforming it with a "parse" function.
 *
 * @param {Object} options Configuration options.
 * @param {Function} options.parse Options function to parse header output.
 * @param {String} options.scheme Scheme e.g. Basic
 * @param {Object} options.match Params to match e.g. realm=foo
 * @returns {Function} middleware
 */
module.exports = function assign(options) {

	if (_.isString(options)) {
		options = { scheme: options };
	}


	// Defaults.
	options = _.assign({
		parse: _.identity,
		scheme: null,
		match: { }
	}, options);

	// Type safety.
	if (!_.isString(options.scheme)) {
		throw new TypeError();
	} else if (!_.isFunction(options.parse)) {
		throw new TypeError();
	}

	return function assignMiddleware(req, res, next) {
		// If something else already provided a challenge we are hosed. This
		// is most likely an error on the implementors part since they would
		// have to be injecting this middleware twice for that to happen
		if (req.challenge) {
			return next({ error: 'MUTLIPLE_CHALLENGE' });
		}

		// If we haven't cached an already parsed auth header, then try and
		// suss it out. If parsing of the auth header fails for any reason
		// then just blame it on the user.
		try {
			if (!req._authHeader) {
				req._authHeader = header(req.get('Authorization'));
			}
			// Extract the particular auth header that we're interested in from
			// all of the auth headers provided.
			var challenge = req._authHeader.for(options.scheme, options.match);
			if (challenge) {
				req.challenge = options.parse(challenge);
			}
		} catch (e) {
			return next(_.defaults(e, { status: 400 }));
		}

		return next();
	};
};
