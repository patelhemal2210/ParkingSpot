/**
 * Created by Hemal Patel on 03/04/2016.
 */

var markers = [];
var markersTickets = [];
var map;
var infowindow;
var parkingTicketArrayGlobal;
var currentPosition = 0;
var parkingTicketIntervalCount = 0;
var parkingTicketIntervalId;
var showTicket = false;
var directionsService;
var directionsDisplay;

function initAutocomplete() {
    map = new google.maps.Map(document.getElementById('Map'), {
        center: {lat: 43.728366916627465, lng: -79.60748551103364},
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        draggable: true
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
            marker.marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {

            // Create a marker for each place.
            var addr = "Your Current Location ::: ";
            addr += place.name;
            markers.push({marker : new google.maps.Marker({
                map: map,
                icon: "images/CurrentLocation_Blue.png",
                title: addr,
                position: place.geometry.location
            }), parkingSpot : ""});

            google.maps.event.addListener(markers[markers.length-1].marker,'click',function() {
                var parkingSpot;
                for(var i = 0; i < markers.length; i++) {
                    if(markers[i].marker == this) {
                        parkingSpot = markers[i].parkingSpot;
                        break;
                    }
                }
                displayAddress(this, parkingSpot);
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

    $scope.toggleDisplay = function(event) {
        if(event.currentTarget.children[1].className == "glyphicon glyphicon-menu-down") {
            event.currentTarget.children[1].className = "glyphicon glyphicon-menu-up";
            $scope.readyToDispaly = true;
        }
        else {
            event.currentTarget.children[1].className = "glyphicon glyphicon-menu-down";

            $scope.readyToDispaly = false;
        }
    };

    $http.get("json/parkingSpot.JSON").then(function (response) {
        $scope.parkingLotMain = response.data;


    });

    $http.get("json/parkingTicket.JSON").then(function (response) {
        $scope.parkingTicket = response.data;
        parkingTicketArrayGlobal = $scope.parkingTicket;
        parkingTicketIntervalId = setInterval(function () {
                        codeAddress();
                    }, 300);
    });
    $scope.showTicketSpots = function(){
        console.log($("#check").is(':checked'));
        if($("#check").is(':checked')){
            showTicket = true;
            for (var j = 0; j < markersTickets.length; j++) {
                markersTickets[j].setMap(map);
            }
            scrollToAnchor('MapAncher');
        }
       else {
            showTicket = false;
            for (var j = 0; j < markersTickets.length; j++) {
                markersTickets[j].setMap(null);
            }
//             markersTickets = [];
        }
       }
    $scope.parkingDistance = 0;
    //method to change list as per entered distance
    $scope.shouldAdd = function(lat,lng,distance){
        if(($scope.parkingDistance = calcDistance(currentPosition,new google.maps.LatLng(lat,lng))) <= distance)
            return true;
        else
            return false;
    };

    $scope.getDistance = function(lat) {

    };

    $scope.generateMarker = function(event)  {
        var parkigLotName = event.currentTarget.dataset.title;
        for (var i = 0; i < $scope.parkingLotMain.carparks.length; i++) {
            if($scope.parkingLotMain.carparks[i].address === parkigLotName) {
                var loc = new google.maps.LatLng($scope.parkingLotMain.carparks[i].lat,$scope.parkingLotMain.carparks[i].lng);
                var markr = new google.maps.Marker({
                    map: map,
                    icon: "images/ParkingSpot_Green.png",
                    title: parkigLotName,
                    position: loc
                });
                markers.push({marker : markr, parkingSpot: $scope.parkingLotMain.carparks[i]});
                map.setCenter(loc);
                google.maps.event.addListener(markers[markers.length-1].marker,'click',function() {
                    var parkingSpot;
                    for(var i = 0; i < markers.length; i++) {
                        if(markers[i].marker == this) {
                            parkingSpot = markers[i].parkingSpot;
                            break;
                        }
                    }
                    displayAddress(this, parkingSpot);
                });
                displayAddress(markr, $scope.parkingLotMain.carparks[i]);
                scrollToAnchor('MapAncher');
                break;
                //alert("marker added");
            }
        }
    };
}]);
//--------------added *********************************

function directionToHere(p1) {
    displayRoute(p1, currentPosition, directionsService,
        directionsDisplay);
}

function displayRoute(origin, destination, service, display) {
    service.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: true
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            display.setDirections(response);
        } else {
            alert('Could not display directions due to: ' + status);
        }
    });
}


function displayAddress(marker, parkingInfo) {
    data = marker.getTitle();
    if(data.includes('Your Current Location')) {
        var list = marker.getTitle().split(":::");
        data = "<strong>Your Current Location : </strong>" + list[1];
    }
    else if(currentPosition) {
        data = "";
        data += "<button id='direction' type='button' class='btn btn-success' onclick='function() {directionToHere(marker.position)}'>Direction</button><br><br>"
        data += "<strong>" + parkingInfo.address + "</strong>" + "<br>";
        data += "<strong> Rate : </strong>" + parkingInfo.rate + "<br>";
        data += "<strong> Type : </strong>" + parkingInfo.carpark_type + "<br>";
        data += "<strong> Capacity : </strong>" + parkingInfo.capacity + " Spaces<br>";
        data += "<strong> Height Restriction(Approximate) : </strong>";
        data += (parkingInfo.max_height == 0) ? "No height restriction" : (parkingInfo.max_height  + " meters");
        data += "<br>";
        data += "<strong> Payment Options : </strong>";
        for(var i = 0 ; i < parkingInfo.payment_options.length; i++) {
            data += parkingInfo.payment_options[i]+ ",";
        }

        data += "<br>";
        data += "<strong> Accepted Forms of Payment : </strong>";
        for(var i = 0 ; i < parkingInfo.payment_methods.length; i++) {
            data += parkingInfo.payment_methods[i]+ ",";
        }
        data += "<br>";
    }

    infowindow.setContent(data);
    google.maps.event.addListener(infowindow, 'domready', function() {
        $("#direction").click(function(){ directionToHere(marker.position);});
    });
    infowindow.open(map, marker);
}

function generateMarker(data) {
    alert(data);
}
//FUNCTION TO GENERATE MARKERS FOR PARKING TICKET SPOTS+++++++
function codeAddress() {
    //In this case it gets the address from JSON
    if(parkingTicketIntervalCount < parkingTicketArrayGlobal.length) {
        var marker;
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({'address': parkingTicketArrayGlobal[parkingTicketIntervalCount].location + ",TORONTO,ON"}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                marker = new google.maps.Marker({
                    //map: map,
                    map : (showTicket == true) ? map : null,
                    position: results[0].geometry.location,
                    icon: "images/TicketSpot_Red.png",
                    title: parkingTicketArrayGlobal[parkingTicketIntervalCount].location
                });
                //var infowindow = new google.maps.InfoWindow({
                //    content: generateTicketWindow(parkingTicketArrayGlobal[parkingTicketIntervalCount])
                //});
                marker.addListener('mouseover', function () {
                    infowindow.setContent(generateTicketWindow(parkingTicketArrayGlobal[parkingTicketIntervalCount]));
                    infowindow.open(map, marker);
                });
                marker.addListener('mouseout', function () {
                    infowindow.close();
                });
                markersTickets.push(marker);
                parkingTicketIntervalCount++;
            } else {
                //alert("Geocode was not successful for the following reason: " + status);
            }

        });

    }
    else
    {
        clearInterval(parkingTicketIntervalId);
    }
}
//this function is generating ticket information window
function generateTicketWindow(parkingTicketObject){
    count = 0;
    check=0;
    var data = '<strong>Location : </strong>'+parkingTicketObject.location+'<br>';
    for(j=0;j<parkingTicketArrayGlobal.length;j++){
        if(parkingTicketArrayGlobal[j].location == parkingTicketObject.location){
            if(parkingTicketArrayGlobal[j].code == parkingTicketObject.code){
                check=j;
                count++;
            }else{
               data+='<strong>Description : </strong>'+parkingTicketArrayGlobal[j].description+'&nbsp;'+
                   '<strong>Fine Amount : </strong>'+parkingTicketArrayGlobal[j].fine+'<br>';
            }
        }
    }
    if(count == 1) {
        data += '<strong>Description : </strong>' + parkingTicketArrayGlobal[check].description + '&nbsp;' +
            '<strong>Fine Amount : </strong>' + parkingTicketArrayGlobal[check].fine;
    }
    if(count > 1) {
        data += '<strong>Description : </strong>' + parkingTicketArrayGlobal[check].description + '&nbsp;' +
            '<strong>Fine Amount : </strong>' + parkingTicketArrayGlobal[check].fine + '<br><strong>Fined </strong>' + count + ' Times for this mistake';
    }
    return data;
}
