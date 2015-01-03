
'use strict';

var express = require('express'),
	auth = require('express-authentication'),
	path = require('path'),
	header = require(path.join(__dirname), '..');


var app = express();

app.use(header({
	scheme: 'API',
	verify: function verify(challenge, callback) {
		callback(null, challenge.token === 'wee');
	}
}));

app.get('/', auth.required(), function index(req, res) {
	res.status(200).send(auth.of(req));
});

app.listen(process.env.PORT);
