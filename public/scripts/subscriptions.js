$(function() {
  var watchId = navigator.geolocation.watchPosition(function(position) {
    $(document).trigger('located', { position: position });
  }, function() {
    $(document).trigger('located', {});
  },
  { frequency: 1000, enableHighAccuracy: true });

  $('#subscriptions, #location .found, #location .not_found').hide();

  $.ajaxSetup({
    url: '/subscriptions',
    dataType: 'json',
    processData: false,
    contentType: 'application/json'
  });

  $.ajax({
    contentType: 'application/json',
    success: function(data) { 
      $(document).trigger('subscriptionsLoaded', { subscriptions: data });
    }
  });


  $('#follow.button').bind('click', function() {
    $(document).trigger('createSubscription', { 
      phone: '+14156405816',
      lat: $('#location .lat').text(),
      lng: $('#location .lng').text()
    });
  });

  $('#unfollow.button').bind('click', function() {
    $(document).trigger('removeSubscriptions');
  });

  $(document).bind('located', function(event, data) {
    if (data.position) {
      var position = { 
        lat: data.position.coords.latitude.toFixed(6),
        lng: data.position.coords.longitude.toFixed(6),
        accuracy: data.position.coords.accuracy
      };
      var currentAccuracy = parseInt($('#location .accuracy').text());
      // $('#location').after("<div>Got update " + JSON.stringify(position) + "</div>");
      if (position.accuracy <= 1000 && position.accuracy <= currentAccuracy) {
        if (position.accuracy < 20) {
           navigator.geolocation.clearWatch(watchId);
        }
        $('#location .lat').html(position.lat);
        $('#location .lng').html(position.lng);
        $('#location .accuracy').html(position.accuracy);
        $('#map_link').
          attr('href', createMapLink(position.lat, position.lng, 'Found you here'));
        $('#location .finding, #location .not_found').hide();
        $('#location .found').show();
      }
    }
    else {
      $('#location .finding, #location .found').hide();
      $('#location .not_found').show();
    }
  });

  $(document).bind('subscriptionsLoaded', function(event, data) {
    if (!data.subscriptions.length)
      return;

    $('#subscriptions').show();
    $.each(data.subscriptions, function(index, subscription) {
      appendSubscription(subscription);
    });
  });

  $(document).bind('subscriptionsRemoved', function(event, data) {
    $('#subscriptions').hide();
    $('#subscriptions .subscription').remove();
  });

  $(document).bind('removeSubscriptions', function(event, data) {
    $.ajax({
      type: 'DELETE',
      success: function(data) {
        $(document).trigger('subscriptionsRemoved');
      }
    });
  });

  $(document).bind('subscriptionCreated', function(event, data) {
    $('#subscriptions').show();
    appendSubscription(data.subscription);
  });

  $(document).bind('createSubscription', function(event, data) {
    $.ajax({
      type: 'DELETE',
      success: function() {
        $(document).trigger('subscriptionsRemoved');
        $.ajax({
          type: 'POST',
          data: JSON.stringify(data),
          processData: false,
          success: function(data) {
            $(document).trigger('subscriptionCreated', { subscription: data });
          }
        });
      }
    });
  });


  function appendSubscription(subscription) {
    $('#subscriptions ul').append(
      $('<li/>').append($('<a class="subscription"/>').
      attr('href', createMapLink(subscription.lat, subscription.lng, 'id:' + subscription.object_id)).
      text(subscription.lat + ',' + subscription.lng + ' (id:' + subscription.object_id + ')')
    ));
  }

  function createMapLink(lat, lng, label) {
    return 'http://maps.google.com/maps?z=14&q=' + lat + ',' + lng +
              '%20(' + escape(label) + ')';
  }

});
