var map;
var drawnPath;
var markers = [];
var routes = {};

function myMap() {
	var mapProp= {
		center:new google.maps.LatLng(60.452359, 22.266520),
		zoom:11,
	};
	map=new google.maps.Map(document.getElementById("map"),mapProp);
}

function createList() {

	var client = new XMLHttpRequest();
	client.open("GET", "http://data.foli.fi/gtfs/v0/20171130-162538/routes",true);
	client.onreadystatechange = function() {	

		if(client.readyState == 4 && client.statusText == "OK") {
			var res = JSON.parse(client.responseText);
			var textList = "";
			for (var i = 0; i < res.length; i++) {
				routes[res[i].route_id] = res[i].route_short_name;
			}
			for (var prop in routes) {
				textList += "<option>" + prop;
			}
			document.getElementById("listLine").innerHTML = textList;
			console.log(routes);
		};
	};
	client.send();
}

function compare(x, y) {
	return x - y;
}

function drawRoute () {
	var line = document.getElementById("choixLine").value;
	var client = new XMLHttpRequest();
	var shape;
	
	client.open("GET", "http://data.foli.fi/gtfs/v0/20171130-162538/trips/route/" + line,true);
	console.log(client);
	client.onreadystatechange = function() {	

		if(client.readyState == 4 && client.statusText == "OK") {
			var res = JSON.parse(client.responseText);
			console.log(res);
			shape = res[0].shape_id;
			console.log(shape);
			searchShape(shape);
		};
	};
	client.send();
}

function searchShape (shape) {
	var path = [];
	var client = new XMLHttpRequest();
	client.open("GET", "http://data.foli.fi/gtfs/v0/20171130-162538/shapes/" + shape,true);
	console.log(client);
	client.onreadystatechange = function() {	

		if(client.readyState == 4 && client.statusText == "OK") {
			path = JSON.parse(client.responseText);
			console.log(path);
			path = normPath(path);
			drawnPath = drawPolyline(path);
		};
	};
	client.send();
}

function drawPolyline (pathBus) {
	removeLine();
	clearMarkers()
	var path = new google.maps.Polyline({
		path: pathBus.path,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 2
	});

	map.fitBounds(pathBus.bounds);
	path.setMap(map);

	return path;
}

function normPath (path) {
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < path.length; i++){
		path [i] = new google.maps.LatLng(path[i].lat, path[i].lon);
		bounds.extend(path [i]);
	}
	console.log(path);
	return {path, bounds};
}

function removeLine(path) {
	drawnPath ?
	drawnPath.setMap(null) : "";
}	

function showBuses () {
	var line = document.getElementById("choixLine").value;
	var nameLine = routes[line];

	var client = new XMLHttpRequest();
	console.log(nameLine);
	client.open("GET", "http://data.foli.fi/siri/vm",true);
	client.onreadystatechange = function() {	

		if(client.readyState == 4 && client.statusText == "OK") {
			var res = JSON.parse(client.responseText);
			var vehicles = res.result.vehicles
			console.log(vehicles);
			var vehiclesLine = Object.keys(vehicles).filter(veh => vehicles[veh].publishedlinename == nameLine)
			console.log(vehiclesLine);
			clearMarkers()
			for (var i = 0; i < vehiclesLine.length; i++){
				var indice = vehiclesLine[i];
				var lat = vehicles[indice].latitude;
				var lon = vehicles[indice].longitude;
				addMarker(lat, lon);
			}
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