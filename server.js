/*

    Instagram real-time updates demo app.

*/


var url = require('url'),
  redis = require('redis'),
  settings = require('./settings'),
  helpers = require('./helpers'),
  subscriptions = require('./subscriptions');

var app = settings.app;


app.get('/callbacks/geo/:geoName', function(request, response){
    // The GET callback for each subscription verification.
  var params = url.parse(request.url, true).query;
  console.log("GET " + request.url); 
  response.send(params['hub.challenge'] || 'No hub.challenge present');
});

app.get('/callbacks/tag/:tagName', function(request, response) {
  var params = url.parse(request.url, true).query;
  console.log("GET " + request.url); 
  response.send(params['hub.challenge'] || 'No hub.challenge present');
});

app.post('/callbacks/tag/:tagName', function(request, response) {
  console.log("PUT /callbacks/tag/" + request.params.tagName);

  if(!helpers.isValidRequest(request))
    response.send('FAIL');
});

app.post('/callbacks/geo/:geoName', function(request, response){
  console.log("PUT /callbacks/geo/" + request.params.geoName);
   // The POST callback for Instagram to call every time there's an update
   // to one of our subscriptions.
    
   // First, let's verify the payload's integrity
   if(!helpers.isValidRequest(request))
     response.send('FAIL');
    
    // Go through and process each update. Note that every update doesn't
    // include the updated data - we use the data in the update to query
    // the Instagram API to get the data we want.
  var updates = request.body;
  var geoName = request.params.geoName;
  for(index in updates){
    var update = updates[index];
    if(update['object'] == "geography")
      helpers.processGeography(geoName, update);
  }
  console.log("Processed " + updates.length + " updates");
  response.send('OK');
});

// Render the home page
app.get('/', function(request, response){
  console.log("GET /");
  helpers.getMedia(function(error, media){
  console.log("Got media: " + error + "," + media);
  response.render('geo.jade', {
        locals: { images: media }
    });
  });
});

app.get('/test', function(request, response){
  //helpers.getMinID('san-francisco',  function(error, minID) {
  //  response.send("MinID: " + minID);
  //});

  var r = redis.createClient(settings.REDIS_PORT, settings.REDIS_HOST);
  r.get('min-id:channel:san-francisco', function(error, minID) {
    console.log("minID = " + minID);
    response.send("MinID: " + minID);
    r.quit();
  });
});

app.listen(settings.appPort);
