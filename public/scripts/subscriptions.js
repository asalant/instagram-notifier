$(function() {

  var Location = Backbone.Model.extend({
    boundary: 40,

    isNear: function(otherLocation) {
      var distance = this.distance(otherLocation);
      if (distance === null)
        return false;
      else
        return this.boundary > distance;
    },

    distance: function(otherLocation) {
      if (_(this.toJSON()).isEmpty() || _(otherLocation.toJSON()).isEmpty())
        return null;
      else
        return calculateDistance(this.toJSON(), otherLocation.toJSON());
    },

    mapLink: function() {
      var attributes = this.toJSON();
      return 'http://maps.google.com/maps?z=14&q=' + attributes.lat + ',' + attributes.lng +
        '%20(' + escape('Found you here') + ')';
    },

    trackCurrentPosition: function() {
      this.watchId = navigator.geolocation.watchPosition(function(position) {
        // $('#location').after("<div>Got update " + JSON.stringify(position.coords) + "</div>");
        var currentAccuracy = parseInt($('#location .accuracy').text());
        if (position.coords.accuracy <= 1000 && position.coords.accuracy <= currentAccuracy) {
         currentLocation.set({
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
            accuracy: position.coords.accuracy
          });
        }
      }, function() {
        currentLocation.clear();
      },
      { frequency: 1000, enableHighAccuracy: true });

    },

    clearWatch: function() {
      navigator.geolocation.clearWatch(this.watchId);
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

  currentLocation.trackCurrentPosition();

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

  $('#unfollow.button').bind('click', function() {
    $.ajax({
      type: 'DELETE',
      success: function() {
        currentSubscription.clear();
      }
    });
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
          success: function(subscription) {
            currentSubscription.set(subscription);
          }
        });
      }
    });
  });

  function updateWatchButton() {
    if (currentLocation.isNear(currentSubscription))
      $('#follow.button').text('Currently Watching (' + currentLocation.distance(currentSubscription) + 'm)');
    else
      $('#follow.button').text('Watch this Place!');
  }
  currentSubscription.bind('change', updateWatchButton);
  currentLocation.bind('change', updateWatchButton);

  currentLocation.bind('change', function(location) {
    var position = location.toJSON();
    if (!_(position).isEmpty()) {
      if (position.accuracy < 20) {
        location.clearWatch();
      }

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

  currentSubscription.bind('change', function(subscription) {
    $('#subscriptions ul').empty();
    if (!_(subscription.toJSON()).isEmpty()) {
      $('#subscriptions ul').append(subscription.toHTML());
      $('#unfollow.button').show();
    }
    else {
      $('#unfollow.button').hide();
    }
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
