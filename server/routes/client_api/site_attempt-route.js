var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const eventSiteDBI = require('../../database/event_site-interface');
const locationHistoryDBI = require('../../database/location_history-interface');
const siteTemplateDBI = require('../../database/site_template-interface');
const siteVisitDBI = require('../../database/site_visit-interface');
const teamDBI = require('../../database/team-interface');
const auth = require('../../auth').authenticate;
const helper = require('../../helper');

const updateAdminAttempts = require('../admin_api/subscribe_site_attempts-route');

// POST 'client-api/site-attempt/' page
/* Success Response:
{}
*/
router.post('/:site_num', auth, function(req, res, next) {
	let siteNum = parseInt(req.params.site_num);
	let eventID = parseInt(req.info.eventID);
	let teamID = parseInt(req.info.teamID);
	let answers = req.body.answers;
	let teamImg = req.body.team_img;
	let submitNotes = req.body.notes;

	req['mongo'] = ['client-api/site-attempt/'];

	let oldLocation, newLocation = {};
	
	let newVisit = {
		event: eventID,
		site_num: siteNum,
		site_id: null,
		points_earned: {},
		answers_given: {},
		team_img: "",
		notes: "",
		marked: false,
		timestamp: "",
		team_sent: ""
	};
	let sitePoints = {};

	if (!["team", "admin", "superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		let rsp = {
			status: "error",
			message: "Access Denied"
		};
		res.json(rsp);
		res.rsp = rsp;
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
		return eventSiteDBI.isValidEventSite(eventID, siteNum);
	})
	.then((validEventSite) => {
		req.mongo.push(validEventSite);
		if (!validEventSite) {
			throw "Invalid Event Site";
		}
		return teamDBI.getIndividualTeamLocation(eventID, teamID);
	})
	.then((teamLocation) => {
		req.mongo.push(teamLocation);
		oldLocation = {lat: teamLocation.team_lat, long: teamLocation.team_long};
		return eventSiteDBI.getSiteDetailedData(eventID, siteNum);
	})
	.then((detailedSiteData) => {
		req.mongo.push(sitePoints);
		sitePoints = detailedSiteData.points;
		newVisit.site_id = detailedSiteData.site_id;

		return siteTemplateDBI.getSiteAnswers(detailedSiteData.site_id);
	})
	.then((siteAnswers) => {
		req.mongo.push(siteAnswers);
		let categories = ["site", "title", "theme", "closeup", "artist", "year"];
		let pointsCalc = {"site_amt":0, "title_amt":0, "theme_amt":0, "closeup_amt":0, "artist_amt":0, "year_amt":0};

		categories.forEach((category) => {
			let amt = (sitePoints[`${category}_pct`]/100.0) * sitePoints.total_amt;

			if (siteAnswers[category]?.toString() !== answers[category]?.toString()) {
				amt *= -1; // Get negative points if got answer wrong
			}

			pointsCalc[`${category}_amt`] = amt;
		})

		newVisit.answers_given = answers;
		newVisit.team_img = teamImg;
		newVisit.notes = (submitNotes===undefined) ? "" : submitNotes;
		newVisit.timestamp = new Date();	
		newVisit.points_earned = pointsCalc;
		newVisit.team_sent = teamID;
		return eventSiteDBI.isEventSiteUnlocked(eventID, siteNum);
	})
	.then((eventSiteLock) => {
		req.mongo.push(eventSiteLock);
		if (!eventSiteLock) {
			throw "Event Site Locked";
		}
		return siteVisitDBI.createSiteVisit(newVisit);
	})
	.then((createVisit) => {
		req.mongo.push(createVisit);
		return eventSiteDBI.setLockEventSite(eventID, siteNum, true);
	})
	.then((lockedSite) => {
		req.mongo.push(lockedSite);
		return eventSiteDBI.incrementSiteVisit(eventID, siteNum);
	})
	.then((siteIncrement) => {
		req.mongo.push(siteIncrement);
		return siteTemplateDBI.getIndividualSiteLocation(newVisit.site_id);
	})
	.then((siteLocation) => {
		req.mongo.push(siteLocation);
		newLocation = {lat: siteLocation.lat, long: siteLocation.long};
		return teamDBI.setTeamLocation(eventID, teamID, siteLocation.lat, siteLocation.long);
	})
	.then((updateTeamLocation) => {
		req.mongo.push(updateTeamLocation);
		let locationData = {
			event: eventID,
			team_id: teamID,
			old_value: oldLocation,
			new_value: newLocation,
			total_distance: helper.getDistBetweenCoords(oldLocation, newLocation),
			reason: "visit",
			timestamp: new Date()
		};
		return locationHistoryDBI.createNewLocationHistory(locationData);
	})
	.then((createLocation) => {
		req.mongo.push(createLocation);
		let rsp = {
			status: "success",
			response: {}
		};
		res.json(rsp);
		req.rsp = rsp;
		updateAdminAttempts.respond(eventID);
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
		req.rsp = rsp;
		next();
	})
})

module.exports = router;
