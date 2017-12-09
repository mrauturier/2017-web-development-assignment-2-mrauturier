var map;
var markers = [];

function myMap() {
	var mapProp= {
		center:new google.maps.LatLng(55.573699, 15.700307),
		zoom:3,
	};
	map=new google.maps.Map(document.getElementById("map"),mapProp);
}

function createList () {
	
}
