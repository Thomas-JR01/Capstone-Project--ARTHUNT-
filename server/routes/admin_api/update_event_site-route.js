var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const eventSiteDBI = require('../../database/event_site-interface');
const auth = require('../../auth').authenticate;

// POST 'admin-api/update-event-site/' page
/* Success Response:
{}
*/
router.post('/:event_id/:site_num', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	let siteNum = parseInt(req.params.site_num);
	let active = req.body.active;
	let locked = req.body.locked;
	let totalPoints = req.body.totalPoints;
	let siteGrowth = req.body.siteGrowth;

	req['mongo'] = ['admin-api/update-event-site/'];
	
	if (!["admin", "superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		res.json({
			status: "error",
			message: "Access Denied"
		});
		return;
	}

	eventDBI.isValidEventID(eventID)
	.then((validEvent) => {
		req.mongo.push(validEvent);
		if (!validEvent) {
			throw "Invalid Event ID";
		}
		return eventSiteDBI.updateEventSite(eventID, siteNum, active, locked, totalPoints, siteGrowth);
	})
	.then((updated) => {
		req.mongo.push(updated);
		let rsp = {
			status: "success",
			response: {}
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
	})
	.catch((error) => {
		console.log(error.stack);
		res.json({
			status: "error",
			message: error
		});
	})
})


module.exports = router;
