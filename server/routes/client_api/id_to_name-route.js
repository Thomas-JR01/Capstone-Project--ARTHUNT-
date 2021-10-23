var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const teamDBI = require('../../database/team-interface');
const cache = require('../../cache');

// GET 'client-api/id-to-name/' page
/* Success Response:
value: String
*/
router.get('/:type/:value', function(req, res, next) {
	let type = req.params.type;
	let value = parseInt(req.params.value);
	const cacheKey = `${req.baseUrl}_${type}_${value}`;
	req['mongo'] = ['client-api/id-to-name/'];

	if (!cache.isCacheExpired(cacheKey)) {
		let rsp = cache.getCacheEntryData(cacheKey);
		req.rsp = rsp;
		res.json(rsp);
		next();
		return;
	}

	switch (type) {
		case "event":
			eventDBI.getNameFromID(value)
			.then((result) => {
				req.mongo.push(result);
				if (result === undefined) {
					throw "Invalid Event ID";
				}
				let rsp = {
					'status': "success",
					'response': result
				};
				res.json(rsp);
				cache.addCacheEntry(cacheKey, rsp);
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
			break;
		case "team":
			teamDBI.getNameFromID(value)
			.then((result) => {
				req.mongo.push(result);
				if (result === undefined) {
					throw "Invalid Team ID";
				}
				let rsp = {
					'status': "success",
					'response': result
				};
				res.json(rsp);
				cache.addCacheEntry(cacheKey, rsp);
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
			break;
		default:
			console.log("Invalid Type");
			let rsp = {
				'status': "error",
				'message': "Invalid Type"
			};
			res.json(rsp);
			cache.addCacheEntry(cacheKey, rsp);
			req.rsp = rsp;
			next();
			break;
		// end default
	}
})

module.exports = router;
