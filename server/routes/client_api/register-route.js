var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');

const eventDBI = require('../../database/event-interface');
const teamDBI = require('../../database/team-interface');

// POST 'client-api/register/' page
/* Success Response:
{}
*/
router.post('/:event_id', async function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	let pin = req.body.pin;
	let teamName = req.body.team_name;
	let contact = req.body.contact;
	let participants = req.body.participants;
	let teamID = 0;

	req['mongo'] = ['client-api/register/'];

	let storePIN;

	eventDBI.isValidEventID(eventID)
	.then((validEvent) => {
		req.mongo.push(validEvent);
		if (!validEvent) {
			throw "Invalid Event ID";
		}
		return teamDBI.getIDFromName(eventID, teamName);
	})
	.then(async (ID) => {
		req.mongo.push(ID);
		if (ID !== undefined) {
			throw "Team Name Used";
		}

		let salt = await bcrypt.genSalt(require('../../env').config.bcrypt.num_salt);
		storePIN = await bcrypt.hash(pin, salt);
		return eventDBI.getGameSettings(eventID);
	})
	.then((gameSettings) => {
		req.mongo.push(gameSettings);
		let teamSettings = {
			default_points: gameSettings.team_points,
			growth_rate: gameSettings.growth_rate
		}
		return teamDBI.createNewTeam(eventID, teamName, contact, storePIN, participants, teamSettings);
	})
	.then((create) => {
		req.mongo.push(create);
		teamID = create.insertedId;
		return eventDBI.getEventLocation(eventID);
	})
	.then((location) => {
		req.mongo.push(location);
		return teamDBI.setTeamLocation(eventID, teamID, location.base_lat, location.base_long);
	})
	.then((updateTeamLocation) => {
		req.mongo.push(updateTeamLocation);
		return eventDBI.updateTeamAndParticipantCount(eventID, 1, participants.length);
	})
	.then((updatedCount) => {
		req.mongo.push(updatedCount);
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
