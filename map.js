var geocoder;
var map;
var address = 'Christchurch';
var currentPosition;

function initialize() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(43.5321, 172.6362);
  var myOptions = {
    zoom: 13,
    center: latlng,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
    },
    navigationControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map'), myOptions);
  if (geocoder) {
    geocoder.geocode({
      'address': address
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
          map.setCenter(results[0].geometry.location);

          var infowindow = new google.maps.InfoWindow({
            content: '<b>' + address + '</b>',
            size: new google.maps.Size(150, 50)
          });
        } else {
          alert('No results found');
        }
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });

    
    // Autocomplete 
    var input = document.getElementById('new-marker');
    var options = {
      componentRestrictions: {country: 'nz'}
    };
    var autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      if (place.address_components) {
        app.newAdress = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

    });
  }

  getCurrentPosition();
}

function getCurrentPosition()
{
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)      
      map.setCenter(currentPosition);      
      var marker = new google.maps.Marker({
        map: map,
        position: currentPosition,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
    });
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } 
}

Vue.component('marker-item', {
  template: '\
    <li>\
      <label>{{ title }}</label>\
      <button v-on:click="$emit(\'remove\')">Remove</button>\
    </li>\
  ',
  props: ['title']
})

var app = new Vue({
  el: '#map-markers',
  data: {
    newAdress: '',
    markers: [],
    nextMarkerId: 0,
    closestMarker: ''
  },
  methods: {
    addNewMarker: function () {
      geocoder.geocode( { 'address': this.newAdress}, function(results, status) {
        if (status == 'OK') {
          map.setCenter(results[0].geometry.location);
          var marker = new google.maps.Marker({
              map: map,
              position: results[0].geometry.location
          });
          
          app.markers.push({
            id: app.nextMarkerId++,
            title: app.newAdress,
            marker: marker,
            testNum: 300
          })
          app.newAdress = '';
          app.closestMarker = app.findClosestMarker();
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
    },
    removeMarker: function(index) {
        var marker = this.markers[index].marker;
        marker.setMap(null);
        this.markers.splice(index, 1);
        this.closestMarker = this.findClosestMarker();
    },
    findClosestMarker: function() {
      var markerAddress = ''        
      var distances = [];
      var closest = -1;
      for (i = 0; i < this.markers.length; i++) {
          var d = google.maps.geometry.spherical.computeDistanceBetween(this.markers[i].marker.position, currentPosition);
          distances[i] = d;
          if (closest == -1 || d < distances[closest]) {
              closest = i;
              markerAddress = this.markers[i].title;
          }
      }
      return markerAddress;
    }   
  }
})
