var map;
var drawnPath;
var markers = [];
var routes = {};

//initalize the map
function myMap() {
	var mapProp= {
		center:new google.maps.LatLng(60.452359, 22.266520),
		zoom:11,
		maxZoom: 15,
	};
	map=new google.maps.Map(document.getElementById("map"),mapProp);
}

//create the list of routes
function createList() {

	var client = new XMLHttpRequest();
	client.open("GET", "http://data.foli.fi/gtfs/v0/20171130-162538/routes",true); //request to find out all the routes
	client.onreadystatechange = function() {	

		if(client.readyState == 4 && client.statusText == "OK") {
			var res = JSON.parse(client.responseText);
			var textList = "";
			for (var i = 0; i < res.length; i++) {
				routes[res[i].route_id] = res[i].route_short_name; //keep in memory the id and the route name
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


function drawRoute () {
	var line = document.getElementById("lineChoice").value;
	var client = new XMLHttpRequest();
	var shape;
	
	client.open("GET", "http://data.foli.fi/gtfs/v0/20171130-162538/trips/route/" + line,true); //search for the shape matching the route id
	console.log(client);
	client.onreadystatechange = function() {	

		if(client.readyState == 4 && client.statusText == "OK") {
			var res = JSON.parse(client.responseText);
			shape = res[0].shape_id;
			searchPath(shape);
			document.getElementById("infoUser").innerHTML = "";
		} else {
			document.getElementById("infoUser").innerHTML = "Route not found please choose a new route number";
		};
	};
	client.send();
}

function searchPath (shape) {
	var path = [];
	var client = new XMLHttpRequest();
	client.open("GET", "http://data.foli.fi/gtfs/v0/20171130-162538/shapes/" + shape,true); //search for the path matching th shape id
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

//drawn the line according to the pathBus given in parameter
function drawPolyline (pathBus) {
	removeLines();
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

//norm the path into Gmap LatLng element + create a LatLng bounds
function normPath (path) {
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < path.length; i++){
		path [i] = new google.maps.LatLng(path[i].lat, path[i].lon);
		bounds.extend(path [i]);
	}
	console.log(path);
	return {path, bounds};
}

function removeLines() {
	drawnPath ?
	drawnPath.setMap(null) : "";
}	

function showBuses () {
	var line = document.getElementById("lineChoice").value;
	var nameLine = routes[line]; //get the name matching the route id

	var client = new XMLHttpRequest();

	client.open("GET", "http://data.foli.fi/siri/vm",true);
	client.onreadystatechange = function() {	

		if(client.readyState == 4 && client.statusText == "OK") {
			var res = JSON.parse(client.responseText);
			var vehicles = res.result.vehicles
			var vehiclesLine = Object.keys(vehicles).filter(veh => vehicles[veh].publishedlinename == nameLine) //get the buses matching the name

			clearMarkers();

			for (var i = 0; i < vehiclesLine.length; i++){ //add Markers
				var indice = vehiclesLine[i];
				var lat = vehicles[indice].latitude;
				var lon = vehicles[indice].longitude;
				addMarker(lat, lon);
			}
			if (markers.length > 0){ //add bounds
				var bounds = new google.maps.LatLngBounds();
				for (var i = 0; i < markers.length; i++){
					bounds.extend(markers[i].getPosition())
				}
				map.fitBounds(bounds);
				document.getElementById("infoUser").innerHTML = "There is " + markers.length + " active Bus(es) for this route line";
			} else {
				document.getElementById("infoUser").innerHTML = "No Buses found for this route line";
			}
		} else {
			document.getElementById("infoUser").innerHTML = "No Buses found for this route line";
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

//clear the map each time the user touch the lineChoice box
function reset () {
	clearMarkers();
	removeLines();
}