const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

// Approves a site visit for eventID at siteNum with mark
async function approveSiteVisit(eventID, siteNum, members) {
	return client.connect()
	.then(() => {
		// if members === 0 (rejected), set site_amt to 0
		if (members === 0) {
			return client.db("ArtHuntDB").
			collection("site_visit")
			.findOneAndUpdate({ event: eventID, site_num: siteNum },
				{$set: {marked: true, 'points_earned.site_amt': 0}},
				{sort: {_id: -1}});
		}
		else {
			return client.db("ArtHuntDB")
			.collection("site_visit")
			.findOneAndUpdate({ event: eventID, site_num: siteNum },
				{$set: {marked: true}},
				{sort: {_id: -1}});
		}
	})
	.catch((e) => {
		throw e;
	})

} 

// Create a new site visit in the database
async function createSiteVisit(newVisit) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB").collection("site_visit").insertOne(newVisit);
	})
	.catch((error) => {
		throw error;
	})

}

// Gets all of the site visits for a given eventID
async function getAllSiteVisits(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_visit")
		.find({ event: eventID });
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return(results);
	})
	.catch((error) => {
		throw error;
	})

}

// Get the latest site visit for a given event ID and siteNum
async function getLatestSiteVisit(eventID, siteNum) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_visit")
		.find({ event: eventID, site_num: siteNum })
		.sort({_id: -1}).limit(1).next();
	})
	.then((result) => {
		return result;
	})
	.catch((e) => {
		throw e;
	})

}

// Gets the site visits made by team with teamID in eventID
async function getTeamSiteVisits(eventID, teamID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_visit")
		.find({ event: eventID, team_sent: teamID });
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

// Checks to see if there is an active site visit
async function isValidActiveSiteVisit(eventID, siteNum) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("site_visit")
		.findOne({ event: eventID, site_num: siteNum, marked: false });
	})
	.then((result) => {
		return (result !== undefined);
	})
	.catch((error) => {
		throw error;
	})

}

module.exports.approveSiteVisit = approveSiteVisit;
module.exports.createSiteVisit = createSiteVisit;
module.exports.getAllSiteVisits = getAllSiteVisits;
module.exports.getLatestSiteVisit = getLatestSiteVisit;
module.exports.getTeamSiteVisits = getTeamSiteVisits;
module.exports.isValidActiveSiteVisit = isValidActiveSiteVisit;