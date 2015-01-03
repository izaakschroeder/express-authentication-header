
'use strict';

var header = require('header');

describe('header', function() {
	it('should return a function', function() {
		expect(header({
			scheme: 'Basic',
			verify: function() { }
		})).to.be.instanceof(Function);
	});
});
