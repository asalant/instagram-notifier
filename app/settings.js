exports.debug = true;
exports.CLIENT_SECRET = process.env.IG_CLIENT_SECRET;

require('./instagram').configure({
  client_id: process.env.IG_CLIENT_ID,
  client_secret: process.env.IG_CLIENT_SECRET,
  callback_host: process.env.IG_CALLBACK_HOST
});
