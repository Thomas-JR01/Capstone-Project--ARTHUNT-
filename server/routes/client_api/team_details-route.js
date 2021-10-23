var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const teamDBI = require('../../database/team-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'client-api/team-details/' page
/* Success Response:
[{
name: String,
contact: String,
strategy_selected: String,
points: Number
}, ...]
*/
router.get('/', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	let teamID = parseInt(req.info.teamID);
	const cacheKey = `${req.baseUrl}_${eventID}_${teamID}`;

	req['mongo'] = ['client-api/team-locations/'];

	if (!["team"].includes(req.perm)) {
		console.log("Access Denied");
		return res.json({
			status: "error",
			message: "Access Denied"
		});
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
			throw "Invalid Event ID"
		}
		return teamDBI.getTeamDetailedInfo(teamID, eventID)
	})
	.then((teamInfo) => {
		req.mongo.push(teamInfo);
		let rsp = {
			status: "success",
			response: teamInfo
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
