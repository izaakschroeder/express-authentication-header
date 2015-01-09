
'use strict';

var header = require('header'),
	express = require('express'),
	request = require('supertest');

describe('header', function() {
	it('should return a function', function() {
		expect(header({
			scheme: 'Basic',
			verify: function() { }
		})).to.be.instanceof(Function);
	});

	it('should authenticate if used multiple times', function(done) {
		var middleware = header({
			scheme: 'Test',
			verify: function(token, callback) {
				callback(null, true);
			}
		});

		var app = express();

		app.use(middleware);
		app.get('/secret', middleware, function(req, res) {
			res.status(200).send({
				challenge: !!req.challenge,
				authenticated: req.authenticated
			});
		});

		request(app)
			.get('/secret')
			.set('Authorization', 'Test foo')
			.expect(function(res) {
				expect(res.statusCode).to.equal(200);
				expect(res.body).to.have.property('challenge', true);
				expect(res.body).to.have.property('authenticated', true);
			})
			.end(done);
	});
});
