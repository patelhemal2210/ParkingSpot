/**
 * Created by Hemal Patel on 03/04/2016.
 */

var markers = [];
var map;
var infowindow;
var currentPosition = 0;
function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('Map'), {
        center: {lat: 43.728366916627465, lng: -79.60748551103364},
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    infowindow = new google.maps.InfoWindow({
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            /* var icon = {
             url: place.icon,
             size: new google.maps.Size(71, 71),
             origin: new google.maps.Point(0, 0),
             anchor: new google.maps.Point(17, 34),
             scaledSize: new google.maps.Size(25, 25)
             };*/

            // Create a marker for each place.
            var addr = "Your Current Location : ";
            addr += place.name;
            markers.push(new google.maps.Marker({
                map: map,
                //icon: icon,
                title: addr,
                position: place.geometry.location
            }));

            google.maps.event.addListener(markers[markers.length-1],'click',function() {
                displayAddress(this);
            });

            var p1 = new google.maps.LatLng(43.728366916627465, -79.60748551103364);
            //alert(calcDistance(p1, place.geometry.location));
            currentPosition = place.geometry.location;
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
        scrollToAnchor('MapAncher');
    });
}

//calculates distance between two points in km's
function calcDistance(p1, p2){
    return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
}

function scrollToAnchor(aid){
    var aTag = $("a[name='"+ aid +"']");
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
}


var app = angular.module("myApp",[]);
app.controller('homeController',["$scope", "$http",function($scope,$http) {
    $scope.readyToDispaly = false;
    $scope.toggleDisplay = function() {
        $scope.readyToDispaly = true;
    };

    $http.get("json/parkingSpot.JSON").then(function (response) {
        $scope.parkingLotMain = response.data;

    });

    $scope.generateMarker = function(event)  {
        var parkigLotName = event.currentTarget.innerText;
        for (var i = 0; i < $scope.parkingLotMain.carparks.length; i++) {
            if($scope.parkingLotMain.carparks[i].address === parkigLotName) {
                var loc = new google.maps.LatLng($scope.parkingLotMain.carparks[i].lat,$scope.parkingLotMain.carparks[i].lng);
                markers.push(new google.maps.Marker({
                    map: map,
                    //icon: icon,
                    title: parkigLotName,
                    position: loc
                }));
                map.setCenter(loc);
                google.maps.event.addListener(markers[markers.length-1],'click',function() {
                    displayAddress(this);
                });
                break;
                alert("marker added");
            }
        }
    };
}]);

function displayAddress(marker) {
    data = marker.getTitle();
    if(data.includes('Your Current Location')) {

    }
    else if(currentPosition) {
        distance = calcDistance(marker.getPosition(), currentPosition);
        data += "<br> distance is : ";
        data += distance;
    }

    infowindow.setContent(data);
    infowindow.open(map, marker);
}

function generateMarker(data) {
    alert(data);
}

/*

var app = angular.module("myApp",[]);
app.controller('homeController',['$scope', function($scope) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'json/parkingSpot.JSON');
    xhr.onreadystatechange = function () {
        if(xhr.responseText) {
            $scope.parkingLotMain = JSON.parse(xhr.responseText);
        /*    $scope.parkingLotMain.carparks.forEach(function (parlingLot) {
                markers.push(new google.maps.Marker({
                    map: map,
                    //icon: icon,
                    title: parlingLot.address,
                }));
            });*/
       /* }
        $scope.readyToDisplay = false;
    };
    xhr.send();
}]);*/

