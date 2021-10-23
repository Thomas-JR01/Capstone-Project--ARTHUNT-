const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

// Saves a log of the response to the database
async function saveLog(data) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB").collection("logging").insertOne(data);
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})

}

module.exports.saveLog = saveLog;