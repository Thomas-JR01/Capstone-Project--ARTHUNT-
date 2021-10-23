const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

// Creates a new point history entry in the database
async function createNewPointsHistory(historyInsert) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("points_history").insertOne(historyInsert);
	})
	.catch((error) => {
		throw error;
	})
}

// Returns the site's growth rate log history for a teamID in eventID
async function getTeamVisitSiteGrowthRate(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("points_history")
		.find({event: eventID, team_id: teamID, reason: "site-growth_rate-log"})
		.project({new_value:1, points_diff:1, timestamp:1})
		.sort({timestamp:1});
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results;
	})
	.catch((error) => {
		throw error;
	})
}

// Returns the growth point history for a teamID in eventID
async function getTeamGrowthPoints(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("points_history")
		.find({event: eventID, team_id: teamID, reason: "growth"})
		.project({new_value:1, points_diff:1, timestamp:1})
		.sort({timestamp:1});
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results;
	})
	.catch((error) => {
		throw error;
	})
}

// Returns the team site point history for a teamID in eventID
async function getTeamSitePoints(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("points_history")
		.find({event: eventID, team_id: teamID, reason: "visit"})
		.project({new_value:1, points_diff:1, timestamp:1})
		.sort({timestamp:1});
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results;
	})
	.catch((error) => {
		throw error;
	})
}

// Returns the strategy point history for a teamID in eventID
async function getTeamStrategyPoints(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("points_history")
		.find({event: eventID, team_id: teamID, reason: "strategy"})
		.project({new_value:1, points_diff:1, timestamp:1})
		.sort({timestamp:1});
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results;
	})
	.catch((error) => {
		throw error;
	})
}

// Returns all the history for a teamID in eventID
async function getTeamTotalPoints(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("points_history")
		.find({event: eventID, team_id: teamID, reason: {$ne: "site-growth_rate-log"}})
		.project({new_value:1, points_diff:1, timestamp:1})
		.sort({timestamp:1});
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results;
	})
	.catch((error) => {
		throw error;
	})
}

// Returns the team transfer point history for a teamID in eventID
async function getTeamTransferPoints(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("points_history")
		.find({event: eventID, team_id: teamID, reason: "transfer"})
		.project({new_value:1, points_diff:1, timestamp:1})
		.sort({timestamp:1});
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results;
	})
	.catch((error) => {
		throw error;
	})
}

// Returns the team site point history for a teamID in eventID
async function getVisitPointsHistoryOverMinutes(eventID, teamID, minutes) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("points_history")
		.find({event: eventID, team_id: teamID, reason: "visit",
		timestamp: {$gte: (new Date(new Date().getTime()-minutes*60*1000))}})
		.project({new_value:1, points_diff:1, timestamp:1})
		.sort({timestamp:1});
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results;
	})
	.catch((error) => {
		throw error;
	})
}

module.exports.createNewPointsHistory = createNewPointsHistory;
module.exports.getTeamVisitSiteGrowthRate = getTeamVisitSiteGrowthRate;
module.exports.getTeamGrowthPoints = getTeamGrowthPoints;
module.exports.getTeamSitePoints = getTeamSitePoints;
module.exports.getTeamStrategyPoints = getTeamStrategyPoints;
module.exports.getTeamTotalPoints = getTeamTotalPoints;
module.exports.getTeamTransferPoints = getTeamTransferPoints;
module.exports.getVisitPointsHistoryOverMinutes = getVisitPointsHistoryOverMinutes;