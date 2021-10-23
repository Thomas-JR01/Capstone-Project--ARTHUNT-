var express = require('express');
var router = express.Router();

const teamDBI = require('../../database/team-interface');
const eventDBI = require('../../database/event-interface');
const messagesDBI = require('../../database/messages-interface');
const auth = require('../../auth').authenticate;

const subscribers = new Map(); // client subscribers

// GET 'client-api/subscribe-messages/' page
router.get('/:recipient', auth, function(req, res, next) {
	let recipient = req.params.recipient;
	let username = req.info.username;
    let eventID = parseInt(req.info.eventID);	// team IDs are unique across events, so there is no need to check eventID
    let teamID = parseInt(req.info.teamID);

	if (!["team", "admin", "superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		return res.json({
			status: "error",
			message: "Access Denied"
		});
	}
	
	subscribe(res, teamID, recipient, username, eventID);
})

async function subscribe(res, subscriber, recipient, username, eventID) {
	//res.setHeader('Content-Type', 'text/plain;charset=utf-8');
	//res.setHeader("Cache-Control", "no-cache, must-revalidate");

	// if subscriber already polling, close it
	for (const connection of subscribers) {
		if (connection[0].subscriber === subscriber && connection[0].username === username && connection[0].eventID === eventID) {
			connection[1].end();
			subscribers.delete(connection[0])
			//console.log("connection", connection[0], "closed", "restablishing")
		}
	}

	const key = {subscriber, recipient, username, eventID};
    subscribers.set(key, res);
	// console.log("new sub:", key, "size " + subscribers.size)
}

async function publishMessages(recipient, eventID, teamID, res, connectionKey) {
    eventDBI.isValidEventID(eventID)
    .then((validEvent) => {
        if (!validEvent) {
            throw "Invalid Event ID";
        }

        return teamDBI.getIDFromName(eventID, recipient)
    })
    .then((recipientID) => {
        if (recipient === "All") {
            return messagesDBI.getAllChatMessages(eventID);
        }
        else if (recipient === "Admin") {
            return messagesDBI.getTeamToRecipientMessages(eventID, teamID, -eventID)
        }
        else { // messages between other team
            return messagesDBI.getTeamToRecipientMessages(eventID, teamID, recipientID)
        }
    })
	.then((messages) => {
		// resolve all IDs
		return Promise.all(messages.map(async (message) => {
			if (message.sender_id < 0) {
				message.sender = "Admin"
			} else {
				message.sender = await teamDBI.getNameFromID(message.sender_id);
			}
			return message;
		}));
	})
    .then((eventRecipientMessages) => {
        return res.json({
            status: "success",
            response: eventRecipientMessages
        });
    })
	.then(() => {
		// remove subscriber after having sent data
		subscribers.delete(connectionKey);
		// console.log("connection", connectionKey, "closed" , "sent")
	})
    .catch((error) => {
		console.log(error.stack);
		res.json({
			status: "error",
			message: error
		});
	})
}

// function called in send_message-route of admin and client to update subscribers
async function respond(eventID, ID, recipient) {
	for (const connection of subscribers) {
		const subscriberID = connection[0].subscriber;
		const subscriberRecipient = connection[0].recipient;
		const subscriberEventID = connection[0].eventID;
		const connectionKey = connection[0];
		const subscriberRes = connection[1];
		let subscriberName = undefined;

		// subscriber not in relevant event
		if (eventID !== subscriberEventID) {
			continue;
		}

		teamDBI.getNameFromID(subscriberID)
		.then((name) => {
			subscriberName = name;
			return teamDBI.getNameFromID(ID);
		})
		.then((sender) => {
			// if the sender ID could not be resolved as a team, than it is an Admin
			if (sender === undefined) {
				sender = "Admin";
			}

			// update subscriber message based on who the sender is and who the subscriber is chatting with
			if (subscriberName === recipient && subscriberRecipient === sender) {
				return publishMessages(sender, eventID, subscriberID, subscriberRes, connectionKey)
			}
			else if (recipient === "All" && subscriberRecipient === "All") { // if the subscriber is in 'All' chat and a message is sent to 'All' chat
				return publishMessages("All", eventID, subscriberID, subscriberRes, connectionKey)
			}
			else if (sender == subscriberName) { // update subscriber if they sent a message
				return publishMessages(recipient, eventID, subscriberID, subscriberRes, connectionKey)
			}
		})
		.catch((error) => {
			console.log(error.stack);
			res.json({
				status: "error",
				message: error
			});
		})
	}
}

module.exports.router = router;
module.exports.respond = respond;