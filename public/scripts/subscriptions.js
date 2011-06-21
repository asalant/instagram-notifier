$(function() {
  navigator.geolocation.watchPosition(function(position) {
    $(document).trigger('located', { position: position });
  }, function() {
    $(document).trigger('located', {});
  },
  { frequency: 2000 });

  $('#subscriptions, #follow.button').hide();

  $.ajaxSetup({
    url: '/subscriptions',
    dataType: 'json',
    processData: false,
    contentType: 'application/json'
  });

  $.ajax({
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
      console.log("Got update " + JSON.stringify(position));
      if (position.accuracy < parseInt($('#location .accuracy').text())) {
        $('#location .lat').html(position.lat);
        $('#location .lng').html(position.lng);
        $('#location .accuracy').html(position.accuracy);
        $('#map_link').
          attr('href', 'http://maps.google.com/maps?z=14&q=' + position.lat + ',' + position.lng +
              '%20(Found%20you%20here)');
      }
      $('#follow.button').show();
    }
    else {
      $('#location').html('Unable to find your current location');
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
      type: 'POST',
      data: JSON.stringify(data),
      processData: false,
      success: function(data) {
        $(document).trigger('subscriptionCreated', { subscription: data });
      }
    });
  });


  function appendSubscription(subscription) {
    $('#unfollow').before(
      $('<div class="subscription"/>').text(JSON.stringify(subscription))
    );
  }

});
