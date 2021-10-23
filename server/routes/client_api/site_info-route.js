var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const eventSiteDBI = require('../../database/event_site-interface');
const siteTemplateDBI = require('../../database/site_template-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'client-api/site-info/' page
/* Success Summary:
{
_id: ObjectId
site_num: Number,
points: Object(Number),
choices: Object(Array<String>),
site_id: ObjectId,
active: Boolean,
growth_rate: Number,
locked:Boolean,
hint: String
}
*/
router.get('/:site_num', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	let siteNum = parseInt(req.params.site_num);
	const cacheKey = `${req.baseUrl}_${siteNum}_${eventID}`;

	req['mongo'] = ['client-api/site-info/'];

	let siteInfo;

	if (!["team", "admin", "superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		res.json({
			status: "error",
			message: "Access Denied"
		});
		return;
	}

	if (!cache.isCacheExpired(cacheKey)) {
		res.json(cache.getCacheEntryData(cacheKey));
		return;
	}

	eventDBI.isValidEventID(eventID)
	.then((validEvent) => {
		req.mongo.push(validEvent);
		if (!validEvent) {
			throw "Invalid Event ID";
		}
		return eventSiteDBI.isValidEventSite(eventID, siteNum, 1000);
	})
	.then((validEventSite) => {
		req.mongo.push(validEventSite);
		if (!validEventSite) {
			throw "Invalid Event Site";
		}
		return eventSiteDBI.getSiteDetailedData(eventID, siteNum);
	})
	.then((siteData) => {
		req.mongo.push(siteData);
		siteInfo = siteData;
		return siteTemplateDBI.getSiteHint(siteData.site_id);
	})
	.then((siteHint) => {
		req.mongo.push(siteHint);
		siteInfo.hint = siteHint;
		let rsp = {
			status: "success",
			response: siteInfo
		};
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp);
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
	})
});

module.exports = router;