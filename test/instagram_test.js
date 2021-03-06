var assert = require('assert'),
    gently = new (require('gently'));

var Instagram = require('../app/instagram.js').configure({});


module.exports = {
  
  'subscribes to geography': function() {
    gently.expect(Instagram, 'createRequest', function(options, callback) {
      var request = {};
      gently.expect(request, 'write', function(data) {
        assert.includes(data, 'lat=1&lng=2&radius=100');
      });
      gently.expect(request, 'end');
      return request;
    });
    Instagram.subscribeToGeography({ lat:'1', lng:'2' }, function(data) {
                                  
    });
  },

  'removes all subscriptions': function() {
    gently.expect(Instagram, 'createRequest', function(options, callback) {
      var request = {};
      assert.includes(options.path, 'object=all');
      gently.expect(request, 'end');
      return request;
    });
    Instagram.deleteAllSubscriptions(function(data) {

    });
  },


};


