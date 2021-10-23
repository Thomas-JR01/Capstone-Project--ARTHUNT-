var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var bcrypt = require('bcryptjs');

const eventDBI = require('../../database/event-interface');
const teamDBI = require('../../database/team-interface');

/* File contains routes:
POST 'client-api/login/team' (For team login)
POST 'client-api/login/user' (For user login)
*/

// POST 'client-api/login/team/' page
/* Success Summary:
{
team_id: Number,
members: Array<Object(name: String, virtual: Boolean)>
}
*/
router.post('/team/:event_id', async function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	let teamName = req.body.team_name;
	let providedPIN = req.body.pin;

	req['mongo'] = ['client-api/login/team/'];

	let teamID;

	eventDBI.isValidEventID(eventID)
	.then((validEvent) => {
		req.mongo.push(validEvent);
		if (!validEvent) {
			throw "Invalid Event ID";
		}
		return teamDBI.getIDFromName(eventID, teamName);
	})
	.then((id) => {
		req.mongo.push(id);
		teamID = id;
		return teamDBI.getTeamPINHash(eventID, teamID);
	})
	.then(async (teamPIN) => {
		req.mongo.push(teamPIN);
		if (teamPIN === undefined) {
			throw "Invalid Login";
		}

		let validPIN = await bcrypt.compare(providedPIN, teamPIN);
		if (!validPIN) {
			throw "Invalid Login";
		}
		return teamDBI.getTeamParticpants(eventID, teamID);
	})
	.then((teamParticipants) => {
		req.mongo.push(teamParticipants);
		let rsp = {
			status: "success",
			response: {
				team_id: teamID,
				members: teamParticipants
			}
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
	})
	.catch((error) => {
		req.mongo.push(error);
		let rsp = {
			status: "error",
			message: error
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
	})
})

// POST 'client-api/login/user/' page
/* Success Summary:
token: String
*/
router.post('/user/:event_id', async function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	let username = req.body.username;
	let virtual = req.body.virtual;
	let teamID = req.body.team_id;

	req['mongo'] = ['client-api/login/user/'];

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

		// Create JWT token
		const SECRET_KEY = require('../../env').config.jwt.secret;
		const expiresIn = 60; // seconds
		const expiry = Date.now() + expiresIn * 1000;
		const token = jwt.sign({username, virtual, eventID, teamID, perm:"team", expiry}, SECRET_KEY);

		let rsp = {
			'status': "success",
			'response': token
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
