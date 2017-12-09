var map;
var markers = [];
var histo = JSON.parse(window.localStorage.getItem("histo")) || [];

function myMap() {
	var mapProp= {
		center:new google.maps.LatLng(55.573699, 15.700307),
		zoom:3,
	};
	map=new google.maps.Map(document.getElementById("map"),mapProp);
}


function search () {
	var country=document.getElementById("country").value;
	var zipCode=document.getElementById("zipCode").value;

	var client = new XMLHttpRequest();
	var villes;

	client.open("GET", "http://api.zippopotam.us/"+country+"/"+zipCode, true);
	client.onreadystatechange = function() {

		if(client.readyState == 4 && client.statusText == "OK") {
			var res = JSON.parse(client.responseText);
			console.log(res);
			villes = res.places;
			addHisto(country, zipCode);

			clearMarkers();
			var tab = "<tr><th>Place Name</th><th>Longitude</th><th>Latitude</th></tr>"
			for (var i = 0; i<villes.length; i++){
				tab += "<tr><td>" + villes[i]["place name"] + "</td><td>" + villes[i].longitude + "</td><td>" + villes[i].latitude + "</td></tr>";
				addMarker(villes[i].longitude, villes[i].latitude);
			}
			document.getElementById("places").innerHTML = tab;
		};
	};
	client.send();

}

function addMarker(lon, lat) {
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

	var text = country + " " + zipCode;
	if (histo.length >= 10) {
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


