$(function() {

  var Location = Backbone.Model.extend({
    boundary: 40,

    isNear: function(otherLocation) {
      if (_(this.toJSON()).isEmpty() || _(otherLocation.toJSON()).isEmpty())
        return false;
      else
        return this.boundary > calculateDistance(this.toJSON(), otherLocation.toJSON());
    },

    mapLink: function() {
      var attributes = this.toJSON();
      return 'http://maps.google.com/maps?z=14&q=' + attributes.lat + ',' + attributes.lng +
        '%20(' + escape('Found you here') + ')';
    }

  });

  var Subscription = Backbone.Model.extend({
    toHTML: function() {
      var attributes = this.toJSON();
      return $('<li/>').append($('<a class="subscription"/>')
        .attr('href', this.mapLink())
        .text(attributes.lat + ',' + attributes.lng + ' (id:' + attributes.object_id + ')')
      );
    },

    mapLink: function() {
      var attributes = this.toJSON();
      return 'http://maps.google.com/maps?z=14&q=' + attributes.lat + ',' + attributes.lng +
        '%20(' + escape('id:' + attributes.object_id) + ')';
    }
  });

  var currentLocation = window.currentLocation = new Location;
  var currentSubscription = window.currentSubscription = new Subscription;

  var watchId = navigator.geolocation.watchPosition(function(position) {
    // $('#location').after("<div>Got update " + JSON.stringify(position.coords) + "</div>");
    var currentAccuracy = parseInt($('#location .accuracy').text());
    if (position.coords.accuracy <= 1000 && position.coords.accuracy <= currentAccuracy) {
      if (position.coords.accuracy < 20) {
        navigator.geolocation.clearWatch(watchId);
      }
      currentLocation.set({
        lat: position.coords.latitude.toFixed(6),
        lng: position.coords.longitude.toFixed(6),
        accuracy: position.coords.accuracy
      });
    }
  }, function() {
    currentLocation.unset('position');
  },
  { frequency: 1000, enableHighAccuracy: true });

  $('#location .found, #location .not_found').hide();

  $.ajaxSetup({
    url: '/subscriptions',
    dataType: 'json',
    processData: false,
    contentType: 'application/json'
  });

  // Fetch existing subscriptions
  $.ajax({
    contentType: 'application/json',
    success: function(subscriptions) {
      if (!subscriptions.length)
        currentSubscription.clear();
      else
        currentSubscription.set(subscriptions[0]);
    }
  });


  $('#follow.button').bind('click', function() {
    $(document).trigger('createSubscription', { 
      phone: '+14156405816',
      lat: $('#location .lat').text(),
      lng: $('#location .lng').text()
    });
  });

  $(document).bind('createSubscription', function(event, data) {
    $.ajax({
      type: 'DELETE',
      success: function() {
        currentSubscription.clear();
        $.ajax({
          type: 'POST',
          data: JSON.stringify(data),
          processData: false,
          success: function(data) {
            currentSubscription.set(data.subscription);
          }
        });
      }
    });
  });

  currentLocation.bind('change', function(location) {
    if (location.isNear(currentSubscription))
      $('#follow.button').text('Currently Watching');
    else
      $('#follow.button').text('Watch this Place!');

    var position = location.toJSON();
    if (!_(position).isEmpty()) {
      $('#location .lat').html(position.lat);
      $('#location .lng').html(position.lng);
      $('#location .accuracy').html(position.accuracy);
      $('#map_link').attr('href', location.mapLink());
      $('#location .finding, #location .not_found').hide();
      $('#location .found').show();
    }
    else {
      $('#location .finding, #location .found').hide();
      $('#location .not_found').show();
    }
  });

  currentSubscription.bind('change', function(model) {
    $('#subscriptions ul').empty();
    if (!_(model.toJSON()).isEmpty())
      $('#subscriptions ul').append(model.toHTML());
  });

  // http://www.movable-type.co.uk/scripts/latlong.html
  if (typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function() {
      return this * Math.PI / 180;
    }
  }

  function calculateDistance(position1, position2) {
    var R = 6371; // km
    var dLat = (position2.lat-position1.lat).toRad();
    var dLon = (position2.lng-position1.lng).toRad();
    var lat1 = Number(position1.lat).toRad();
    var lat2 = Number(position2.lat).toRad();

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
  }    

});
