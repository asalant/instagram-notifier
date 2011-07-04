var assert = require('assert'),
    gently = new (require('gently'));

var Subscription = require('../app/subscription'),
    Instagram = require('../app/instagram'),
    Twilio = require('../app/twilio'),
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

  'updates subscription': function() {
    var subscription = new Subscription({ id: 1, name: 'name' });
    gently.expect(subscription, 'save', function(callback) { callback() });
    subscription.update({ id: 2, phone: '123' }, function() {
      assert.eql(subscription.attributes, { id: 2, name: 'name', phone: '123' });                 
    });
  },


  'gets latest post': function() {
    gently.expect(Instagram, 'getRecentForGeography', function(object_id, params, callback) {
      assert.equal(1, object_id);
      assert.eql({ count: 1 }, params);
      callback([ { id: 1 }, { id: 2 }]);
    });


    var subscription = new Subscription({ object_id: 1 });
    subscription.getLatestPost(function(post) {
      assert.eql({ id: 1 }, post);
    });

  },

  'finds a subscription': function() {
    var client = {};
    gently.expect(Redis, 'createClient', function() {
      gently.expect(client, 'quit');
      return client;
    });
    gently.expect(client, 'get', function(key, callback) { 
      callback(null, '{ "id":1 }') 
    });

    Subscription.find('foo', function(subscription) {
      assert.eql(subscription.attributes, { id: 1 });
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
        
    Subscription.findAll(function(subscriptions) {
      assert.eql(subscriptions.map(function(value) { return value.attributes }), 
                 [ {id:1}, {id:2} ]);
      gently.verify();
    });

  },

    'finds no subscriptions': function() {
    var client = {};
    gently.expect(Redis, 'createClient', function() {
      gently.expect(client, 'quit');
      return client;
    });
    gently.expect(client, 'keys', function(pattern, callback) {
      callback(null, null);
    });
        
    Subscription.findAll(function(subscriptions) {
      assert.eql(subscriptions, []);
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
        
    Subscription.deleteAll(function() {
      gently.verify();
    });
  },
    
  'does not delete all subscriptions if Instagram fails': function() {
    gently.expect(Instagram, 'deleteAllSubscriptions', function(callback) {
      callback({ meta: { code: 500 } });
    });

    gently.expect(Redis, 'createClient', 0);
    
    Subscription.deleteAll(function() {
      gently.verify();
    });
  },


 'sends notifications': function() {
    gently.expect(Twilio, 'sendSMS', function(sms) {
      assertEqual('123', sms.to);
    });

    new Subscription({ phone: '123' }).notify([{ id: 1, user: { username: 'name' } }]);
  },






};

