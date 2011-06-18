var assert = require('assert'),
    gently = new (require('gently'));

var app = require('../app'),
    Subscription = require('../app/subscription');

module.exports = {

  'POST /subscribe returns subscription': function() {
    var attributes = { phone: '+14150000000', lat: '37.761216', lng: '-122.43953' };
    gently.expect(Subscription, 'create', function(attributes) {
      return new Subscription(attributes);
    });

    assert.response(app, {
      url: '/subscribe',
      method: 'POST',
      data: JSON.stringify(attributes),
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    },
    function(response) {
      data = JSON.parse(response.body);
      assert.equal(data.phone, attributes.phone);
      gently.verify();
    });

  },

  'POST /subscribe fails validation': function() {
    assert.response(app, {
      url: '/subscribe',
      method: 'POST',
      data: '',
      headers: { 'Content-Type': 'application/json' }
    }, {
      status: 500,
    });
  },

};

