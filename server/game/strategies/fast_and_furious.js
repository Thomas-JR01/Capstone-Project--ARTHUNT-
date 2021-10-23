/* STRATEGY SUMMARY
This strategy is the polar opposite of the one before, leading teams to visit as many sites
as possible and only answering a few questions each. This can lead to smaller point totals
quickly, however each individual site will give less points as teams who invoke this strategy
care very little about increasing ratios. 

These teams look at the map for all available sites in their area and attempt to discover
their location quickly(potentially splitting up to locate them), and answer any obvious
questions asked by looking at each art installation briefly. These teams usually have a
higher sites visited ratio than most other strategies, but a comparatively lower points
per site ratio focusing more on the journey than the destination. 

Basic Balancing 
    Sites Visited: High 
    Points Per Site: Low 
    Difficulty: Medium 
    Points Modifier: 100% 
    Strategy Type: High volume, low margin 
    Risk: Medium 
    Reward: Medium 

Implementation 
As teams that employ this strategy care more about the journey than the destination, having
a simple and polished user interface can help in both efficiency and safety. Making sure
the app runs smoothly helps teams with finding nearby sites and reduces the amount of time
each team member needs to look at their phone. This is vitally important as these teams will
be rushing from site to site as quickly as possible, and we need to make sure they are watching
when they walk as much as possible to avoid dangerous situations. 

This should mean that teams find their way to the sites as quickly and safely as possible
which fits with the competitive and potential athletic teams taking up this strategy.
*/

// SIMPLIFIED CALCULATION
// best 'site_visit/points' ratio

const locationHistoryDBI = require('../../database/location_history-interface');
const pointsHistoryDBI = require('../../database/points_history-interface');
const strategyDBI = require('../../database/strategy-interface');
const strategyTemplateDBI = require('../../database/strategy_template-interface');

function main(eventID) {
	let followers = [];
	let stratID;
	let basePoints;

	let logData = ['strategy_F&F'];

	strategyTemplateDBI.getStratIDFromName("Fast and Furious")
	.then((strategyID) => {
		logData.push(strategyID);
		stratID = strategyID;
		return strategyTemplateDBI.getStratInfo(stratID);
	})
	.then((stratInfo) => {
		logData.push(stratInfo);
		basePoints = stratInfo.point_gain;
		return strategyDBI.getTeamGains(eventID, stratID);
	})
	.then((gains) => {
		logData.push(gains);
		followers = gains.map((gain) => {
			return {
				team_id: gain.team_id,
				visit_count: 0,
				points_earned: 0,
				calculation: 0
			};
		});
		return Promise.all(followers.map((follower) => {
			return locationHistoryDBI.getVisitHistoryOverMinutes(eventID, follower.team_id, 10);
		}));
	})
	.then((locations) => {
		logData.push(locations);
		followers.map((follower, index) => {
			follower.visit_count = locations[index].length;
		})
		return Promise.all(followers.map((follower) => {
			return pointsHistoryDBI.getVisitPointsHistoryOverMinutes(eventID, follower.team_id, 10);
		}))
	})
	.then((points) => {
		logData.push(points);
		return followers.map((follower, index) => {
			let total = 0;
			points[index].map((point) => {
				total += point.points_diff;
			});
			follower.points_earned = total;
			follower.calculation = follower.visit_count / follower.points_earned;
		});
	})
	.then((calcs) => {
		logData.push(calcs);
		followers.sort((a, b) => {a.calculation-b.calculation});
		let update = followers.map((follower, index) => {
			return {
				team_id: follower.team_id,
				points_gain: basePoints*Math.pow(0.75, index)
			}
		})
		return strategyDBI.updateGains(eventID, stratID, update);
	})
	.then((updateGains) => {
		logData.push(updateGains);
		require('../../logging').singleLogData('strategy', logData);
	})
	.catch((error) => {
		logData.push(error);
		require('../../logging').singleLogData('strategy', logData);
		console.log(error.stack);
	})
}

module.exports.main = main;