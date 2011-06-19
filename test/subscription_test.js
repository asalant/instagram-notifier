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


    Subscription.create({ phone: '+14150000000', lat:1, lng:2 }, function(subscription) {
      assert.isNotNull(subscription);
      assert.equal(subscription.phone(), '+14150000000');
      assert.equal(subscription.attributes['status'], 'pending');

      gently.verify();
    });
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
    subscription.save(function(saved) {
      assert.equal(saved, subscription);
      gently.verify();
    });
  },

  'gets all subscriptions': function() {
    var client = {};
    gently.expect(Redis, 'createClient', function() {
      gently.expect(client, 'quit');
      return client;
    });
    var ids = ['subscription:1', 'subscription:2'];
    gently.expect(client, 'keys', function(pattern, callback) {
      callback(null, ids);
    });
    gently.expect(client, 'mget', function(keys, callback) {
      assert.eql(keys, ids);
      callback(null, ['{"id":1}', '{"id":2}']);
    });
        
    Subscription.find_all(function(subscriptions) {
      assert.eql(subscriptions, [ {id:1}, {id:2} ]);
      gently.verify();
    });

  },

  'deletes all subscriptions': function() {
    gently.expect(Instagram, 'deleteAllSubscriptions', function(callback) {
      callback({ meta: { code: 200 } });
    });

    var client = {};
    gently.expect(Redis, 'createClient', function() {
      gently.expect(client, 'quit');
      return client;
    });
    var ids = ['subscription:1', 'subscription:2'];
    gently.expect(client, 'keys', function(pattern, callback) {
      callback(null, ids);
    });
    gently.expect(client, 'del', function(keys, callback) {
      assert.eql(keys, ids);
      callback(null);
    });
        
    Subscription.delete_all(function() {
      gently.verify();
    });
  },
    
  'does not delete all subscriptions if Instagram fails': function() {
    gently.expect(Instagram, 'deleteAllSubscriptions', function(callback) {
      callback({ meta: { code: 500 } });
    });

    gently.expect(Redis, 'createClient', 0);
    
    Subscription.delete_all(function() {
      gently.verify();
    });
  },






};

