var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const strategyDBI = require('../../database/strategy-interface');
const strategyTemplateDBI = require('../../database/strategy_template-interface');
const teamDBI = require('../../database/team-interface');
const auth = require('../../auth').authenticate;

// POST 'client-api/leave-strategy/' page
/* Success Summary:
{}
*/
router.post('/', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	let teamID = parseInt(req.info.teamID);

	req['mongo'] = ['client-api/leave-strategy/'];

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
		return teamDBI.getTeamStrategy(eventID, teamID);
	})
	.then((strategy) => {
		req.mongo.push(strategy);
		if (strategy === "") {
			throw "No strategy has been joined";
		}
		return strategyTemplateDBI.getStratIDFromName(strategy);
	})
	.then((strategyID) => {
		req.mongo.push(strategyID);
		return strategyDBI.leaveStrategy(eventID, strategyID, teamID);
	})
	.then((leftStrategy) => {
		req.mongo.push(leftStrategy);
		return teamDBI.setTeamStrategy(eventID, teamID, "");
	})
	.then((removedStrategy) => {
		req.mongo.push(removedStrategy);
		let rsp = {};
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
