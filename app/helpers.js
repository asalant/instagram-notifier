var redis = require('redis');
var settings = require('./settings');
var crypto = require('crypto');


function isValidRequest(request) {
    // First, let's verify the payload's integrity by making sure it's
    // coming from a trusted source. We use the client secret as the key
    // to the HMAC.
    var hmac = crypto.createHmac('sha1', settings.CLIENT_SECRET);
    hmac.update(request.rawBody);
    var providedSignature = request.headers['x-hub-signature'];
    var calculatedSignature = hmac.digest(encoding='hex');
    
    // If they don't match up or we don't have any data coming over the
    // wire, then it's not valid.
    return !((providedSignature != calculatedSignature) || !request.body)
}
exports.isValidRequest = isValidRequest;

function debug(msg) {
  if (settings.debug) {
    console.log(msg);
  }
}
exports.debug = debug;
