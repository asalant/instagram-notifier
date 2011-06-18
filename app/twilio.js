/*
curl --user "$TW_ACCOUNT_SID:$TW_AUTH_TOKEN" \
    -F 'From=+14155992671' \
    -F 'To=+14156405816' \
    -F 'Body=SMS sent through Twilio' \
    "https://api.twilio.com/2010-04-01/Accounts/$TW_ACCOUNT_SID/SMS/Messages"
*/

var http = require('https'),
    querystring = require('querystring');


function Twilio() {
  this.ACCOUNT_SID = process.env.TW_ACCOUNT_SID;
  this.AUTH_TOKEN = process.env.TW_AUTH_TOKEN;
  this.API_HOST = 'api.twilio.com';
  this.API_BASE = '/2010-04-01/Accounts/' + this.ACCOUNT_SID;
  this.FROM_PHONE = '+14155992671';
};
module.exports = Twilio;

Twilio.prototype.echo = function(str) {
  return str;
}

Twilio.prototype.sendSMS = function(params){
  var data = querystring.stringify({
    From: this.FROM_PHONE,
    To: params['to'],
    Body: params['body']
  });
 
  console.log("Twilio: sending SMS to " + params.to + "  '" + params.body + "'");
  
  var options = {
    host: this.API_HOST,
    method: 'POST',
    headers: {
      Authorization: "Basic " + new Buffer(this.ACCOUNT_SID + ':' + this.AUTH_TOKEN).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length
    },
    path: this.API_BASE + '/SMS/Messages.json'
  };

  var request = this.createRequest(options,
   function(response) {
      console.log('STATUS: ' + response.statusCode);
      //console.log('HEADERS: ' + JSON.stringify(response.headers));
      response.setEncoding('utf8');
      response.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    }
  );

  request.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });

  request.on('end', function(e) {
    //console.log('DONE');
  });

  request.write(data);
  request.end();
};

Twilio.prototype.createRequest = function(options, callback) {
  return http.request(options, callback);
};
