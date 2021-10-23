/* STRATEGY SUMMARY
This is a long term strategy that rewards players for engaging in the increase rate mechanic.
If players can see which sites have the biggest potential future points total based on these
increase rates, they can map out a path and score some big totals while hitting some smaller
ones as the total rises. This is a more involved strategy than the previous ones and only
the most dedicated players will see it succeed. 

While this strategy is similar to Slow and steady, teams using this strategy dont care as
much about the point total as they do the growth rate. Using this, they can plot out a path
on the map so they can stagger their time by hitting smaller sites before attempting sites
that can grow at a higher rate. 

Basic Balancing 
    Sites Visited: Average 
    Points Per Site: High 
    Difficulty: Medium 
    Points Modifier: 100% 
    Strategy Type: Site ratios, rather than points 
    Risk: Medium 
    Reward: High 

Implementation 
This strategy involves the teams taking advantage of sites with higher growth rate, so
effectively teaching teams about the growth rate, how to see each site's own rate, and how
often the scores increase. This will allow teams using this strategy to know how long they
need to wait to “cash in” their bigger sites while waiting out the time attempting smaller
sites. 

The changes we have made to the map system should be enough information for these teams to
get a good idea of which sites to attempt first. Being able to see all of the basic information
about each site with just one tap will make it far more efficient then having to move through
different menus to do so. 
*/

// SIMPLIFIED CALCULATION
// best 'total_growth_rate / site_visits' ratio

const locationHistoryDBI = require('../../database/location_history-interface');
const pointsHistoryDBI = require('../../database/points_history-interface');
const strategyDBI = require('../../database/strategy-interface');
const strategyTemplateDBI = require('../../database/strategy_template-interface');

function main(eventID) {
	let followers = [];
	let stratID;
	let basePoints;

	let logData = ['strategy_BNo'];

	strategyTemplateDBI.getStratIDFromName("Big Numbers")
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
				total_growth_rate: 0,
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
			return pointsHistoryDBI.getTeamVisitSiteGrowthRate(eventID, follower.team_id, 10);
		}))
	})
	.then((points) => {
		logData.push(points);
		return followers.map((follower, index) => {
			let total = 0;
			points[index].map((point) => {
				total += point.new_value;
			});
			follower.total_growth_rate = total;
			follower.calculation = follower.total_growth_rate / follower.visit_count;
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