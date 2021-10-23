var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const teamDBI = require('../../database/team-interface');
const siteVisitDBI = require('../../database/site_visit-interface');
const siteTemplateDBI = require('../../database/site_template-interface');
const auth = require('../../auth').authenticate;

const subscribers = new Map(); // admin subscribers

router.get('/:event_id', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);

    if (!["admin", "superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		return res.json({
			status: "error",
			message: "Access Denied"
		});
	}

    subscribe(res, -eventID);
})

function subscribe(res, subscriber) {
	//res.setHeader('Content-Type', 'text/plain;charset=utf-8');
	//res.setHeader("Cache-Control", "no-cache, must-revalidate");

    // if subscriber already polling, close it
	for (const connection of subscribers) {
		if (connection[0] === subscriber) {
			connection[1].end();
			subscribers.delete(connection[0])
			//console.log("connection", connection[0], "closed")
		}
	}

	const key = subscriber;
    subscribers.set(key, res);
	//console.log("new admin sub:", key, "size " + subscribers.size)
}

// function called in site_attempt-route in client api
function publishAttempts(eventID, res, connectionKey) {
	let visitGiven;

	eventDBI.isValidEventID(eventID)
	.then((validEvent) => {
		if (!validEvent) {
			throw "Invalid Event ID";
		}
		return siteVisitDBI.getAllSiteVisits(eventID)
	})
	.then((siteVisits) => {
		visitGiven = siteVisits;
		return Promise.all(siteVisits.map(visit => siteTemplateDBI.getSiteAnswers(visit.site_id)));
	})
	.then((siteAnswers) => {
		return siteAnswers.map((answer, i) => ({
			closeup: answer.closeup,
			title: answer.title,
			artist: answer.artist,
			year: answer.year,
			theme: answer.theme,
			main_img: answer.main_img,
			event: visitGiven[i].event,
			site_num: visitGiven[i].site_num,
			points_earned: visitGiven[i].points_earned,
			answers_given: visitGiven[i].answers_given,
			team_img: visitGiven[i].team_img,
			marked: visitGiven[i].marked,
			timestamp: visitGiven[i].timestamp,
			team_sent: visitGiven[i].team_sent
		}));
	})
    .then((zipped) => {
		// resolve all IDs
		return Promise.all(zipped.map(async (attempt) => {
			attempt.team_sent = await teamDBI.getNameFromID(attempt.team_sent);
			return attempt;
		}));
	})
	.then((resolvedAttempts) => {
		return res.json({
			status: 'success',
			response: resolvedAttempts
		});
	})
    .then(() => {
        // remove subscriber after having sent data
		subscribers.delete(connectionKey);
    })
	.catch((error) => {
		console.log(error.stack);
		return res.json({
			status: "error",
			message: error
		});
	})
}

// function called in send_message-route of admin and client to update subscribers
function respond(eventID) {
	for (const connection of subscribers) {
		const subscriberID = connection[0];
		const connectionKey = connection[0];
		const subscriberRes = connection[1];

        if (subscriberID === -eventID) {
            publishAttempts(eventID, subscriberRes, connectionKey);
        }
	}
}


module.exports.router = router;
module.exports.respond = respond;