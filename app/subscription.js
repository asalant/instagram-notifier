var http = require('https'),
    querystring = require('querystring'),
    Redis = require('./redis'),
    Instagram = require('./instagram'),
    twilio = new (require('../app/twilio.js'));


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
    if (callback) callback(self);
  });
};

Subscription.prototype.update = function(attributes, callback) {
  for (attribute in attributes) {
   this.attributes[attribute] = attributes[attribute];
  }
  this.save(callback); 
};

Subscription.prototype.notify = function(posts, callback) {
  for (var index in posts) {
    var post = posts[index];
    var sms = {
      to: this.attributes.phone,
      body: 'Update from @' + post.user.username + ': instagram://media?id=' + post.id
    };
    twilio.sendSMS(sms, function() {
      console.log("Twilio: sent %j", sms);
    });
  }
}

