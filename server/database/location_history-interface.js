const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

// Creates a new location history entry in the database
async function createNewLocationHistory(historyInsert) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB").collection("location_history").insertOne(historyInsert);
	})
	.catch((error) => {
		throw error;
	})

}

// Returns the team site visit history for a teamID in eventID
async function getTeamSiteVisits(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("location_history")
		.find({event: eventID, team_id: teamID, reason: "visit"})
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

// Returns the team site visit history for a teamID in eventID from the last 10 minutes
async function getVisitHistoryOverMinutes(eventID, teamID, minutes) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("location_history")
		.find({event: eventID, team_id: teamID, reason: "visit",
		timestamp: {$gte: (new Date(new Date().getTime()-minutes*60*1000))}})
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


module.exports.createNewLocationHistory = createNewLocationHistory;
module.exports.getTeamSiteVisits = getTeamSiteVisits;
module.exports.getVisitHistoryOverMinutes = getVisitHistoryOverMinutes;