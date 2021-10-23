const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

//--------------

async function getValueForNextSequence(tableName) {

    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB").collection("meta").updateOne({ collection: tableName }, { $inc: {sequence_value: 1} });
	})
	.then(() => {
		return client.db("ArtHuntDB").collection("meta").find({ collection : tableName });
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results[0].sequence_value;
	})
    .catch((e) => {
        return(e);
    })
}

function randChoices(values, mandatoryIndex, maxChoices) {
	let choices = [values[mandatoryIndex]]
	while (choices.length < maxChoices) {
		let r = Math.floor((Math.random() * values.length-1) + 1)
		if (!choices.includes(values[r])) {
			choices.push(values[r]);
		}
	}
	return require("../helper").shuffle(choices);
}

//---------------

// Make the interface functions public
module.exports.getValueForNextSequence = getValueForNextSequence;
module.exports.randChoices = randChoices;