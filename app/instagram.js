/*  Subscribe to geography

    curl -F "client_id=$IG_CLIENT_ID" \
             -F "client_secret=$IG_CLIENT_SECRET" \
             -F 'object=geography' \
             -F 'aspect=media' \
             -F 'lat=37.761216 ' \
             -F 'lng=-122.43953' \
             -F 'radius=5000' \
             -F "callback_url=$IG_CALLBACK_HOST/callbacks/geo/san-francisco/" \
             https://api.instagram.com/v1/subscriptions
*/

/*  Clear all subscriptions

    curl -X DELETE \
     "https://api.instagram.com/v1/subscriptions?object=all&client_id=$IG_CLIENT_ID&client_secret=$IG_CLIENT_SECRET"
*/

var http = require('https'),
    querystring = require('querystring'),
    crypto = require('crypto');


function Instagram() {}  
module.exports = Instagram;

Instagram.configure = function(options) {
  this.API_HOST = 'api.instagram.com';
  this.API_SUBSCRIPTIONS_PATH = '/v1/subscriptions';
  this.API_GEOGRAPHIES_PATH = '/v1/geographies';
  this.CALLBACK_HOST = options.callback_host;
  this.CALLBACK_PATH = '/callbacks/geo';
  this.CLIENT_ID = options.client_id;
  this.CLIENT_SECRET = options.client_secret;
  return this;
};

Instagram.subscribeToGeography = function(params, responseCallback){
  var data = querystring.stringify({
    client_id: this.CLIENT_ID,
    client_secret: this.CLIENT_SECRET,
    object: 'geography',
    aspect: 'media',
    lat: params.lat,
    lng: params.lng,
    radius: 5000,
    callback_url: this.CALLBACK_HOST + this.CALLBACK_PATH
  });
 
  console.log("Instagram: subscribing with " + data);
  
  var options = {
    host: this.API_HOST,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length
    },
    path: this.API_SUBSCRIPTIONS_PATH
  };

  var request = Instagram.createRequest(options, function(response) {
    response.setEncoding('utf8');
    var body = '';
    console.log('Instagram API response status: ' + response.statusCode);
    console.log('Instagram API response headers: ' + JSON.stringify(response.headers));
    response.on('data', function (chunk) {
      console.log('Instagram API response: ' + chunk);
      body += chunk
    });
    response.on('end', function() {
      var data = JSON.parse(body).data;
      responseCallback(data);
    });
  });

  request.write(data);
  request.end();
};


Instagram.deleteAllSubscriptions = function(responseCallback){
  var data = querystring.stringify({
    client_id: this.CLIENT_ID,
    client_secret: this.CLIENT_SECRET,
    object: 'all',
 });
 
  console.log("Instagram: removing all subscriptions with %j", data);
  
  var options = {
    host: this.API_HOST,
    method: 'DELETE',
    headers: {
      'Content-Length': 0
    },
    path: this.API_SUBSCRIPTIONS_PATH + "?" + data
  };

  var request = Instagram.createRequest(options, function(response) {
    response.setEncoding('utf8');
    var body = '';
    console.log('Instagram API response status: ' + response.statusCode);
    console.log('Instagram API response headers: ' + JSON.stringify(response.headers));
    response.on('data', function (chunk) {
      console.log('Instagram API response: ' + chunk);
      body += chunk
    });
    response.on('end', function() {
      responseCallback(response.statusCode == 200 ? JSON.parse(body) : {});
    });
  });

  request.end();
};

Instagram.getRecentForGeography = function (geographyId, options, responseCallback) {
  var params = {
    client_id: this.CLIENT_ID
  };
  for (var p in options) {
    params[p] = options[p];
  }
 
  console.log("Instagram: getting recent updates for %j from ", params);
  
  var options = {
    host: this.API_HOST,
    headers: {
      'Content-Length': 0
    },
    path: this.API_GEOGRAPHIES_PATH + "/" + geographyId + "/media/recent?" +  querystring.stringify(params)
  };

  var request = Instagram.createRequest(options, function(response) {
    response.setEncoding('utf8');
    var body = '';
    console.log('Instagram API response status: ' + response.statusCode);
    console.log('Instagram API response headers: ' + JSON.stringify(response.headers));
    response.on('data', function (chunk) {
      console.log('Instagram API response: ' + chunk);
      body += chunk
    });
    response.on('end', function() {
      responseCallback(response.statusCode == 200 ? JSON.parse(body).data : {});
    });
  });

  request.end();
}

Instagram.createRequest = function(options, callback) {
  var request = http.request(options, callback);
  request.on('error', function(e) {
    console.log('Instagram API error: ' + e.message);
  });
  return request;
};

Instagram.isValidHubRequest = function (request) {
    // First, let's verify the payload's integrity by making sure it's
    // coming from a trusted source. We use the client secret as the key
    // to the HMAC.
    var hmac = crypto.createHmac('sha1', this.CLIENT_SECRET);
    hmac.update(request.rawBody);
    var providedSignature = request.headers['x-hub-signature'];
    var calculatedSignature = hmac.digest(encoding='hex');
    
    // If they don't match up or we don't have any data coming over the
    // wire, then it's not valid.
    return !((providedSignature != calculatedSignature) || !request.body)
}





