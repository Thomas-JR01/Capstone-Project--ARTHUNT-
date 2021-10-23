var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const strategyDBI = require('../../database/strategy-interface');
const strategyTemplateDBI = require('../../database/strategy_template-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'admin-api/strategies/' page
/* Success Summary:
[{
name: String,
description: String,
team_gains: Array<Object(team_id: Number, points_gain: Number)>
}, ...]
*/
router.get('/:event_id', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	const cacheKey = `${req.baseUrl}_${eventID}`;
	
	let strats;

	req['mongo'] = ['admin-api/strategies/'];

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
		return strategyDBI.listAllStrategies(eventID);
	})
	.then((strategies) => {
		req.mongo.push(strategies);
		strats = strategies;
		return Promise.all(strategies.map(strat => strategyTemplateDBI.getStratInfo(strat.strategy_id)));
	})
	.then((stratTemplate) => {
		req.mongo.push(stratTemplate);
		return stratTemplate.map((template, i) => ({
			name: template.name,
			description: template.description,
			team_gains: strats[i].team_gains
		}));
	})
	.then((zipped) => {
		req.mongo.push(zipped);
		let rsp = {
			status: "success",
			response: zipped
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
