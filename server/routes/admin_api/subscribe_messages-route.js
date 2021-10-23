var express = require('express');
var router = express.Router();

const teamDBI = require('../../database/team-interface');
const eventDBI = require('../../database/event-interface');
const messagesDBI = require('../../database/messages-interface');
const auth = require('../../auth').authenticate;

const subscribers = new Map(); // admin subscribers

// GET 'admin-api/subscribe-messages/' page
router.get('/:eventID/:recipient', auth, function(req, res, next) {
	let recipient = req.params.recipient;
    let eventID = parseInt(req.params.eventID);

    eventDBI.isValidEventID(eventID)
    .then(isValid => {
        if (!isValid) {
            res.json({
                status: "error",
                message: `Event ${eventID} does not exist.`
            })
        }
    })

	if (!["admin", "superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		return res.json({
			status: "error",
			message: "Access Denied"
		});
	}
	
    // unlike client who can only send messages with teamID in their jwt,
    // admins can subscribe simply as the negative eventID
	subscribe(res, -eventID, recipient);
})

function subscribe(res, subscriber, recipient) {
	//res.setHeader('Content-Type', 'text/plain;charset=utf-8');
	//res.setHeader("Cache-Control", "no-cache, must-revalidate");

    // if subscriber already polling, close it
	for (const connection of subscribers) {
		if (connection[0].subscriber === subscriber) {
			connection[1].end();
			subscribers.delete(connection[0])
			// console.log("connection", connection[0], "closed")
		}
	}

	const key = {subscriber, recipient};
    subscribers.set(key, res);
	// console.log("new admin sub:", key, "size " + subscribers.size)
}

async function publishMessages(recipient, eventID, res, connectionKey) {
    
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
        else {
            return messagesDBI.getAdminToRecipientMessages(eventID, recipientID)
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
function respond(eventID, ID, recipient) {
	for (const connection of subscribers) {
		const subscriberID = connection[0].subscriber;
		const subscriberRecipient = connection[0].recipient;
		const connectionKey = connection[0];
		const subscriberRes = connection[1];

        teamDBI.getNameFromID(ID)
        .then((sender) => {
            // update subscriber based on who the sender is and who the admin is chatting with
            // also only if the message being sent to the admin is the admin of the event
            if (subscriberID === -eventID && recipient === "Admin" && subscriberRecipient === sender) {                    
                return publishMessages(sender, eventID, subscriberRes, connectionKey)
            }
            else if  (recipient === "All" && subscriberRecipient === "All") { // if the admin is in 'All' chat and the message is being sent to 'All' chat
                return publishMessages("All", eventID, subscriberRes, connectionKey)
            }
            else if (ID === subscriberID) { // update subscriber if they sent a message
				return publishMessages(recipient, eventID, subscriberRes, connectionKey)
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