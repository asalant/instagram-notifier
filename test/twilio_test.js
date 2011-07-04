var assert = require('assert'),
    gently = new (require('gently'));

var Twilio = require('../app/twilio');

module.exports = {
  
  'testSendSMSSendsRequest': function() {
    gently.expect(Twilio, 'createRequest', function(options, callback) {
      var request = {};
      gently.expect(request, 'write', function(data) {
        assert.equal('From=%2B14155992671&To=%2B14156405816&Body=test%20through%20Twilio', data);
      });
      gently.expect(request, 'end');
      return request;
    });
    Twilio.sendSMS({to: '+14156405816', body: 'test through Twilio'}, function(response) {
      gently.verify();
    });
  },

  // Actually sends SMS so not great for unit testing but good for
  // development and debugging
  // 'testSendsSMS': function(){
  //  Twilio.sendSMS({to: '+14156405816', body: 'test through Twilio'});
  // } 
};


