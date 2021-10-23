var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const siteVisitDBI = require('../../database/site_visit-interface');
const teamDBI = require('../../database/team-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'client-api/site-visits/' page
/* Success Summary:
[{
closeup: String,
title: String,
artist: String,
year: Number,
theme: String,
event: Number,
site_num: Number,
points_earned: Object(Number)
answers_given: Object(String),
team_img: String
marked: Boolean,
timestamp: String,
team_sent: Number
}, ...]
*/
router.get('/', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	let teamID = parseInt(req.info.teamID);
	const cacheKey = `${req.baseUrl}_${eventID}_${teamID}`;

	req['mongo'] = ['client-api/site-visits/'];

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
		return teamDBI.isValidTeamID(eventID, teamID);
	})
	.then((validTeam) => {
		req.mongo.push(validTeam);
		if (!validTeam) {
			throw "Invalid Team ID";
		}
		return siteVisitDBI.getTeamSiteVisits(eventID, teamID);
	})
	.then((teamVisits) => {
		req.mongo.push(teamVisits);
		let rsp = {
			status: "success",
			response: teamVisits
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
