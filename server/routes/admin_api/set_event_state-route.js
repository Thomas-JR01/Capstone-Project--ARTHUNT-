var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

const validStates = ["paused", "active"]

// POST 'admin-api/set-event-state/' page.
/* Success Response:
{}
*/
router.post('/:event_id', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
    let eventState = req.body.event_state;
	const cacheKey = `${req.baseUrl}_${eventID}`;

	req['mongo'] = ['admin-api/set-event-state/'];

    if (!validStates.includes(eventState)) {
		let rsp = {
			status: "error",
			message: "Not a valid event state."
		};
		res.json(rsp);
        req.rsp = rsp;
        next();
        return;
    }

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
		return eventDBI.setGameState(eventID, eventState)
	})
	.then((eventStateSet) => {
		req.mongo.push(eventStateSet);
		let rsp = {
			status: "success",
			response: {}
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
