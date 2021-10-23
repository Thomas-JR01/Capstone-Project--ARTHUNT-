const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

// Creates all of the event strategies for an event
async function createEventStrategies(eventID) {
	let eventStratInsert = [];

	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("strategy_template")
		.find({ active: true })
	})
	.then((stratTemplateResult) => {
		return stratTemplateResult.toArray();
	})
	.then((strats) => {
		strats.forEach((strat, i) => {
			eventStratInsert[i] = {
				"strategy_id": strat._id,
				"event": eventID,
				"team_gains": []
			};
		})

		return eventStratInsert;
	})
	.then(() => {
		return client.db("ArtHuntDB").collection("event_strategy").insertMany(eventStratInsert);
	})
	.catch((error) => {
		throw error;
	})

}

// Gets the team gains from a specific strategyName in eventID
async function getTeamGains(eventID, strategyID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_strategy")
		.findOne({event: eventID, strategy_id: strategyID},
			{projection: {team_gains:1}})
	})
	.then((result) => {
		return (result?.team_gains);
	})
	.catch((error) => {
		throw error;
	})

}

// Adds a new follower (team) join the strategyID for eventID
async function joinStrategy(eventID, strategyID, newFollower) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_strategy")
		.updateOne({event: eventID, strategy_id: strategyID},
			{$push: {team_gains: newFollower}});
	})
	.catch((error) => {
		throw error;
	})

}

// Removes a teamID from strategyName in eventID
async function leaveStrategy(eventID, strategyID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_strategy")
		.updateOne({event: eventID, strategy_id: strategyID},
			{$pull: { team_gains: {team_id: teamID}}});
	})
	.catch((error) => {
		throw error;
	})

}

// Gets all of the strategies for eventID
async function listAllStrategies(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_strategy")
		.find({event: eventID})
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

// Updates the gains for strategyID in eventID
async function updateGains(eventID, strategyID, update) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_strategy")
		.updateOne({event: eventID, strategy_id: strategyID}, 
			{$set: {team_gains: update}})

	})
}


module.exports.createEventStrategies = createEventStrategies;
module.exports.getTeamGains = getTeamGains;
module.exports.joinStrategy = joinStrategy;
module.exports.leaveStrategy = leaveStrategy;
module.exports.listAllStrategies = listAllStrategies;
module.exports.updateGains = updateGains;