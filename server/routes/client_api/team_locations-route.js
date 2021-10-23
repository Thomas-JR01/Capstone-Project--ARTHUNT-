var express = require('express');
var router = express.Router();

const teamDBI = require('../../database/team-interface');
const eventDBI = require('../../database/event-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'client-api/team-locations/' page
/* Success Summary:
[{
_id: ObjectId,
lat: Number,
long: Number
}, ...]
*/
router.get('/', auth, function(req, res, next) {
    let eventID = parseInt(req.info.eventID);
	let virtual = Boolean(req.info.virtual);
	const cacheKey = `${req.baseUrl}_${eventID}`;

	req['mongo'] = ['client-api/team-locations/'];

	if (!["team", "admin", "superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		return res.json({
			status: "error",
			message: "Access Denied"
		});
	}
	
	if ((req.perm == "team") && !virtual) {
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
		return teamDBI.getTeamLocations(eventID);
	})
	.then((teamLoc) => {
		req.mongo.push(teamLoc);
		return Promise.all(teamLoc.map(async (team) => {
			team.name = await teamDBI.getNameFromID(team._id);
			delete team._id;
			return team;
		}));
	})
	.then((coordinates) => {
		req.mongo.push(coordinates);
		let rsp = {
			status: "success",
			response: coordinates
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
