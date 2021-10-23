var express = require('express');
var router = express.Router();

const eventDBI = require('../../database/event-interface');
const pointsHistoryDBI = require('../../database/points_history-interface');
const teamDBI = require('../../database/team-interface');
const auth = require('../../auth').authenticate;

// GET 'client-api/points/' page
/* Success Response:
{}
*/
router.post('/transfer/:team_name/:amt_points', auth, function(req, res, next) {
	let eventID = parseInt(req.info.eventID);
	let teamIDSend = parseInt(req.info.teamID);

	let teamIDRecv;
	let teamNameRecv = req.params.team_name;
	let amtPoints = parseInt(req.params.amt_points);

	req['mongo'] = ['client-api/points/'];

	let oldPointsSend, oldPointsRecv;

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

	eventDBI.isValidEventID(eventID)
	.then((validEvent) => {
		req.mongo.push(validEvent);
		if (!validEvent) {
			throw "Invalid Event ID";
		}
		return teamDBI.isValidTeamID(eventID, teamIDSend);
	})
	.then((validTeamIDSend) => {
		req.mongo.push(validTeamIDSend);
		if (!validTeamIDSend) {
			throw "Invalid Team ID (Send)";
		}
		return teamDBI.getTeamPoints(eventID, teamIDSend);
	})
	.then((teamSendPoints) => {
		req.mongo.push(teamSendPoints);
		oldPointsSend = teamSendPoints.points;
		if (amtPoints > teamSendPoints) {
			throw "Not Enough Points to Send";
		}
		if (amtPoints < 0) {
			throw "You can't transfer Negative Points";
		}
		return teamDBI.getIDFromName(eventID, teamNameRecv);
	})
	.then((teamIDRecvRsp) => {
		req.mongo.push(teamIDRecvRsp);
		teamIDRecv = teamIDRecvRsp;
		if (teamIDRecvRsp === undefined) {
			throw "Invalid Team Name (Receive)";
		}
		return teamDBI.getTeamPoints(eventID, teamIDRecvRsp);
	})
	.then((recvPoints) => {
		req.mongo.push(recvPoints);
		oldPointsRecv = recvPoints.points;
		return teamDBI.transferPoints(eventID, teamIDSend, teamIDRecv, amtPoints);
	})
	.then((transfer) => {
		req.mongo.push(transfer);
		let pointData = {
			event: eventID,
			team_id: teamIDSend,
			points_diff: -amtPoints,
			old_value: oldPointsSend,
			new_value: oldPointsSend-amtPoints,
			reason: "transfer",
			timestamp: new Date()
		};
		return pointsHistoryDBI.createNewPointsHistory(pointData);
	})
	.then((newHistorySend) => {
		req.mongo.push(newHistorySend);
		let pointData = {
			event: eventID,
			team_id: teamIDRecv,
			points_diff: amtPoints,
			old_value: oldPointsRecv,
			new_value: oldPointsRecv+amtPoints,
			reason: "transfer",
			timestamp: new Date()
		};
		return pointsHistoryDBI.createNewPointsHistory(pointData);
	})
	.then((newHistoryRecv) => {
		req.mongo.push(newHistoryRecv);
		let rsp = {
			status: "success",
			response: {}
		};
		res.json(rsp);
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
		req.rsp = rsp;
		next();
	})
})

module.exports = router;
