var redis = require('redis');

var HOST = 'localhost';
var PORT = '6486';
var AUTH = null;

// Redis To Go is a Heroku Add-on
if (process.env.REDISTOGO_URL) {
  var url = require('url').parse(process.env.REDISTOGO_URL);
  HOST = url.hostname;
  PORT = url.port;
  AUTH = url.auth.split(':')[1];
}


function createClient() {
  var client = redis.createClient(PORT, HOST);
  if (AUTH) client.auth(AUTH);
  return client;
}
exports.createClient = createClient;
