var assert = require('assert'),
    gently = new (require('gently'));

var twilio = new (require('../app/twilio.js'));

module.exports = {
  
  'testSendSMSSendsRequest': function() {
    gently.expect(twilio, 'createRequest', function(options, callback) {
      var request = {};
      gently.expect(request, 'write', function(data) {
        assert.equal('From=%2B14155992671&To=%2B14156405816&Body=test%20through%20Twilio', data);
      });
      gently.expect(request, 'end');
      return request;
    });
    twilio.sendSMS({to: '+14156405816', body: 'test through Twilio'}, function(response) {
      gently.verify();
    });
  },

  // Actually sends SMS so not great for unit testing but good for
  // development and debugging
  'testSendsSMS': function(){
   twilio.sendSMS({to: '+14156405816', body: 'test through Twilio'});
  } 
};


