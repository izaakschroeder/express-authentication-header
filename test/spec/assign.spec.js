
'use strict';

var express = require('express'),
	request = require('supertest'),
	assign = require('assign');

describe('#assign', function() {
	beforeEach(function() {
		var app = express(),
		middleware = assign('Basic');
		app.use(middleware);
		this.app = app;
	});

	it('should fail with no scheme', function() {
		expect(assign).to.throw(TypeError);
	});

	it('should fail if `options.parse` is not a function', function() {
		expect(function() {
			assign({ scheme: 'Basic', parse: true });
		}).to.throw(TypeError);
	});

	it('should not re-parse the `Authorization` header', function(done) {
		var app = express(), stub = sinon.stub();
		app.use(function(req, res, next) {
			Object.defineProperty(req, 'challenge', {
				set: stub,
				get: function() {
					return null;
				}
			});
			next();
		});
		app.use(assign('Basic'));
		app.use(assign('Bearer'));
		request(app)
			.get('/')
			.set('Authorization', 'Bearer abc')
			.expect(function() {
				expect(stub).to.be.calledOnce;
			})
			.end(done);
	});

	it('should populate `req.challenge`', function(done) {
		this.app.use(function(req, res) {
			res.status(200).send(req.challenge);
		});
		request(this.app)
			.get('/')
			.set('Authorization', 'Basic abc')
			.expect(function(res) {
				expect(res.body).to.have.property('token', 'abc');
			})
			.end(done);
	});

	it('should use `options.parse` for `req.challenge`', function(done) {
		var app = express(),
			stub = sinon.stub();
		app.use(assign({ scheme: 'Basic', parse: stub }));
		request(app)
			.get('/')
			.set('Authorization', 'Basic abc')
			.expect(function() {
				expect(stub).to.be.calledOnce
					.and.be.calledWithMatch({ token: 'abc' });
			})
			.end(done);
	});

	it('should ignore other `Authorization` headers', function(done) {
		this.app.use(function(req, res, next) {
			expect(req.challenge).to.have.property('token', 'abc');
			next();
		});
		request(this.app)
			.get('/')
			.set('Authorization', [
				'Basic abc',
				'Bearer def'
			])
			.end(done);
	});

	it('should fail if multiple values match', function(done) {
		request(this.app)
			.get('/')
			.set('Authorization', [
				'Basic abc',
				'Basic def'
			])
			.end(done);
	});

	it('should fail if a challenge is already set', function(done) {
		var app = express();
		app.use(function(req, res, next) {
			req.challenge = 'foo';
			next();
		});
		app.use(assign('Basic'));
		request(app)
			.get('/')
			.set('Authorization', 'Basic abc')
			.end(done);
	});

	it('should fail if header is malformed', function(done) {
		request(this.app)
			.get('/')
			.set('Authorization', 'B$"%')
			.expect(function(res) {
				expect(res.statusCode).to.equal(400);
			})
			.end(done);
	});
});
