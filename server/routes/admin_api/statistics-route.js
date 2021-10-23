var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const pointsHistoryDBI = require('../../database/points_history-interface');
const teamsDBI = require('../../database/team-interface');

const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'admin-api/statistics/' page
/* Success Summary:
[{
	team_name: String,
	final_summary: {
		total: Number,
		sites: Number,
		strategy: Number,
		growth: Number,
		transfer: Number
	},
	total: Array<Object(timestamp:Date, new_value:Number, points_diff:Number)>,
	sites: Array<Object(timestamp:Date, new_value:Number, points_diff:Number)>,
	strategy: Array<Object(timestamp:Date, new_value:Number, points_diff:Number)>,
	growth: Array<Object(timestamp:Date, new_value:Number, points_diff:Number)>,
	transfer: Array<Object(timestamp:Date, new_value:Number, points_diff:Number)>
}, ...]
*/
router.get('/:event_id', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	const cacheKey = `${req.baseUrl}_${eventID}`;

	req['mongo'] = ['admin-api/statistics/'];

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
		return teamsDBI.getAllTeamNames(eventID)
	})
	.then((teamNames) => {
		req.mongo.push(teamNames);
		return Promise.all(teamNames.map(async (team) => {
			let totalPoints = await pointsHistoryDBI.getTeamTotalPoints(eventID, team._id);
			let sitePoints = await pointsHistoryDBI.getTeamSitePoints(eventID, team._id, "visit");
			let stratPoints = await pointsHistoryDBI.getTeamStrategyPoints(eventID, team._id, "strategy");
			let growthPoints = await pointsHistoryDBI.getTeamGrowthPoints(eventID, team._id, "growth");
			let transferPoints = await pointsHistoryDBI.getTeamTransferPoints(eventID, team._id, "transfer");
			return {
				team_id: team._id,
				team_name: team.name,
				final_summary: {
					total: totalDiff(totalPoints),
					sites: totalDiff(sitePoints),
					strategy: totalDiff(stratPoints),
					growth: totalDiff(growthPoints),
					transfer: totalDiff(transferPoints),
				},
				total: totalPoints || [],
				sites: sitePoints || [],
				strategy: stratPoints || [],
				growth: growthPoints || [],
				transfer: transferPoints || []
			}
		}));
	})
	.then((stats) => {
		req.mongo.push(stats);
		let rsp = {
			status: "success",
			response: stats
		};
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp, (5*60*1000));
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

function totalDiff(points) {
	let total = 0;
	points.forEach(pts => {
		total += pts.points_diff;
	});
	return total;
}

module.exports = router;
