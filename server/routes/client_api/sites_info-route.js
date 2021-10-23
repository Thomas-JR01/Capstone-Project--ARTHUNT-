var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const eventSiteDBI = require('../../database/event_site-interface');
const siteTemplateDBI = require('../../database/site_template-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'client-api/sites-info/' page
/* Success Summary:
{
Array<{
	_id: ObjectId
	site_num: Number,
	points: Object(Number),
	choices: Object(Array<String>),
	site_id: ObjectId,
	active: Boolean,
	growth_rate: Number,
	locked:Boolean,
	hint: String
}>
}
*/
router.get('/', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	const cacheKey = `${req.baseUrl}_${eventID}`;

	req['mongo'] = ['client-api/sites-info/'];

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
		return eventSiteDBI.getSitesSummaryData(eventID);
	})
	.then((sitesData) => {
		req.mongo.push(sitesData);
		return Promise.all(sitesData.map(async site => {
			siteInfo = await siteTemplateDBI.getSiteHintAndLocation(site.site_id);
			delete site.site_id;
			site.hint = siteInfo.clue;
			site.long = siteInfo.long;
			site.lat = siteInfo.lat;
			return site;
		}));
	})
	.then((sitesDataWithHint) => {
		req.mongo.push(sitesDataWithHint);
		let removedInactive = sitesDataWithHint.filter((site) => {return site.active;});
		let rsp = {
			status: "success",
			response: removedInactive
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
