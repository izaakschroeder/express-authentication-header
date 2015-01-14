
'use strict';

var express = require('express'),
	request = require('supertest'),
	challenge = require('challenge');

describe('#challenge', function() {
	beforeEach(function() {
		this.app = express();
	});
	it('should fail with no scheme', function() {
		expect(function() {
			challenge();
		}).to.throw(TypeError);
	});

	it('should set `WWW-Authenticate` header with scheme', function(done) {
		this.app.use(challenge('Basic'));
		request(this.app)
			.get('/')
			.expect(function(res) {
				expect(res.headers).to.have
					.property('www-authenticate', 'Basic');
			})
			.end(done);
	});

	it('should not set `WWW-Authenticate` if not `advertise`', function(done) {
		this.app.use(challenge({ scheme: 'Basic', advertise: false }));
		request(this.app)
			.get('/')
			.expect(function(res) {
				expect(res.headers).to.not.have.property('www-authenticate');
			})
			.end(done);
	});

	it('should set `WWW-Authenticate` header with params', function(done) {
		this.app.use(challenge({ scheme: 'Basic', params: { realm: 'foo' }}));
		request(this.app)
			.get('/')
			.expect(function(res) {
				expect(res.headers).to.have
				.property('www-authenticate', 'Basic realm=foo');
			})
			.end(done);
	});

	it('should not clobber the WWW-Authenticate header', function(done) {
		this.app.use(function(req, res, next) {
			res.set('WWW-Authenticate', 'Other');
			next();
		});
		this.app.use(challenge({ scheme: 'Basic', params: { realm: 'foo' }}));
		request(this.app)
			.get('/')
			.expect(function(res) {
				expect(res.headers['www-authenticate'])
					.to.contain('Basic realm=foo');
				expect(res.headers['www-authenticate'])
					.to.contain('Other');
			})
			.end(done);
	});

	it('should challenge when authentication fails', function(done) {
		this.app.use(function(req, res, next) {
			req.challenge = true;
			req.authenticated = false;
			next();
		});
		this.app.use(challenge('Basic'));
		request(this.app)
			.get('/')
			.expect(function(res) {
				expect(res.headers).to.have.property('www-authenticate');
			})
			.end(done);
	});

	it('should challenge when authentication not attempted', function(done) {
		this.app.use(function(req, res, next) {
			req.challenge = true;
			req.authenticated = false;
			next();
		});
		this.app.use(challenge('Basic'));
		request(this.app)
			.get('/')
			.expect(function(res) {
				expect(res.headers).to.have.property('www-authenticate');
			})
			.end(done);
	});

	it('should not challenge when authentication succeeds', function(done) {
		this.app.use(function(req, res, next) {
			req.challenge = true;
			req.authenticated = true;
			next();
		});
		this.app.use(challenge('Basic'));
		request(this.app)
			.get('/')
			.expect(function(res) {
				expect(res.headers).not.to.have.property('www-authenticate');
			})
			.end(done);
	});
});
