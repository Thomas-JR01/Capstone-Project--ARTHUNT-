const {MongoClient, ObjectId} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

const DBHelper = require('./database-helper');
const helper = require('../helper');

// Creates a new event given some data and some settings
async function createEvent(eventData, eventSettings) {
	let newEvent;
	return DBHelper.getValueForNextSequence('events')
	.then((next_id) => {
		newEvent = {
			_id: next_id,
			name: eventData.name,
			city: eventData.city,
			base_lat: helper.getCityLat(eventData.city),
			base_long: helper.getCityLong(eventData.city),
			coordinator: {
				name: eventData.coordinator_name,
				contact: eventData.coordinator_contact
			},
			settings: eventSettings,
			game_timer: eventData.game_time,
			state: "paused",
			num_questions: eventData.num_questions,
			team_count: 0,
			participant_count: 0
		};
		return client.connect();
	})
	.then(() => {
		return client.db("ArtHuntDB").collection("events").insertOne(newEvent);
	})
	.catch((error) => {
		throw error;
	})

}

// Deletes an event with a given eventID
async function deleteEvent(eventID) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB").collection("events").deleteOne({ _id : eventID });
	})
	.catch ((e) => {
        throw e;
    })
	.finally(() => {
		return client.close();
	})
}

// Gets all of the information associated with an event for a given eventID
async function getEventAllInfo(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.findOne({ _id: eventID })
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})

}

// Gets the coordinator details for a given event ID
async function getEventCoordinatorDetails(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB").
		collection("events").
		findOne({ _id : eventID },
			{projection: {coordinator:1}});
	})
	.then((result) => {
		return result.coordinator;
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the location of a given event ID
async function getEventLocation(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB").
		collection("events").
		findOne({ _id : eventID },
			{projection: {base_lat:1, base_long:1, city:1}});
	})
	.then((result) => {
		return result;
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the event summaries for all events
// Event Summaries = name (String), city (String), state(String), game_timer(Number),
async function getEventSummaries() {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.find({})
		.project({name:1, city:1, state:1, game_timer:1, "settings.round_duration":1, "settings.reset_duration":1});
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

// Gets the game settings for a given eventID
async function getGameSettings(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.findOne({ _id: eventID },
			{projection: {settings:1}});
	})
	.then((result) => {
		return result?.settings;
	})
	.catch((error) => {
		throw error;
	})
}

// Gets whether a given event ID is active and the game timer
async function getGameState(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.findOne({ _id: eventID },
			{projection: {state:1, game_timer:1}});
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})

}

// Gets the name of an event from the ID
async function getNameFromID(eventID) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.findOne({ _id : eventID },
			{projection: {name:1}});
	})
	.then((result) => {
		return(result.name);
	})
	.catch((e) => {
		throw e;
	})

}

// Checks if a given event ID is valid
async function isValidEventID(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.findOne({ _id: eventID })
	})
	.then((result) => {
		return (result !== undefined);
	})
	.catch((error => {
		throw error;
	}))

}

// Reduces the game timer of all active events
async function reduceAllGameTimers() {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.updateMany({ state : "active" },
			{$inc:{game_timer: -1}});
	})
	.catch((e) => {
		throw e;
	})

}

// Sets the game state of an event with event ID to a new state
async function setGameState(eventID, newState) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.updateOne({ _id : eventID }, 
			{$set: {state: newState}});
	})
	.catch((e) => {
		throw e;
	})
}

// Updates the team count and the participant count for an eventID
async function updateTeamAndParticipantCount(eventID, teamCount, participantCount) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.updateOne({ _id: eventID },
			{$inc: {team_count: teamCount, participant_count: participantCount}});
	})
	.catch((e) => {
		throw e;
	})
}

// Gets only the game time left for the event
async function getEventTimeLeft(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.findOne({ _id: eventID },
			{projection: {game_timer:1, 'settings.reset_duration':1}});
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})

}

module.exports.createEvent = createEvent;
module.exports.deleteEvent = deleteEvent;
module.exports.getEventAllInfo = getEventAllInfo;
module.exports.getEventCoordinatorDetails = getEventCoordinatorDetails;
module.exports.getEventLocation = getEventLocation;
module.exports.getEventSummaries = getEventSummaries;
module.exports.getGameSettings = getGameSettings;
module.exports.getGameState = getGameState;
module.exports.getNameFromID = getNameFromID;
module.exports.isValidEventID = isValidEventID;
module.exports.reduceAllGameTimers = reduceAllGameTimers;
module.exports.setGameState = setGameState;
module.exports.updateTeamAndParticipantCount = updateTeamAndParticipantCount;
module.exports.getEventTimeLeft = getEventTimeLeft;
