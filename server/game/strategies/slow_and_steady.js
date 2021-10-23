/* STRATEGY SUMMARY
This strategy revolves around travelling longer distances to attempt sites that have a 
higher amount of potential points, and spending more time on each site to answer as many
questions as they can. The upside of this strategy is the higher point count per site,
but the time travelled and time on each site can lead to less points if the questions
aren’t answered correctly. 

A standard game using this method will have teams look at the map and determine the highest
point totals of sites in the vicinity. They then move to these sites and answer as many
questions as possible, potentially using educated guesses for some of the answers. Teams
that use this method will typically have the lowest site visits of any team in the game,
but the highest average point total as well. 

Basic Balancing 
    Sites Visited: Low 
    Points Per Site: High 
    Difficulty: Easy 
    Points Modifier: 100% 
    Strategy Type: Low volume, high margin 
    Risk: Low 
    Reward: High 

Implementation 
Slow and steady is a more basic kind of strategy that needs less balancing than most, with
a 100% point modifier (which is default) participants using this strategy have no advantages/
disadvantages compared with most others. To implement this strategy, we need to make it
easy for teams to assess each site's total value including total number of points, accurate
positioning on the map, and a helpful clue in which to find them. These things are doubly
important for this strategy, as each site is more vital than that of other strategies, so
being able to find the site is one of the most important things to consider for this type
of play. 

Alongside having to find the site, being able to answer the site questions easily is important
also. Since this strategy is about answering as many questions as possible, the questions
need to be properly legible for all team members and submitting answers should be a
painless process.
*/

// SIMPLIFIED CALCULATION
// best 'points/site_visit' ratio

const locationHistoryDBI = require('../../database/location_history-interface');
const pointsHistoryDBI = require('../../database/points_history-interface');
const strategyDBI = require('../../database/strategy-interface');
const strategyTemplateDBI = require('../../database/strategy_template-interface');

function main(eventID) {
	let followers = [];
	let stratID;
	let basePoints;

	let logData = ['strategy_S&S'];

	strategyTemplateDBI.getStratIDFromName("Slow and Steady")
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
			follower.calculation = follower.points_earned / follower.visit_count;
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