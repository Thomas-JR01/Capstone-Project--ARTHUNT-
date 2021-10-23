const {MongoClient, ObjectId} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

// Gets all of the site templates stored in the database
async function getAllSiteTemplates() {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_template")
		.find({});
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

// Gets the site location of an individual siteID
async function getIndividualSiteLocation(siteID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_template")
		.findOne({ _id: siteID },
			{projection: {lat:1, long:1}});
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})

}


// Gets the site's answers for a given site ID
async function getSiteAnswers(siteID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_template")
		.findOne({ _id: siteID },
			{projection: {closeup:1, title:1, artist:1, year:1, theme:1, main_img:1}});
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})

}

// Gets the site hint for a given site ID
async function getSiteHint(siteID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_template")
		.findOne({ _id: siteID }, 
			{projection: {clue:1}})
	})
	.then((result) => {
		return result?.clue;
	})
	.catch((error) => {
		throw error;
	})

}

// Gets the site hint for a given site ID
async function getSiteHintAndLocation(siteID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_template")
		.findOne({ _id: siteID }, 
			{projection: {clue:1, lat:1, long:1}})
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})
}

// Gets the site locations for a given city
async function getSiteLocationsForCity(city) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_template")
		.find({ location: city, active: true })
		.project({lat:1, long:1})
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})

}

// Updates a siteID's site template with updatedData
async function updateSiteTemplate(siteID, updatedData) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB").collection("site_template").replaceOne({ _id: ObjectId(siteID)}, updatedData);//new ObjectId(siteID)
	})
	.catch((e) => {
		throw e;
	})

}

module.exports.getAllSiteTemplates = getAllSiteTemplates;
module.exports.getIndividualSiteLocation = getIndividualSiteLocation;
module.exports.getSiteAnswers = getSiteAnswers;
module.exports.getSiteHint = getSiteHint;
module.exports.getSiteHintAndLocation = getSiteHintAndLocation;
module.exports.getSiteLocationsForCity = getSiteLocationsForCity;
module.exports.updateSiteTemplate = updateSiteTemplate;
