// TODO: switch to logging library like https://github.com/csausdev/log4js-node
var settings = require('./settings');

function debug(msg) {
  if (settings.debug) {
    console.log(msg);
  }
}
exports.debug = debug;
