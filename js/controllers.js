'use strict';

/* Controllers */

function IndexController($scope,$http) {
  //$scope.curbal = 5444;
  //for toasting
  //initializing the looks to false
  $scope.dash = false;
  $scope.register = false;
  $scope.loader = true;
  //will check in the device's local memory, if new user or not
  var storage = window.localStorage;
  var value = storage.getItem("pubkey");
  console.log(value);
  if(value == null)
  {
    $scope.loader = false;
    //prompt to get the acc details
    $scope.register = true;
  }
  else
  {
    $scope.loader = false;
    //show the dashboard
    $scope.dash = true;
    //now retrieve the acc details from the device's local memory
    var accno = 4444777755551981;
    //hit a request to retailbanking api to get the balance
  }
  //function when new user touches submit btn
  $scope.newuser = function() {
    var accountno = $('#accountno').val();
    if(accountno)
    {
      console.log(accountno);
      //loader appears and form disappears
      $scope.register = false;
      $scope.loader = true;
      //send it to the backend
      $http({
        url: 'http://localhost:5000/newuser',
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({'accountno': accountno})
      }).success(function (data) {
        if(data == 'invalid')
        {
          $scope.loader = false;
          $scope.register = true;
          Materialize.toast('Invalid account number', 2000);
        }
        else
        {
          //will hit a request to get the balance details
          console.log(data);
          // storage.setItem("pubkey", data.pubkey);
          // storage.setItem("privatekey", data.privatekey);
          $scope.loader = false;
          Materialize.toast('Success', 2000);
          //dashboard will come
          $scope.dash = true;
        }
      }).error(function (data) {
        $scope.loader = false;
        $scope.register = true;
        Materialize.toast('Sorry, it failed', 2000);
      });
    }
    else
    {
      Materialize.toast('Please fill in the account number', 2000);
    }
  }
  // $('ul.tabs').tabs({
  //   swipeable: true
  // });
}
function allcomoController($scope,$http) {
  $scope.allcomodata = [];
  $scope.allcomostat = false;
  $http({
    method: 'GET',
    url: '/allcomo'
  }).then(function successCallback(response) {
    var inco = 0;
    response.data['records'].forEach(function (elem,index) {
      elem['records'].forEach(function (elem,index) {
        $scope.allcomodata.push(elem);
        inco = inco + 1;

      })
      console.log(inco);
    })
    $scope.allcomostat = true;

  });


}
function roadController($scope,$http) {
  var url = "json/roadaccidents.json"

$http({
  method: 'GET',
  url: url
}).then(function successCallback(response) {
  $scope.fulldata = response.data['data'];
})

}
function HospitalsController($scope,$http) {
  $scope.records = [];
  //hit a get request to flask and get the response points.
  var map = L.map('map').setView([23.474444, 78.894488], 5);
  var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  $scope.status=false;
  $http({
  method: 'GET',
  url: '/hosdia'
  }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available


      response.data['tomap'].forEach(function(elem, index) {
          //console.log(elem['hosname']);
          //console.log(elem['loc']);
          L.marker(elem['loc']).addTo(map).bindPopup(elem['hosname']+"<br>Tel: "+elem['number']);
      });
      response.data['records'].forEach(function(elem, index) {

        elem['records'].forEach(function(elem,index) {
          console.log(elem);
          $scope.records.push(elem);
        })

      })
      $scope.status=true;


    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
}
function gghosController($scope) {
  $('ul.tabs').tabs();
  var countryRestrict = {'country': 'in'};
  var markers = [];
  var markers2 = [];
  var markers3 = [];
  var MARKER_PATH = 'markers/marker_green';
  var hostnameRegexp = new RegExp('^https?://.+?/');
  var countries = {

    'in': {
      center: {lat: 22.812687, lng: 79.444240},
      zoom:5
    }
  };
  var mapOptions = {
    zoom: countries['in'].zoom,
    center: countries['in'].center,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false
    }

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    var infoWindow = new google.maps.InfoWindow({
      content: document.getElementById('info-content')
    });
    var autocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */ (
            document.getElementById('autocomplete')), {

          componentRestrictions: countryRestrict
        });
    var places = new google.maps.places.PlacesService($scope.map);
    autocomplete.addListener('place_changed', function(){

      var place = autocomplete.getPlace();
      if (place.geometry) {
        $scope.map.panTo(place.geometry.location);
        $scope.map.setZoom(15);
        $scope.search();
      } else {
        document.getElementById('autocomplete').placeholder = 'Enter a city';
      }


    });
    $scope.dropMarker = function(i) {
      return function() {
        markers[i].setMap($scope.map);
      };
    }

    $scope.search = function() {
      var search = {
        bounds: $scope.map.getBounds(),
        types: ['hospital']
      };
      places.nearbySearch(search,function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          $scope.clearResults();
          $scope.clearMarkers();
          // Create a marker for each hotel found, and
          // assign a letter of the alphabetic to each marker icon.
          for (var i = 0; i < results.length; i++) {
            var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
            var markerIcon = MARKER_PATH + markerLetter + '.png';
            // Use marker animation to drop the icons incrementally on the map.
            markers[i] = new google.maps.Marker({
              position: results[i].geometry.location,
              animation: google.maps.Animation.DROP,
              icon: markerIcon
            });
            // If the user clicks a hotel marker, show the details of that hotel
            // in an info window.
            markers[i].placeResult = results[i];
            google.maps.event.addListener(markers[i], 'click', function(){
              var marker = this;
              places.getDetails({placeId: marker.placeResult.place_id},
                  function(place, status) {
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                      return;
                    }
                    infoWindow.open($scope.map, marker);
                    $scope.buildIWContent(place);
                  });

            });
            setTimeout($scope.dropMarker(i), i * 100);
            $scope.addResult(results[i], i);
          }
        }

      });
    }

    $scope.clearMarkers = function() {
      for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
          markers[i].setMap(null);
        }
      }
      markers = [];
    }
    $scope.clearResults = function() {
      var results = document.getElementById('results');
      while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);
      }
    }
    $scope.addResult = function(result, i) {
      var results = document.getElementById('results');
      var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
      var markerIcon = MARKER_PATH + markerLetter + '.png';

      var tr = document.createElement('tr');
      tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
      tr.onclick = function() {
        google.maps.event.trigger(markers[i], 'click');
      };

      var iconTd = document.createElement('td');
      var nameTd = document.createElement('td');
      var icon = document.createElement('img');
      icon.src = markerIcon;
      icon.setAttribute('class', 'placeIcon');
      icon.setAttribute('className', 'placeIcon');
      var name = document.createTextNode(result.name);
      iconTd.appendChild(icon);
      nameTd.appendChild(name);
      tr.appendChild(iconTd);
      tr.appendChild(nameTd);
      results.appendChild(tr);
    }
    // Load the place information into the HTML elements used by the info window.
    $scope.buildIWContent = function(place) {
      document.getElementById('iw-icon').innerHTML = '<img class="hospitalIcon" ' +
          'src="' + place.icon + '"/>';
      document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
          '">' + place.name + '</a></b>';
      document.getElementById('iw-address').textContent = place.vicinity;

      if (place.formatted_phone_number) {
        document.getElementById('iw-phone-row').style.display = '';
        document.getElementById('iw-phone').textContent =
            place.formatted_phone_number;
      } else {
        document.getElementById('iw-phone-row').style.display = 'none';
      }

      // Assign a five-star rating to the hotel, using a black star ('&#10029;')
      // to indicate the rating the hotel has earned, and a white star ('&#10025;')
      // for the rating points not achieved.
      if (place.rating) {
        var ratingHtml = '';
        for (var i = 0; i < 5; i++) {
          if (place.rating < (i + 0.5)) {
            ratingHtml += '&#10025;';
          } else {
            ratingHtml += '&#10029;';
          }
        document.getElementById('iw-rating-row').style.display = '';
        document.getElementById('iw-rating').innerHTML = ratingHtml;
        }
      } else {
        document.getElementById('iw-rating-row').style.display = 'none';
      }

      // The regexp isolates the first part of the URL (domain plus subdomain)
      // to give a short URL for displaying in the info window.
      if (place.website) {
        var fullUrl = place.website;
        var website = hostnameRegexp.exec(place.website);
        if (website === null) {
          website = 'http://' + place.website + '/';
          fullUrl = website;
        }
        document.getElementById('iw-website-row').style.display = '';
        document.getElementById('iw-website').textContent = website;
      } else {
        document.getElementById('iw-website-row').style.display = 'none';
      }
    }




        $scope.map2 = new google.maps.Map(document.getElementById('map2'), mapOptions);

        var infoWindow2 = new google.maps.InfoWindow({
          content: document.getElementById('info-content2')
        });
        var autocomplete2 = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */ (
                document.getElementById('autocomplete2')), {

              componentRestrictions: countryRestrict
            });
        var places2 = new google.maps.places.PlacesService($scope.map2);
        autocomplete2.addListener('place_changed', function(){

          var place = autocomplete2.getPlace();
          if (place.geometry) {
            $scope.map2.panTo(place.geometry.location);
            $scope.map2.setZoom(15);
            $scope.search2();
          } else {
            document.getElementById('autocomplete2').placeholder = 'Enter a city';
          }


        });
        $scope.dropMarker2 = function(i) {
          return function() {
            markers2[i].setMap($scope.map2);
          };
        }

        $scope.search2 = function() {
          var search = {
            bounds: $scope.map2.getBounds(),
            types: ['atm']
          };
          places.nearbySearch(search,function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              $scope.clearResults2();
              $scope.clearMarkers2();
              // Create a marker for each hotel found, and
              // assign a letter of the alphabetic to each marker icon.
              for (var i = 0; i < results.length; i++) {
                var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                var markerIcon = MARKER_PATH + markerLetter + '.png';
                // Use marker animation to drop the icons incrementally on the map.
                markers2[i] = new google.maps.Marker({
                  position: results[i].geometry.location,
                  animation: google.maps.Animation.DROP,
                  icon: markerIcon
                });
                // If the user clicks a hotel marker, show the details of that hotel
                // in an info window.
                markers2[i].placeResult = results[i];
                google.maps.event.addListener(markers2[i], 'click', function(){
                  var marker = this;
                  places.getDetails({placeId: marker.placeResult.place_id},
                      function(place, status) {
                        if (status !== google.maps.places.PlacesServiceStatus.OK) {
                          return;
                        }
                        infoWindow2.open($scope.map2, marker);
                        $scope.buildIWContent2(place);
                      });

                });
                setTimeout($scope.dropMarker2(i), i * 100);
                $scope.addResult2(results[i], i);
              }
            }

          });
        }

        $scope.clearMarkers2 = function() {
          for (var i = 0; i < markers2.length; i++) {
            if (markers2[i]) {
              markers2[i].setMap(null);
            }
          }
          markers2 = [];
        }
        $scope.clearResults2 = function() {
          var results = document.getElementById('results2');
          while (results.childNodes[0]) {
            results.removeChild(results.childNodes[0]);
          }
        }
        $scope.addResult2 = function(result, i) {
          var results = document.getElementById('results2');
          var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
          var markerIcon = MARKER_PATH + markerLetter + '.png';

          var tr = document.createElement('tr');
          tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
          tr.onclick = function() {
            google.maps.event.trigger(markers2[i], 'click');
          };

          var iconTd = document.createElement('td');
          var nameTd = document.createElement('td');
          var icon = document.createElement('img');
          icon.src = markerIcon;
          icon.setAttribute('class', 'placeIcon');
          icon.setAttribute('className', 'placeIcon');
          var name = document.createTextNode(result.name);
          iconTd.appendChild(icon);
          nameTd.appendChild(name);
          tr.appendChild(iconTd);
          tr.appendChild(nameTd);
          results.appendChild(tr);
        }
        // Load the place information into the HTML elements used by the info window.
        $scope.buildIWContent2 = function(place) {
          document.getElementById('iw-icon2').innerHTML = '<img class="hospitalIcon" ' +
              'src="' + place.icon + '"/>';
          document.getElementById('iw-url2').innerHTML = '<b><a href="' + place.url +
              '">' + place.name + '</a></b>';
          document.getElementById('iw-address2').textContent = place.vicinity;

          if (place.formatted_phone_number) {
            document.getElementById('iw-phone-row2').style.display = '';
            document.getElementById('iw-phone2').textContent =
                place.formatted_phone_number;
          } else {
            document.getElementById('iw-phone-row2').style.display = 'none';
          }

          // Assign a five-star rating to the hotel, using a black star ('&#10029;')
          // to indicate the rating the hotel has earned, and a white star ('&#10025;')
          // for the rating points not achieved.
          if (place.rating) {
            var ratingHtml = '';
            for (var i = 0; i < 5; i++) {
              if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
              } else {
                ratingHtml += '&#10029;';
              }
            document.getElementById('iw-rating-row2').style.display = '';
            document.getElementById('iw-rating2').innerHTML = ratingHtml;
            }
          } else {
            document.getElementById('iw-rating-row2').style.display = 'none';
          }

          // The regexp isolates the first part of the URL (domain plus subdomain)
          // to give a short URL for displaying in the info window.
          if (place.website) {
            var fullUrl = place.website;
            var website = hostnameRegexp.exec(place.website);
            if (website === null) {
              website = 'http://' + place.website + '/';
              fullUrl = website;
            }
            document.getElementById('iw-website-row2').style.display = '';
            document.getElementById('iw-website2').textContent = website;
          } else {
            document.getElementById('iw-website-row2').style.display = 'none';
          }
        }





        $scope.map3 = new google.maps.Map(document.getElementById('map3'), mapOptions);

        var infoWindow3 = new google.maps.InfoWindow({
          content: document.getElementById('info-content3')
        });
        var autocomplete3 = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */ (
                document.getElementById('autocomplete3')), {

              componentRestrictions: countryRestrict
            });
        var places3 = new google.maps.places.PlacesService($scope.map3);
        autocomplete3.addListener('place_changed', function(){

          var place = autocomplete3.getPlace();
          if (place.geometry) {
            $scope.map3.panTo(place.geometry.location);
            $scope.map3.setZoom(15);
            $scope.search3();
          } else {
            document.getElementById('autocomplete3').placeholder = 'Enter a city';
          }


        });
        $scope.dropMarker3 = function(i) {
          return function() {
            markers3[i].setMap($scope.map3);
          };
        }

        $scope.search3 = function() {
          var search = {
            bounds: $scope.map3.getBounds(),
            types: ['gas_station']
          };
          places.nearbySearch(search,function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              $scope.clearResults3();
              $scope.clearMarkers3();
              // Create a marker for each hotel found, and
              // assign a letter of the alphabetic to each marker icon.
              for (var i = 0; i < results.length; i++) {
                var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                var markerIcon = MARKER_PATH + markerLetter + '.png';
                // Use marker animation to drop the icons incrementally on the map.
                markers3[i] = new google.maps.Marker({
                  position: results[i].geometry.location,
                  animation: google.maps.Animation.DROP,
                  icon: markerIcon
                });
                // If the user clicks a hotel marker, show the details of that hotel
                // in an info window.
                markers3[i].placeResult = results[i];
                google.maps.event.addListener(markers3[i], 'click', function(){
                  var marker = this;
                  places.getDetails({placeId: marker.placeResult.place_id},
                      function(place, status) {
                        if (status !== google.maps.places.PlacesServiceStatus.OK) {
                          return;
                        }
                        infoWindow3.open($scope.map3, marker);
                        $scope.buildIWContent3(place);
                      });

                });
                setTimeout($scope.dropMarker3(i), i * 100);
                $scope.addResult3(results[i], i);
              }
            }

          });
        }

        $scope.clearMarkers3 = function() {
          for (var i = 0; i < markers3.length; i++) {
            if (markers3[i]) {
              markers3[i].setMap(null);
            }
          }
          markers3 = [];
        }
        $scope.clearResults3 = function() {
          var results = document.getElementById('results3');
          while (results.childNodes[0]) {
            results.removeChild(results.childNodes[0]);
          }
        }
        $scope.addResult3 = function(result, i) {
          var results = document.getElementById('results3');
          var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
          var markerIcon = MARKER_PATH + markerLetter + '.png';

          var tr = document.createElement('tr');
          tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
          tr.onclick = function() {
            google.maps.event.trigger(markers3[i], 'click');
          };

          var iconTd = document.createElement('td');
          var nameTd = document.createElement('td');
          var icon = document.createElement('img');
          icon.src = markerIcon;
          icon.setAttribute('class', 'placeIcon');
          icon.setAttribute('className', 'placeIcon');
          var name = document.createTextNode(result.name);
          iconTd.appendChild(icon);
          nameTd.appendChild(name);
          tr.appendChild(iconTd);
          tr.appendChild(nameTd);
          results.appendChild(tr);
        }
        // Load the place information into the HTML elements used by the info window.
        $scope.buildIWContent3 = function(place) {
          document.getElementById('iw-icon3').innerHTML = '<img class="hospitalIcon" ' +
              'src="' + place.icon + '"/>';
          document.getElementById('iw-url3').innerHTML = '<b><a href="' + place.url +
              '">' + place.name + '</a></b>';
          document.getElementById('iw-address3').textContent = place.vicinity;

          if (place.formatted_phone_number) {
            document.getElementById('iw-phone-row3').style.display = '';
            document.getElementById('iw-phone3').textContent =
                place.formatted_phone_number;
          } else {
            document.getElementById('iw-phone-row3').style.display = 'none';
          }

          // Assign a five-star rating to the hotel, using a black star ('&#10029;')
          // to indicate the rating the hotel has earned, and a white star ('&#10025;')
          // for the rating points not achieved.
          if (place.rating) {
            var ratingHtml = '';
            for (var i = 0; i < 5; i++) {
              if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
              } else {
                ratingHtml += '&#10029;';
              }
            document.getElementById('iw-rating-row3').style.display = '';
            document.getElementById('iw-rating3').innerHTML = ratingHtml;
            }
          } else {
            document.getElementById('iw-rating-row3').style.display = 'none';
          }

          // The regexp isolates the first part of the URL (domain plus subdomain)
          // to give a short URL for displaying in the info window.
          if (place.website) {
            var fullUrl = place.website;
            var website = hostnameRegexp.exec(place.website);
            if (website === null) {
              website = 'http://' + place.website + '/';
              fullUrl = website;
            }
            document.getElementById('iw-website-row3').style.display = '';
            document.getElementById('iw-website3').textContent = website;
          } else {
            document.getElementById('iw-website-row3').style.display = 'none';
          }
        }






}
