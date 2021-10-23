const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

// Gets the strategyID from the strategyName
async function getStratIDFromName(strategyName) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("strategy_template")
		.findOne({name: strategyName},
			{projection: {_id:1}})
	})
	.then((result) => {
		return (result?._id)
	})
	.catch((error) => {
		throw error;
	})
}

// Gets all of the information for a given strategyID
async function getStratInfo(strategyID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("strategy_template")
		.findOne({_id: strategyID})
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})

}

// Checks to see if the strategy name is valid
async function isValidStrategyName(strategyName) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("strategy_template")
		.findOne({ name: strategyName });
	})
	.then((result) => {
		return (result !== undefined);
	})
	.catch((error) => {
		throw error;
	})

}


module.exports.getStratIDFromName = getStratIDFromName;
module.exports.getStratInfo = getStratInfo;
module.exports.isValidStrategyName = isValidStrategyName;