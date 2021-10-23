var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const teamDBI = require('../../database/team-interface');
const siteVisitDBI = require('../../database/site_visit-interface');
const siteTemplateDBI = require('../../database/site_template-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'admin-api/site-attempts/' page
/* Success Response:
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
router.get('/:event_id', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	const cacheKey = `${req.baseUrl}_${eventID}`;

	let visitGiven;

	req['mongo'] = ['admin-api/site-attempts/'];

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
		return siteVisitDBI.getAllSiteVisits(eventID)
	})
	.then((siteVisits) => {
		req.mongo.push(siteVisits);
		visitGiven = siteVisits;
		return Promise.all(siteVisits.map(visit => siteTemplateDBI.getSiteAnswers(visit.site_id)));
	})
	.then((siteAnswers) => {
		req.mongo.push(siteAnswers);
		return siteAnswers.map((answer, i) => ({
			closeup: answer.closeup,
			title: answer.title,
			artist: answer.artist,
			year: answer.year,
			theme: answer.theme,
			main_img: answer.main_img,
			event: visitGiven[i].event,
			site_num: visitGiven[i].site_num,
			points_earned: visitGiven[i].points_earned,
			answers_given: visitGiven[i].answers_given,
			team_img: visitGiven[i].team_img,
			marked: visitGiven[i].marked,
			timestamp: visitGiven[i].timestamp,
			team_sent: visitGiven[i].team_sent
		}));
	})
	.then((zipped) => {
		req.mongo.push(zipped);
		// resolve all IDs
		return Promise.all(zipped.map(async (attempt) => {
			attempt.team_sent = await teamDBI.getNameFromID(attempt.team_sent);
			return attempt;
		}));
	})
	.then((resolvedAttempts) => {
		req.mongo.push(resolvedAttempts);
		let rsp = {
			status: 'success',
			response: resolvedAttempts
		};
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp, 1000);
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
