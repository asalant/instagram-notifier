$(function() {
  navigator.geolocation.watchPosition(function(position) {
    $(document).trigger('located', { position: position });
  }, function() {
    $(document).trigger('located', {});
  },
  { frequency: 1000 });

  $('#subscriptions, #location .found, #location .not_found').hide();

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
      //$('button#follow').after("<div>Got update " + JSON.stringify(position) + "</div>");
      if (position.accuracy < 1000 &&
          position.accuracy < parseInt($('#location .accuracy').text())) {
        $('#location .lat').html(position.lat);
        $('#location .lng').html(position.lng);
        $('#location .accuracy').html(position.accuracy);
        $('#map_link').
          attr('href', 'http://maps.google.com/maps?z=14&q=' + position.lat + ',' + position.lng +
              '%20(Found%20you%20here)');
      }
      $('#location .finding, #location .not_found').hide();
      $('#location .found').show();
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
