var map;
var markers = [];
var histo = JSON.parse(window.localStorage.getItem("histo")) || [];

//initalize the map
function myMap() {
	var mapProp= {
		center:new google.maps.LatLng(55.573699, 15.700307),
		zoom:3,
		maxZoom: 15,
	};
	map=new google.maps.Map(document.getElementById("map"),mapProp);
}

//use to search for a zip code
function search () {
	var country=document.getElementById("country").value;
	var zipCode=document.getElementById("zipCode").value;

	var client = new XMLHttpRequest();
	var villes;

	//sending a request for a zip code and a country
	client.open("GET", "http://api.zippopotam.us/"+country+"/"+zipCode, true);
	client.onreadystatechange = function() {

		if(client.readyState == 4 && client.statusText == "OK") { //if there is a match
			var res = JSON.parse(client.responseText);
			villes = res.places;
			addHisto(country, zipCode); //add an entrie to the history

			clearMarkers();
			var tab = "<tr><th>Place Name</th><th>Longitude</th><th>Latitude</th></tr>"
			for (var i = 0; i<villes.length; i++){ //for each match add an entrie to the table and add a marker
				tab += "<tr><td>" + villes[i]["place name"] + "</td><td>" + villes[i].longitude + "</td><td>" + villes[i].latitude + "</td></tr>";
				addMarker(villes[i].latitude, villes[i].longitude);
			}

			if (markers.length > 0){ //adjust the map to be center to the markers
				var bounds = new google.maps.LatLngBounds();
				for (var i = 0; i < markers.length; i++){
					bounds.extend(markers[i].getPosition())
				}
				map.fitBounds(bounds);
			}
			document.getElementById("infoUser").innerHTML = "We found " + villes.length + " places corresponding to this ZipCode";
			document.getElementById("places").innerHTML = tab; 
		} else {
			document.getElementById("infoUser").innerHTML = "Wrong ZipCode, please enter a new one";
		};
	};
	client.send();

}

function addMarker(lat, lon) {
	var myCenter = new google.maps.LatLng(lat, lon);
	var marker = new google.maps.Marker({position:myCenter});
	marker.setMap(map);
    markers.push(marker);
}

function clearMarkers() {
	setMapOnAll(null);
	markers = [];
}

function setMapOnAll(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}

function addHisto (country, zipCode) {
	var nameCountry = document.getElementById(country).getAttribute("name");
	var text = nameCountry + " " + zipCode;
	if (histo.length >= 10) { //keep just the last 10 searches
		histo.shift();
	}
	histo.push(text);

	addListHtml();
}

function addListHtml () {

	var val = JSON.stringify(histo);
	window.localStorage.setItem("histo", val);

	document.getElementById("listHisto").innerHTML = "";

	for (var j = histo.length-1; j >= 0; j--) {
		document.getElementById("listHisto").innerHTML += "<li>" + histo[j] + "</li>"
	}
	
}


