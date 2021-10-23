var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const strategyDBI = require('../../database/strategy-interface');
const strategyTemplateDBI = require('../../database/strategy_template-interface');
const teamDBI = require('../../database/team-interface');
const auth = require('../../auth').authenticate;

// POST 'client-api/join-strategy/' page
/* Success Summary:
{}
*/
router.post('/:name', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	let teamID = parseInt(req.info.teamID)
	let strategyName = req.params.name;

	req['mongo'] = ['client-api/join-strategy/'];

	let follower;

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
		follower = {
			team_id: teamID,
			points_gain: 0
		};
		return strategyTemplateDBI.isValidStrategyName(strategyName);
	})
	.then((validStratName) => {
		req.mongo.push(validStratName);
		if (!validStratName) {
			throw "Invalid Strategy Name";
		}
		return teamDBI.getTeamStrategy(eventID, teamID);
	})
	.then((strategy) => {
		req.mongo.push(strategy);
		if (strategy !== "") {
			throw "Strategy has alredy been chosen";
		}
		return strategyTemplateDBI.getStratIDFromName(strategyName);
	})
	.then((strategyID) => {
		req.mongo.push(strategyID);
		return strategyDBI.joinStrategy(eventID, strategyID, follower);
	})
	.then((joined) => {
		req.mongo.push(joined);
		return teamDBI.setTeamStrategy(eventID, teamID, strategyName);
	})
	.then((setStrategy) => {
		req.mongo.push(setStrategy);
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
