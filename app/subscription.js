var http = require('https'),
    querystring = require('querystring'),
    Redis = require('./redis'),
    Instagram = require('./instagram');


function Subscription(attributes) {
  this.attributes = attributes;
};
module.exports = Subscription;

Subscription.create = function(attributes, callback) {
  attributes['status'] = 'pending';
  var subscription = new Subscription(attributes);

  Instagram.subscribeToGeography(attributes, function(data) {
    subscription.attributes['id'] = data.id;
    subscription.attributes['object'] = 'geography';
    subscription.attributes['status'] = 'active';
    subscription.save(function() {
      callback(subscription);
    });
  });
};

Subscription.findAll = function(callback) {
  var subscriptions = [];
  var client = Redis.createClient();
  client.keys('subscription:*', function(error, keys) {
    if (!keys || keys.length === 0) {
      client.quit();
      callback([]);
    }
    else {
      client.mget(keys, function(error, values) {
        client.quit();
        subscriptions = values.map(function(value) {
          return JSON.parse(value);
        });
        callback(subscriptions);
      });
    }
  });
}

Subscription.deleteAll = function(callback) {
  Instagram.deleteAllSubscriptions(function(data) {
    if (data.meta.code == 200) {
      var client = Redis.createClient();
      client.keys('subscription:*', function(error, keys) {
        client.del(keys, function(error) {
          client.quit();
          callback();
        });
      });
    }
  });
}


Subscription.prototype.phone = function() {
  return this.attributes['phone'];
}

Subscription.prototype.save = function(callback) {
  var self = this;
  var client = Redis.createClient();
  client.set('subscription:' + this.attributes.id, JSON.stringify(this.attributes), function() {
    client.quit();
    callback(self);
  });
};

