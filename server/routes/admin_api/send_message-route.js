var express = require('express');
var router = express.Router();

const teamDBI = require('../../database/team-interface');
const eventDBI = require('../../database/event-interface');
const messagesDBI = require('../../database/messages-interface');
const auth = require('../../auth').authenticate;

const updateClientSubscribers = require('../client_api/subscribe_messages-route');
const updateAdminSubscribers = require('../admin_api/subscribe_messages-route');

// POST 'admin-api/send-message/' page
// Request Body: message
// Return: success or error
router.post('/:event_id/:recipient', auth, function(req, res, next) {
    let eventID = parseInt(req.params.event_id);
    let recipient = req.params.recipient;
    let message = req.body.message;

	req['mongo'] = ['admin-api/send-message/'];

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

    let newMessage = {
        event: eventID,
        sender_id: -eventID,
        recipient_id: null,
        message_text: message,
        timestamp: new Date()
    }

    eventDBI.isValidEventID(eventID)
    .then((validEvent) => {
		req.mongo.push(validEvent);
        if (!validEvent) {
            throw "Invalid Event ID";
        }

        return teamDBI.getIDFromName(eventID, recipient);
    })
    .then((teamID) => {
		req.mongo.push(teamID);
        if (recipient === "All") {
            newMessage.recipient_id = 0;
        }
        else {
            newMessage.recipient_id = teamID;
        }

        return messagesDBI.sendMessage(newMessage);
    })
    .then((sentMessage) => {
		req.mongo.push(sentMessage);
		let rsp = {
			status: "success",
			response: {}
		};
		res.json(rsp);
		req.rsp = rsp;
		updateClientSubscribers.respond(eventID, -eventID, recipient);	// update relevant subscribers
		updateAdminSubscribers.respond(eventID, -eventID, recipient);
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