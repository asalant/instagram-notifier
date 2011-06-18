var http = require('https'),
    querystring = require('querystring'),
    Redis = require('./redis'),
    Instagram = require('./instagram');


function Subscription(attributes) {
  this.attributes = attributes;
};
module.exports = Subscription;

Subscription.create = function(attributes) {
  attributes['status'] = 'pending';
  var subscription = new Subscription(attributes);

  Instagram.subscribeToGeography(attributes, function(data) {
    subscription.attributes['id'] = data.id;
    subscription.attributes['object'] = 'geography';
    subscription.attributes['status'] = 'active';
    subscription.save();
  });

  return subscription;
};
exports.create = Subscription.create;

Subscription.find_all = function() {
  var subscriptions = [];
  var client = Redis.createClient();
  client.keys('subscription:*', function(error, keys) {
    client.mget(keys, function(error, values) {
      subscriptions = values.map(function(value) {
        return JSON.parse(value);
      });
    });
  });

  return subscriptions;
}

Subscription.prototype.phone = function() {
  return this.attributes['phone'];
}

Subscription.prototype.save = function() {
  var client = Redis.createClient();
  client.set('subscription:' + this.attributes.id, JSON.stringify(this.attributes), function() {
    client.quit();
  });
};

