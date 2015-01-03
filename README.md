# express-authentication-header

Authenticate against any [RFC7235] HTTP `Authorization` header, compatible with [express-authentication].

![build status](http://img.shields.io/travis/izaakschroeder/express-authentication-header/master.svg?style=flat)
![coverage](http://img.shields.io/coveralls/izaakschroeder/express-authentication-header/master.svg?style=flat)
![license](http://img.shields.io/npm/l/express-authentication-header.svg?style=flat)
![version](http://img.shields.io/npm/v/express-authentication-header.svg?style=flat)
![downloads](http://img.shields.io/npm/dm/express-authentication-header.svg?style=flat)

```javascript
var header = require('express-authentication-header'),
	auth = require('express-authentication');

// Validate the challenge
app.use(header({
	scheme: 'API',
	verify: function(challenge, callback) {
		callback(null, challenge.token === 'secret');
	}
}));

app.get('/', auth.required(), function(req, res) {
	res.status(200).send('Hello world.');
});

```

[express-authentication]: https://github.com/izaakschroeder/express-authentication
[RFC7235]: https://tools.ietf.org/html/rfc7235
