$(function() {
   navigator.geolocation.getCurrentPosition(function(position) {
     $(document).trigger('located', { position: position });
   }, function() {
     $(document).trigger('located', {});
   });
});

$(document).bind('located', function(event, data) {
  if (data.position) {
    var position = { 
      lat: data.position.coords.latitude.toFixed(6),
      lng: data.position.coords.longitude.toFixed(6)
    };
     $('#location .lat').html(position.lat);
     $('#location .lng').html(position.lng);
  }
  else {
    $('#location').html('Unable to determine your current location');
  }
});
