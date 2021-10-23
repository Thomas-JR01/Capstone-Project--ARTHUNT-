const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

// Gets the messages for the all chat for an event
async function getAllChatMessages(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("messages")
		.find({ event: eventID, recipient_id: 0 })
        .sort({timestamp:-1})
        .limit(50)
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

async function getTeamToRecipientMessages(eventID, teamID, recipientID) {
    return client.connect()
    .then(() => {
        return client.db("ArtHuntDB")
        .collection("messages")
        .find({$or: [{event: eventID, sender_id: teamID, recipient_id: recipientID}, {event: eventID, sender_id: recipientID, recipient_id: teamID}]})
        .sort({timestamp:-1})
        .limit(50)
    })
    .then((cursor) => {
        return cursor.toArray();
    })
    .then((results) => {
        return results;
    })
    .catch((e) => {
        throw e
    })
}

async function getAdminToRecipientMessages(eventID, recipientID) {
    return client.connect()
    .then(() => {
        return client.db("ArtHuntDB")
        .collection("messages")
        .find({$or: [{event: eventID, sender_id: -eventID, recipient_id: recipientID}, {event: eventID, sender_id: recipientID, recipient_id: -eventID}]})
        .sort({timestamp:-1})
        .limit(50)
    })
    .then((cursor) => {
        return cursor.toArray();
    })
    .then((results) => {
        return results;
    })
    .catch((e) => {
        throw e
    })
}

async function sendMessage(newMessage) {
    return client.connect()
    .then(() => {
        return client.db("ArtHuntDB")
        .collection("messages")
        .insertOne(newMessage);
    })
    .catch((error) => {
		throw error;
	})

}

module.exports.getAllChatMessages = getAllChatMessages;
module.exports.getTeamToRecipientMessages = getTeamToRecipientMessages;
module.exports.getAdminToRecipientMessages = getAdminToRecipientMessages;
module.exports.sendMessage = sendMessage;