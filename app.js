/*
  Send notification SMS when new Instagram post matches subscription.
*/


var url = require('url'),
  settings = require('./app/settings'),
  helpers = require('./app/helpers'),
  Subscription = require('./app/subscription');

/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

// List all subscriptions
app.get('/subscriptions', function(request, response) {

});

// Create a new subscription
app.post('/subscriptions', function(request, response) {
  helpers.debug("POST " + request.url); 
  var params = url.parse(request.url, true).query;
  
  if (!request.body['phone'] || !request.body['lat'] || !request.body['lng'])
  {
    response.send(500);
    return;
  }

  var subscription = Subscription.create(request.body);
  console.log("Created Subscription: %s", subscription.attributes);
  response.send(subscription.attributes);
});

// The GET callback for each subscription verification.
app.get('/callbacks/geo', function(request, response){
  helpers.debug("GET " + request.url); 
  var params = url.parse(request.url, true).query;
  response.send(params['hub.challenge'] || 'No hub.challenge present');
});

// The POST callback for Instagram to call every time there's an update
// to one of our subscriptions.
app.post('/callbacks/geo', function(request, response){
  helpers.debug("PUT " + request.url);

  // First, let's verify the payload's integrity
  if(!helpers.isValidRequest(request))
    response.send('FAIL');

  // Go through and process each update. Note that every update doesn't
  // include the updated data - we use the data in the update to query
  // the Instagram API to get the data we want.
  var updates = request.body;
  console.log(updates);
  // var geoName = request.params.geoName;
  // for(index in updates){
  //   var update = updates[index];
  //   if(update['object'] == "geography") {
  //     helpers.debug("Processing update: " + update);
  //     helpers.processGeography(geoName, update);
  //   }
  // }
  helpers.debug("Processed " + updates.length + " updates");
  response.send('OK');
});

// Render the home page
app.get('/', function(request, response){
  response.render('subscriptions/index.jade');
});


 if (!module.parent) {
   app.listen(process.env.PORT || 3000, function() {
     console.log("Express server listening on port %d, environment: %s", 
                 app.address().port, app.settings.env)
   });
 }

