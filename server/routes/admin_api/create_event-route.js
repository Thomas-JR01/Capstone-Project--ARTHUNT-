var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const eventSiteDBI = require('../../database/event_site-interface');
const strategyDBI = require('../../database/strategy-interface');
const auth = require('../../auth').authenticate;

// POST 'admin-api/create-event/' page
/* Success Response:
{}
*/
router.post('/', auth, function(req, res, next) {
	let arg = req.body;
	let eventID;

	req['mongo'] = ['admin-api/create-event/'];

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

	let eventData = {
		name: arg.name,
		city: arg.city,
		coordinator_name: arg.coordinator,
		coordinator_contact: arg.contact,
		game_time: arg.settings.event_settings.game_time,
		num_questions: arg.settings.event_settings.question_number
	}

	let eventSettings = arg.settings;
	eventSettings["team_points"] = arg.settings.team_points;
	eventSettings["round_duration"] = arg.settings.event_settings.round_duration;
	eventSettings["reset_duration"] = arg.settings.event_settings.reset_duration;

	eventDBI.createEvent(eventData, eventSettings)
	.then((createdEvent) => {
		req.mongo.push(createdEvent);
		eventID = createdEvent.insertedId;
		return eventSiteDBI.createEventSites(eventID, arg.city);
	})
	.then((eventSites) => {
		req.mongo.push(eventSites);
		return strategyDBI.createEventStrategies(eventID);
	})
	.then((eventStrats) => {
		req.mongo.push(eventStrats);
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
			response: error
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
	})
})


module.exports = router;
