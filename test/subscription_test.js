var assert = require('assert'),
    gently = new (require('gently'));

var Subscription = require('../app/subscription'),
    Instagram = require('../app/instagram'),
    Redis = require('../app/redis');

module.exports = {
  
  'creates subscription': function() {
    gently.expect(Instagram, 'subscribeToGeography', function(params) {
      assert.isNotNull(params.lat);
      assert.isNotNull(params.lng);
    });


    var subscription = Subscription.create({ phone: '+14150000000', lat:1, lng:2 });
    assert.isNotNull(subscription);
    assert.equal(subscription.phone(), '+14150000000');
    assert.equal(subscription.attributes['status'], 'pending');

    gently.verify();
  },

  'saves subscription': function () {
    gently.expect(Redis, 'createClient', function() {
      var client = {};
      gently.expect(client, 'set', function(key, value) {
        assert.equal(key, 'subscription:1');
        assert.equal(value, '{"id":1,"phone":"+4150000000"}');
      });
      return client;
    });

    var subscription = new Subscription({ id:1, phone: '+4150000000' });
    subscription.save();

    gently.verify();
  },

  'gets all subscriptions': function() {
    var client = {};
    gently.expect(Redis, 'createClient', function() {
     return client;
    });
    gently.expect(client, 'keys', function(pattern, callback) {
      callback(null, ['subscription:1', 'subscription:2']);
    });
    gently.expect(client, 'get', 2, function(key, callback) {
      assert.includes(key, 'subscription:');
      callback(null, '{}');
    });
        
    var subscriptions = Subscription.find_all();
    assert.eql(subscriptions, [ {}, {} ]);

    gently.verify();
  },



};

