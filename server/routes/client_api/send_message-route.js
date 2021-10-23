var express = require('express');
var router = express.Router();

const teamDBI = require('../../database/team-interface');
const eventDBI = require('../../database/event-interface');
const messagesDBI = require('../../database/messages-interface');
const auth = require('../../auth').authenticate;

const updateClientSubscribers = require('./subscribe_messages-route');
const updateAdminSubscribers = require('../admin_api/subscribe_messages-route');

// POST 'client-api/send-message/' page
// Request Body: message
// Return: success or error
router.post('/:recipient', auth, function(req, res, next) {
    let eventID = parseInt(req.info.eventID);
    let teamID = parseInt(req.info.teamID);
    let recipient = req.params.recipient;
    let message = req.body.message;

	req['mongo'] = ['client-api/send-message/'];

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

    let newMessage = {
        event: eventID,
        sender_id: teamID,
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
    .then((recipientID) => {
		req.mongo.push(recipientID);
        if (recipient === "All") {
            newMessage.recipient_id = 0;
        }
        else if(recipient === "Admin") {
            newMessage.recipient_id = -eventID;
        }
        else {
            newMessage.recipient_id = recipientID;
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
		updateClientSubscribers.respond(eventID, teamID, recipient);	// update relevant subscribers of message being sent
		updateAdminSubscribers.respond(eventID, teamID, recipient);
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