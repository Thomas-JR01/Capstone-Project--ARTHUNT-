var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const teamDBI = require('../../database/team-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'client-api/leaderboard/' page
/* Success Summary:
[{
_id: Number,
name: String,
points: Number
}, ...]
*/
router.get('/', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	const cacheKey = `${req.baseUrl}_${eventID}`;

	req['mongo'] = ['client-api/leaderboard/'];

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
		return teamDBI.getAllTeamsPoints(eventID);
	})
	.then((teamPoints) => {
		req.mongo.push(teamPoints);
		let rsp = {
			status: "success",
			response: teamPoints
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
