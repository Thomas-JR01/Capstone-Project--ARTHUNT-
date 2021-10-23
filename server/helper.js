function getCityLat(name) {
	switch(name) {
		case "Brisbane":
			return -27.4705;
		case "Sydney":
			return -33.8560;
		case "Canberra":
			return -35.2796;
		default:
			return null;
	}
}

function getCityLong(name) {
	switch(name) {
		case "Brisbane":
			return 153.0260;
		case "Sydney":
			return 151.2067;
		case "Canberra":
			return 149.1307;
		default:
			return null;
	}
}

function getCurrentTime24() {
	let d = new Date();
	return d.toTimeString().split(" ")[0];
}

function getDistBetweenCoords(old, latest) {
	const EARTH_RADIUS = 6378100;
	let diff_lat_m = (Math.abs(latest.lat-old.lat)/360)*(2*Math.PI*EARTH_RADIUS);
	let diff_long_m = (Math.abs(latest.long-old.long)/360)*(2*Math.PI*EARTH_RADIUS);
	return Math.sqrt(Math.pow(diff_lat_m, 2)+Math.pow(diff_long_m, 2));
}

function shuffle(array) {
	return array.sort((a, b) => 0.5 - Math.random());
}

// Make the functions public
module.exports.getCityLat = getCityLat;
module.exports.getCityLong = getCityLong;
module.exports.getCurrentTime24 = getCurrentTime24;
module.exports.getDistBetweenCoords = getDistBetweenCoords;
module.exports.shuffle = shuffle;