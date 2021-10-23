var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'admin-api/list-events/' page
/* Success Response:
[{
_id: Number,
name: String,
city: String,
active: Boolean,
game_timer: Number,
settings: Object(round_duration:Number, reset_duration:Number)
}, ...]
*/
router.get('/', auth, function(req, res, next) {
	const cacheKey = `${req.baseUrl}`;

	req['mongo'] = ['admin-api/list-events/'];

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

	eventDBI.getEventSummaries()
	.then((eventList) => {
		req.mongo.push(eventList);
		let rsp = {
			'status': "success",
			'response': eventList
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
