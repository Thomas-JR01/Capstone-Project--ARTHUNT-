const eventDBI = require('../database/event-interface');
const eventSiteDBI = require('../database/event_site-interface');
const pointsHistoryDBI = require('../database/points_history-interface');
const strategyDBI = require('../database/strategy-interface');
const strategyTemplateDBI = require('../database/strategy_template-interface');
const teamDBI = require('../database/team-interface');

// Initialises the server game logic
function init() {
	setInterval(main, 1000);
}

// A function that runs every second to update all active events
async function main() {
	let startTick = Date.now();
	eventDBI.reduceAllGameTimers()
	.then((reduced) => {
		require('../logging').singleLogData('main', reduced);
	})
	await eventDBI.getEventSummaries()
	.then((eventList) => {
		require('../logging').singleLogData('main', eventList);
		eventList.forEach((event) => {
			if ((event.state === "active") && (event.game_timer % event.settings.round_duration === 0)) {
				updateEvent(event._id);
			}
			if ((event.state === "active") && (event.game_timer % event.settings.reset_duration === 0)) {
				resetEventSites(event._id);
			}
		})
	})
	.catch((error) => {
		require('../logging').singleLogData('main', error);
		console.log(error.stack);
	})
	let endTick = Date.now();
	if (require('../env').config.debug.tick_timing) {
		console.log(`Tick took: ${endTick-startTick} ms`);
	}
}

function evaluateStrategies(eventID) {
	strategyDBI.listAllStrategies(eventID)
	.then((strategies) => {
		require('../logging').singleLogData('main', strategies);
		return Promise.all(strategies.map((strat) => {
			return strategyTemplateDBI.getStratInfo(strat.strategy_id);
		}));
	})
	.then((stratInfos) => {
		require('../logging').singleLogData('main', stratInfos);
		stratInfos.forEach((strat) => {
			require(`../${strat.code_file}`).main(eventID);
		})
	})
}

async function resetEventSites(eventID) {
	let sitePointThreshold = 0;

	eventDBI.getGameSettings(eventID)
	.then((eventSettings) => {
		require('../logging').singleLogData('main', eventSettings);
		sitePointThreshold = eventSettings.site_points.total_amt;
		defaultGrowthRate = eventSettings.growth_rate;
		return eventSiteDBI.getSitesSummaryData(eventID)
	})
	.then((eventSites) => {
		require('../logging').singleLogData('main', eventSites);
		eventSites.forEach((site) => {
			if (site.total_points < sitePointThreshold) {
				eventSiteDBI.setSitePoints(eventID, site.site_num, sitePointThreshold, defaultGrowthRate)
				.then((setPoints) => {
					require('../logging').singleLogData('main', setPoints);
				})
			} else {
				let incRandom = parseFloat((Math.random()-0.4).toFixed(4)); // from -0.4 to 0.6
				eventSiteDBI.incrementSiteGrowthRate(eventID, site.site_num, incRandom)
				.then((setRate) => {
					require('../logging').singleLogData('main', setRate);
				})
			}
		})
	})
}

async function updateEvent(eventID) {
	eventSiteDBI.listEventSiteIDs(eventID)
	.then((eventSitesRes) => {
		require('../logging').singleLogData('main', eventSitesRes);
		eventSitesRes.forEach(eventSite => {
			updateSites(eventID, eventSite._id);
		});
	});

	await evaluateStrategies(eventID);

	teamDBI.listTeamIDs(eventID)
	.then((teamIDsRes) => {
		require('../logging').singleLogData('main', teamIDsRes);
		teamIDsRes.forEach(teamID => {
			updateTeams(eventID, teamID._id)
		})
	});
}

async function updateSites(eventID, siteID) {
	let oldValue, newValue;
	let siteNum;
	eventSiteDBI.getSiteNum(eventID, siteID)
	.then((num) => {
		require('../logging').singleLogData('main', num);
		siteNum = num;
		return eventSiteDBI.getSitePointInfo(eventID, siteNum);
	})
	.then((sitePoints) => {
		require('../logging').singleLogData('main', sitePoints);
		oldValue = sitePoints.points.total_amt;
		if (sitePoints.active) {
			newValue = parseFloat(oldValue*(1+(sitePoints.growth_rate/100)).toFixed(4));
			return eventSiteDBI.giveSitePoints(eventID, siteNum, (newValue-oldValue));
		}
	})
	.then((update) => {
		require('../logging').singleLogData('main', update);
	})
}

async function updateTeams(eventID, teamID) {
	let stratPoints;
	let oldGrowthValue, newGrowthValue;

	teamDBI.getTeamStrategy(eventID, teamID)
	.then((teamStrat) => {
		require('../logging').singleLogData('main', teamStrat);
		return strategyTemplateDBI.getStratIDFromName(teamStrat)
	})
	.then((stratID) => {
		require('../logging').singleLogData('main', stratID);
		return strategyDBI.getTeamGains(eventID, stratID);
	})
	.then((gains) => {
		require('../logging').singleLogData('main', gains);
		if (gains === undefined) {
			gains = [];
		}
		gains.forEach((gain) => {
			stratPoints = parseFloat(gain.points_gain.toFixed(4));
			if (gain.team_id === teamID) {
				return teamDBI.sendTeamPoints(eventID, teamID, stratPoints)
				.then((sendPoints) => {
					require('../logging').singleLogData('main', sendPoints);
				})
			}
		})
	})
	.then((sendPoints) => {
		require('../logging').singleLogData('main', sendPoints);
		return teamDBI.getTeamPoints(eventID, teamID);
	})
	.then((teamPoints) => {
		require('../logging').singleLogData('main', teamPoints);
		let pointData = {
			event: eventID,
			team_id: teamID,
			points_diff: stratPoints,
			old_value: teamPoints.points-stratPoints,
			new_value: teamPoints.points,
			reason: "strategy",
			timestamp: new Date()
		};
		return pointsHistoryDBI.createNewPointsHistory(pointData);
	})

	teamDBI.getTeamPoints(eventID, teamID)
	.then((teamPoints) => {
		require('../logging').singleLogData('main', teamPoints);
		oldGrowthValue = teamPoints.points;
		newGrowthValue = parseFloat(oldGrowthValue*(1+(teamPoints.growth_rate/100)).toFixed(4));
		return teamDBI.sendTeamPoints(eventID, teamID, Math.abs(newGrowthValue-oldGrowthValue));
	})
	.then((sendPoints) => {
		require('../logging').singleLogData('main', sendPoints);
		let pointData = {
			event: eventID,
			team_id: teamID,
			points_diff: Math.abs(newGrowthValue-oldGrowthValue),
			old_value: oldGrowthValue,
			new_value: oldGrowthValue+Math.abs(newGrowthValue-oldGrowthValue),
			reason: "growth",
			timestamp: new Date()
		};
		return pointsHistoryDBI.createNewPointsHistory(pointData);
	})
	.then((pointHistory) => {
		require('../logging').singleLogData('main', pointHistory);
	})
}

module.exports.init = init;