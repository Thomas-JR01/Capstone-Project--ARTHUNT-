var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const eventSiteDBI = require('../../database/event_site-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'admin-api/event-sites/' page
/* Success Response:
[{
_id: ObjectId,
site_num: Number,
active: Boolean,
points: Number,
growth_rate: Number,
locked: Boolean
}, ...]
*/
router.get('/:event_id', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	const cacheKey = `${req.baseUrl}_${eventID}`;

	req['mongo'] = ['admin-api/event-sites/'];

	if (!["admin", "superadmin"].includes(req.perm)) {
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
		return eventSiteDBI.getSitesSummaryData(eventID);
	})
	.then((eventSites) => {
		req.mongo.push(eventSites);
		return eventSites.map((site) => ({
			site_id: site.site_id,
			site_number: site.site_num,
			active: site.active,
			total_points: site.total_points,
			growth_factor: site.growth_factor,
			locked: site.locked
		}));
	})

	.then((sites) => {
		req.mongo.push(sites);
		let rsp = {
			status: "success",
			response: sites
		};
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp);
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
