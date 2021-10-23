var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const eventSiteDBI = require('../../database/event_site-interface');
const siteTemplateDBI = require('../../database/site_template-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'client-api/locations/' page
/* Success Summary:
[{
_id: ObjectId,
lat: Number,
long: Number
}, ...]
*/
router.get('/', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	const cacheKey = `${req.baseUrl}_${eventID}`;

	req['mongo'] = ['client-api/locations/'];

	if (!["team", "admin", "superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		let rsp = {
			status: "error",
			message: "Access Denied"
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
		return;
	}

	if (!cache.isCacheExpired(cacheKey)) {
		let rsp = cache.getCacheEntryData(cacheKey);
		req.rsp = rsp;
		res.json(rsp);
		next();
		return;
	}

	eventDBI.isValidEventID(eventID)
	.then((validEvent) => {
		req.mongo.push(validEvent);
		if (!validEvent) {
			throw "Invalid Event ID";
		}
		return eventDBI.getEventLocation(eventID);
	})
	.then((location) => {
		req.mongo.push(location);
		return siteTemplateDBI.getSiteLocationsForCity(location.city);
	})
	.then((coordinates) => {
		req.mongo.push(coordinates);
		let rsp = {
			status: "success",
			response: coordinates
		};
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp, (5*60*1000));
		req.rsp = rsp;
		next();
	})
	.catch((error) => {
		req.mongo.push(error);
		console.log(error.stack);
		let rsp = {
			status: "error",
			message: error
		};
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp);
		req.rsp = rsp;
		next();
	})
})

module.exports = router;
