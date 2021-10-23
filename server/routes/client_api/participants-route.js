var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const teamDBI = require('../../database/team-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'client-api/participants/' page
/* Success Summary:
[{
name: String,
virtual: Boolean
}, ...]
*/
router.get('/participants/:team_name', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	let teamName = req.params.team_name;
	const cacheKey = `${req.baseUrl}_${eventID}_${teamName}`;

	req['mongo'] = ['client-api/participants/'];

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
		return teamDBI.getIDFromName(eventID, teamName);
	})
	.then((teamID) => {
		req.mongo.push(teamID);
		if (teamID === undefined) {
			throw "Invalid Team Name";
		}
		return teamDBI.getTeamParticpants(eventID, teamID);
	})
	.then((participants) => {
		req.mongo.push(participants);
		let rsp = {
			status: "success",
			response: participants
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
