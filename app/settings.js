var express = require('express');

var app = express.createServer();
exports.app = app;

exports.debug = true;
exports.CLIENT_SECRET = process.env.IG_CLIENT_SECRET;

app.set('view engine', 'jade');

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/../public/'));
});
app.configure('development', function(){
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
    app.use(express.errorHandler());
});

require('./instagram').configure({
  client_id: process.env.IG_CLIENT_ID,
  client_secret: process.env.IG_CLIENT_SECRET,
  callback_host: process.env.IG_CALLBACK_HOST
});
