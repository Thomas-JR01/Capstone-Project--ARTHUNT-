const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

const DBHelper = require('./database-helper');

// Creates all of the event sites for an event
async function createEventSites(eventID, eventLocation) {
	let eventSettings, eventSiteInsert = [];
	let totalNum = 10;

	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("events")
		.findOne({_id: eventID},
			{projection: {settings:1, num_questions:1}})
	})
	.then((settingsResult) => {
		eventSettings = settingsResult.settings;
		totalNum = settingsResult.num_questions;
		return client.db("ArtHuntDB")
		.collection("site_template")
		.find({ active: true, location: eventLocation })
		.project({title:1, theme:1, closeup:1, artist:1, year: 1})
	})
	.then((siteTemplateResult) => {
		return siteTemplateResult.toArray();
	})
	.then((sites) => {
		sites.forEach((site, i) => {
			eventSiteInsert[i] = {
				"event": eventID,
				"site_num": i+1,
				"site_id": site._id,
				"active": true,
				"locked": false,
				"depleted": false,
				"notes": site.clue,
				"points": {
					"total_amt": parseFloat(eventSettings.site_points.total_amt),
					"site_pct": parseFloat(eventSettings.site_points.site_pct),
					"title_pct": parseFloat(eventSettings.site_points.title_pct),
					"theme_pct": parseFloat(eventSettings.site_points.theme_pct),
					"closeup_pct": parseFloat(eventSettings.site_points.closeup_pct),
					"artist_pct": parseFloat(eventSettings.site_points.artist_pct),
					"year_pct": parseFloat(eventSettings.site_points.year_pct)
				},
				"adjustment_factor": eventSettings.adjustment_factor,
				"visits": 0,
				"choices": {
					"title": DBHelper.randChoices(sites.map(site => site.title), i, totalNum),
					"theme": DBHelper.randChoices(sites.map(site => site.theme), i, totalNum),
					"closeup": DBHelper.randChoices(sites.map(site => site.closeup), i, totalNum),
					"artist": DBHelper.randChoices(sites.map(site => site.artist), i, totalNum),
					"year": DBHelper.randChoices(sites.map(site => site.year), i, totalNum),
				},
				"growth_rate": eventSettings.growth_rate
			};
		})

		return eventSiteInsert;
	})
	.then(() => {
		return client.db("ArtHuntDB").collection("event_site").insertMany(eventSiteInsert);
	})
	.catch((error) => {
		throw error;
	})

}

// Deletes the event sites for a given event ID
async function deleteEventSites(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB").collection("event_site").deleteMany({ event : eventID });
	})
	.catch((error) => {
		throw error;
	})
}

// Gets detailed event site data from a given event ID and a specific site number
// Detailed Data = site number (Number), points (Object<Number>), choices (Object<Array>) & site ID (ObjectId)
async function getSiteDetailedData(eventID, siteNum) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.findOne({ event: eventID, site_num: siteNum },
			{projection: {site_num:1, points:1, choices:1, site_id:1, active:1, growth_rate:1, locked:1}});
		})
	.then((results) => {
		return results;
	})
	.catch((error) => {
		throw error;
	})

}

// Returns the site ID (ObjectId) for a given event ID and siteNum
async function getSiteID(eventID, siteNum) {
	return client.connect()
	.then(() => {
		return client.db("ArtHunt")
		.collection("event_site")
		.findOne({ event: eventID, site_num: siteNum },
			{projection: {site_id:1}});
	})
	.then((result) => {
		return result?.site_id;
	})
	.catch((error) => {
		throw error;
	})
}

// Returns the siteNum for a given event ID and eventSiteID
async function getSiteNum(eventID, eventSiteID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.findOne({ event: eventID, _id: eventSiteID },
			{projection: {site_num:1}});
	})
	.then((result) => {
		return result?.site_num;
	})
	.catch((error) => {
		throw error;
	})
}

// Gets the points info of the event points info for a given siteNum
async function getSitePointInfo(eventID, siteNum) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.findOne({ event : eventID, site_num: siteNum },
			{projection: { points:1, growth_rate:1, active:1 }});
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})
}

// Gets a summary of all of the event sites' summary data from a given event ID
// Summary Data = site_id site number (Number), active (Boolean), total points (Number), growth rate (Number), lock state (Boolean)
async function getSitesSummaryData(eventID) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.find({ event : eventID })
		.project({ site_id:1, site_num:1, active:1, 'points.total_amt':1, growth_rate:1, locked:1 });
	})
	.then((cursor) => {
		return cursor.toArray();
	})
	.then((results) => {
		return results.map((result) => {
			return {
				site_id: result.site_id,
				site_num: result.site_num,
				active: result.active,
				total_points: result.points.total_amt,
				growth_factor: result.growth_rate,
				locked: result.locked
			};
		});
	})
	.catch((error) => {
		throw error;
	})
}

// Gives the points gained/lost from a site visit for a given eventID and site number
async function giveSitePoints(eventID, siteNum, pointsGained) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.updateOne({ event: eventID, site_num: siteNum },
			{$inc: {"points.total_amt": pointsGained}});
	})
	.catch((error) => {
		throw error;
	})
}

// Increments the site growth rate by an amount for a given event ID and site number
async function incrementSiteGrowthRate(eventID, siteNum, growthRateInc) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.updateOne({ event: eventID, site_num: siteNum },
			{$inc: {growth_rate: growthRateInc}});
	})
	.catch((error) => {
		throw error;
	})
}

// Increments the site visit counter by 1 for a given event ID and site number
async function incrementSiteVisit(eventID, siteNum) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.updateOne({ event: eventID, site_num: siteNum },
			{$inc: {visits: 1}});
	})
	.catch((error) => {
		throw error;
	})
}

// Checks to see if the event site provided is valid
async function isValidEventSite(eventID, siteNum) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.findOne({ event: eventID, site_num: siteNum });
	})
	.then((result) => {
		return (result !== undefined);
	})
	.catch((error) => {
		throw error;
	})

}

// Checks to see if the event site provided is unlocked
async function isEventSiteUnlocked(eventID, siteNum) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.findOne({ event: eventID, site_num: siteNum, locked: false });
	})
	.then((result) => {
		return (result !== undefined);
	})
	.catch((error) => {
		throw error;
	})

}

// Lists all of the event site IDs in an event
async function listEventSiteIDs(eventID) {
    return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
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

// Sets the lock of an event site for a given event ID and siteNum to a state
async function setLockEventSite(eventID, siteNum, state) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.updateOne({ event: eventID, site_num: siteNum },
			{$set: {locked: state}});
	})
	.catch((error) => {
		throw error;
	})
}

// Sets the points of a given eventID and site number
async function setSitePoints(eventID, siteNum, setPoints, setGrowthRate) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.updateOne({ event: eventID, site_num: siteNum },
			{$set: {"points.total_amt": setPoints, growth_rate: setGrowthRate}});
	})
	.catch((error) => {
		throw error;
	})
}

// 
async function updateEventSite(eventID, siteNum, active, locked, totalPoints, siteGrowth) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("event_site")
		.updateOne({ event: eventID, site_num: siteNum },
			{$set: {active: active, locked: locked, 'points.total_amt': totalPoints, growth_rate: siteGrowth}});
	})
	.catch((error) => {
		throw error;
	})

}

module.exports.createEventSites = createEventSites;
module.exports.deleteEventSites = deleteEventSites;
module.exports.getSiteDetailedData = getSiteDetailedData;
module.exports.getSiteID = getSiteID;
module.exports.getSiteNum = getSiteNum;
module.exports.getSitePointInfo = getSitePointInfo;
module.exports.getSitesSummaryData = getSitesSummaryData;
module.exports.giveSitePoints = giveSitePoints;
module.exports.incrementSiteGrowthRate = incrementSiteGrowthRate;
module.exports.incrementSiteVisit = incrementSiteVisit;
module.exports.isEventSiteUnlocked = isEventSiteUnlocked;
module.exports.isValidEventSite = isValidEventSite;
module.exports.listEventSiteIDs = listEventSiteIDs;
module.exports.setLockEventSite = setLockEventSite;
module.exports.setSitePoints = setSitePoints;
module.exports.updateEventSite = updateEventSite;