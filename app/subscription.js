var http = require('https'),
    querystring = require('querystring'),
    _ = require('underscore'),
    Redis = require('./redis'),
    Instagram = require('./instagram'),
    Twilio = require('./twilio');


function Subscription(attributes) {
  this.attributes = _({}).extend(attributes);
};
module.exports = Subscription;

Subscription.create = function(attributes, callback) {
  attributes['status'] = 'pending';
  var subscription = new Subscription(attributes);

  Instagram.subscribeToGeography(attributes, function(data) {
    _(subscription.attributes).extend({
      id: data.id,
      status: 'active',
      object: 'geography',
      object_id: data.object_id
    });
    subscription.save(function() {
      callback(subscription);
    });
  });
};

Subscription.find = function(id, callback) {
  var client = Redis.createClient();
  client.get('subscription:' + id, function(error, value) {
    client.quit();
    callback(new Subscription(JSON.parse(value)));
  });
}

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
          return new Subscription(JSON.parse(value));
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
  client.set('subscription:' + this.attributes.id, JSON.stringify(this), function() {
    client.quit();
    if (callback) callback(self);
  });
};

Subscription.prototype.update = function(attributes, callback) {
  _(this.attributes).extend(attributes);
  this.save(callback); 
};

Subscription.prototype.notify = function(posts, callback) {
  var self = this;
  _(posts).each(function(post) {
    var sms = {
      to: self.attributes.phone,
      body: 'Update from @' + post.user.username + ': instagram://media?id=' + post.id
    };
    Twilio.sendSMS(sms, function() {
      console.log("Twilio: sent %j", sms);
    });
  });
}

Subscription.prototype.getLatestPost = function(callback) {
  Instagram.getRecentForGeography(this.attributes.object_id, { count: 1 }, function(posts) {
    callback(_(posts).first());
  });
}

Subscription.prototype.toJSON = function() {
  return this.attributes;
}
