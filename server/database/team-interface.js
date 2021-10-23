const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

const DBHelper = require('./database-helper');

// Creates a new team for a given event
async function createNewTeam(eventID, teamName, teamContact, teamPIN, teamMembers, pointSettings) {
	let newTeam = {};
	
	return DBHelper.getValueForNextSequence("teams")
	.then((next_id) => {
		newTeam = {
			_id: next_id,
			event: eventID,
			name: teamName,
			contact: teamContact,
			pin: teamPIN,
			members: teamMembers,
			strategy_selected: "",
			points: pointSettings.default_points,
			growth_rate: pointSettings.growth_rate,
			team_lat: 0,
			team_long: 0
		};
		return client.connect();
	})
	.then(() => {
		return client.db("ArtHuntDB").collection("teams").insertOne(newTeam);
	})
	.catch((error) => {
		throw error;
	})

}

// Gets all the team names and IDs for teams in a given eventID
async function getAllTeamNames(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.find({ event: eventID })
		.project({ name:1 });
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results;
	})
	.catch((e) => {
		throw e;
	})
}

// Gets the detailed info for all teams in a given eventID
async function getAllTeamsDetailedInfo(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.find({ event: eventID });
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results;
	})
	.catch((e) => {
		throw e;
	})

}

// Gets all of the team points for a given event ID
async function getAllTeamsPoints(eventID) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.find({ event: eventID })
		.project({name:1, points:1});
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return(results);
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the name of a team in eventID from the teamID
async function getIDFromName(eventID, teamName) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.findOne({ event: eventID, name: teamName },
			{projection: {_id:1}});
	})
	.then((result) => {
		return result?._id;
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the location of the teamID in eventID
async function getIndividualTeamLocation(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.findOne({ event: eventID, _id: teamID },
			{projection: {team_lat:1, team_long:1}})
	})
	.then((result) => {
		return result;
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the name of a team from the teamID
async function getNameFromID(teamID) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.findOne({ _id: teamID },
			{projection: {name:1}});
	})
	.then((result) => {
		return result?.name;
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the locations of all of the teams in eventID
async function getTeamLocations(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.find({ event: eventID })
		.project({team_lat:1, team_long:1})
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((result) => {
		return result;
	})
	.catch((e) => {
		throw e;
	})

}

// Gets all of the team members for a given teamID in eventID
async function getTeamParticpants(eventID,  teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.findOne({ _id: teamID, event: eventID },
			{projection: {members:1}});
	})
	.then((result) => {
		return result?.members;
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the teamID's (for a given eventID) PIN hash 
async function getTeamPINHash(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.findOne({ event: eventID, _id: teamID },
			{projection: {pin:1}});
	})
	.then((result) => {
		return result?.pin;
	})
	.catch((error) => {
		throw error;
	})

}

// Gets the team points for a given team ID in event ID
async function getTeamPoints(eventID, teamID) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.findOne({ event : eventID, _id : teamID }, 
			{projection: {points:1, name:1, growth_rate:1}})
	})
	.then((result) => {
		return(result);
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the team's strategy for a given teamID in eventID
async function getTeamStrategy(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.findOne({ event: eventID, _id: teamID },
			{projection: {strategy_selected:1}});
	})
	.then((result) => {
		return result?.strategy_selected;
	})
	.catch((error) => {
		throw error;
	})

}

// Checks to see if the team ID for a given eventID is valid
async function isValidTeamID(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.findOne({ event: eventID, _id: teamID });
	})
	.then((result) => {
		return (result !== undefined);
	})
	.catch((error) => {
		throw error;
	})

}

// Lists all of the team IDs in an event
async function listTeamIDs(eventID) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.find({ event: eventID })
		.project({_id:1});
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

// Sends points to a team in eventID
async function sendTeamPoints(eventID, recvTeamID, amtPoints) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.updateOne({event: eventID, _id: recvTeamID},
			{$inc: {points: amtPoints}});
	})
	.catch((e) => {
		throw e;
	})

}

// Sets a new team location for a given teamID in eventID
async function setTeamLocation(eventID, teamID, lat, long) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.updateOne({event: eventID, _id: teamID},
			{$set: {team_lat: lat, team_long: long}})
	})
	.catch((e) => {
		throw e;
	})

}

// Sets a new strategy for a given teamID in eventID
async function setTeamStrategy(eventID, teamID, strategy) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.updateOne({event: eventID, _id: teamID},
			{$set: {strategy_selected: strategy}})
	})
	.catch((e) => {
		throw e;
	})

}

// Transfers the points between two teams for a given eventID
async function transferPoints(eventID, sendTeamID, recvTeamID, amtPoints) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.updateOne({ event : eventID, _id: sendTeamID },
			{$inc: {points: -amtPoints}});
	})
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.updateOne({ event : eventID, _id : recvTeamID },
			{$inc: {points: amtPoints}});
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the detailed info for the teamID in a given eventID
async function getTeamDetailedInfo(teamID, eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("teams")
		.findOne({ event: eventID, _id: teamID },
			{projection: {name:1, points:1, strategy_selected:1, contact:1}}
		);
	})
	.then((results) => {
		return results;
	})
	.catch((e) => {
		throw e;
	})

}

module.exports.createNewTeam = createNewTeam;
module.exports.getAllTeamNames = getAllTeamNames;
module.exports.getAllTeamsDetailedInfo = getAllTeamsDetailedInfo;
module.exports.getAllTeamsPoints = getAllTeamsPoints;
module.exports.getNameFromID = getNameFromID;
module.exports.getIDFromName = getIDFromName;
module.exports.getIndividualTeamLocation = getIndividualTeamLocation;
module.exports.getTeamLocations = getTeamLocations;
module.exports.getTeamParticpants = getTeamParticpants;
module.exports.getTeamPINHash = getTeamPINHash;
module.exports.getTeamPoints = getTeamPoints;
module.exports.getTeamStrategy = getTeamStrategy;
module.exports.isValidTeamID = isValidTeamID;
module.exports.listTeamIDs = listTeamIDs;
module.exports.sendTeamPoints = sendTeamPoints;
module.exports.setTeamLocation = setTeamLocation;
module.exports.setTeamStrategy = setTeamStrategy;
module.exports.transferPoints = transferPoints;
module.exports.getTeamDetailedInfo = getTeamDetailedInfo;
