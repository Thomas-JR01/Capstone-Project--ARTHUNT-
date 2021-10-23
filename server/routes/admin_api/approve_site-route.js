var express = require('express');
var router = express.Router();

const eventSiteDBI = require('../../database/event_site-interface');
const pointsHistoryDBI = require('../../database/points_history-interface');
const siteVisitDBI = require('../../database/site_visit-interface');
const teamDBI = require('../../database/team-interface');
const auth = require('../../auth').authenticate;

// GET 'admin-api/approve-site/' page
/* Success Response:
{}
*/
router.get('/:event_id/:site_num/:members', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	let siteNum = parseInt(req.params.site_num);
	let members = parseInt(req.params.members);
	req['mongo'] = ['admin-api/approve-site/'];

	let oldPoints, diffPoints = 0;
	
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

	let siteVisit;

	siteVisitDBI.isValidActiveSiteVisit(eventID, siteNum)
	.then((validSiteVisit) => {
		req.mongo.push(validSiteVisit);
		if (!validSiteVisit) {
			throw "Invalid Site Visit; May not exist or is already marked!";
		}
		return siteVisitDBI.approveSiteVisit(eventID, siteNum, members);
	})
	.then((approveSiteVisit) => {
		req.mongo.push(approveSiteVisit);
		return siteVisitDBI.getLatestSiteVisit(eventID, siteNum);
	})
	.then((latestSiteVisit) => {
		req.mongo.push(latestSiteVisit);
		siteVisit = latestSiteVisit;
		return teamDBI.getTeamPoints(eventID, siteVisit.team_sent);
	})
	.then((points) => {
		req.mongo.push(points);
		oldPoints = points.points;
		return teamDBI.getTeamParticpants(eventID, siteVisit.team_sent);
	})
	.then((teamParticipants) => {
		req.mongo.push(teamParticipants);
		let numField = teamParticipants.filter((member) => (!member.virtual)).length;
		let mark = Math.pow(1.9, (members-numField));
		if (members === -1) {
			mark = 1;
		}

		let totalPoints = 0;
		let earned = siteVisit.points_earned;

		Object.keys(earned).forEach((key) => {
			if (earned[key] < 0) { // Add full negative points value
				totalPoints += earned[key];
			} else { // Add the fractional marks value of positive points
				totalPoints += earned[key] * mark;
			}
		});
		diffPoints = parseFloat(totalPoints.toFixed(4));

		return teamDBI.sendTeamPoints(eventID, siteVisit.team_sent, diffPoints);
	})
	.then((teamPoints) => {
		req.mongo.push(teamPoints);
		return eventSiteDBI.giveSitePoints(eventID, siteNum, -diffPoints);
	})
	.then((sitePoints) => {
		req.mongo.push(sitePoints);
		return eventSiteDBI.setLockEventSite(eventID, siteNum, false);
	})
	.then((lockState) => {
		req.mongo.push(lockState);
		return teamDBI.getTeamPoints(eventID, siteVisit.team_sent);
	})
	.then((newPoints) => {
		req.mongo.push(newPoints);
		let pointData = {
			event: eventID,
			team_id: siteVisit.team_sent,
			points_diff: diffPoints,
			old_value: oldPoints,
			new_value: newPoints.points,
			reason: "visit",
			timestamp: new Date()
		};
		return pointsHistoryDBI.createNewPointsHistory(pointData);
	})
	.then((createPoint) => {
		req.mongo.push(createPoint);
		return eventSiteDBI.getSitePointInfo(eventID, siteNum);
	})
	.then((sitePoint) => {
		req.mongo.push(sitePoint);
		let growthRateData = {
			event: eventID,
			team_id: siteVisit.team_sent,
			points_diff: 0,
			old_value: sitePoint.growth_rate,
			new_value: sitePoint.growth_rate,
			reason: "site-growth_rate-log",
			timestamp: new Date()
		};
		return pointsHistoryDBI.createNewPointsHistory(growthRateData);
	})
	.then((rateHistory) => {
		req.mongo.push(rateHistory);
		let rsp = {
			status: "success",
			response: {}
		};
		res.json(rsp);
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
		req.rsp = rsp;
		next();
	})
})


module.exports = router;
