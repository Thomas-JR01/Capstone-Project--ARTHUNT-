var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const messagesDBI = require('../../database/messages-interface');
const teamDBI = require('../../database/team-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'admin-api/messages/' page
router.get('/:event_id/:recipient', auth, function(req, res, next) {
    let eventID = parseInt(req.params.event_id);
    let recipient = req.params.recipient;
    const cacheKey = `${req.baseUrl}_${eventID}_${recipient}`;

	req['mongo'] = ['admin-api/messages/'];

    if ((!["admin", "superadmin"].includes(req.perm))) {
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

	if (!cache.isCacheExpired(cacheKey)) {
		let rsp = cache.getCacheEntryData(cacheKey);
		req.rsp = rsp;
		res.json(rsp);
		next();
		return;
	}

    eventDBI.isValidEventID(eventID)
    .then((validEvent) => {
		req.mongo.push(validEvent);
        if (!validEvent) {
            throw "Invalid Event ID";
        }

        return teamDBI.getIDFromName(eventID, recipient)
    })
    .then((recipientID) => {
		req.mongo.push(recipientID);
        if (recipient === "All") {
            return messagesDBI.getAllChatMessages(eventID);
        }
        else {
            return messagesDBI.getAdminToRecipientMessages(eventID, recipientID)
        }
    })
	.then((messages) => {
		req.mongo.push(messages);
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
		req.mongo.push(eventRecipientMessages);
        let rsp = {
            status: "success",
            response: eventRecipientMessages
        };
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp, 1000);
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
		cache.addCacheEntry(cacheKey, rsp);
		req.rsp = rsp;
		next();
	})
})

module.exports = router;