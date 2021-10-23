var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const eventSiteDBI = require('../../database/event_site-interface');
const auth = require('../../auth').authenticate;

// GET 'admin-api/delete-event/' page
/* Success Response:
{}
*/
router.get('/:event_id', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	
	req['mongo'] = ['admin-api/delete-event/'];
	
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

	eventDBI.isValidEventID(eventID)
	.then((validEvent) => {
		req.mongo.push(validEvent);
		if (!validEvent) {
			throw "Invalid Event ID";
		}
		return eventDBI.deleteEvent(eventID);
	})
	.then((deletedEvent) => {
		req.mongo.push(deletedEvent);
		return eventSiteDBI.deleteEventSites(eventID);
	})
	.then((deletedEventSites) => {
		req.mongo.push(deletedEventSites);
		let rsp = {
			'status': "success",
			'response': {}
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
