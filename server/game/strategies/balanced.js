/* STRATEGY SUMMARY
This strategy is a mixture of the previous two, going for more sites than the slower one
but going for more points than the faster one. This is a more casual experience for those
who want to have a bit more freedom on which sites they visit and not have to worry about
distance and the amount of points that can be gained. 

Teams who employ this method are usually ones who want to be more flexible and understand
that not all sites are valuable and not all sites have the information they need readily
at hand. As such, they often visit sites and accrue points in the middle of the pack making
the points collecting a bit more manageable. This strategy combines the best of the previous
two, but also requires the same features to be implemented. 

Basic Balancing 
    Sites Visited: Average 
    Points Per Site: Average 
    Difficulty: Low 
    Points Modifier: 100% 
    Strategy Type: Mix of previous 2 
    Risk: Low 
    Reward: Medium 

Implementation 
Since this strategy is based on the previous 2, the infrastructure of this one should be
already set up since there is nothing separating this strategy from them. A usable interface
with all of the appropriate game features is all we will need in order to facilitate teams
success using this strategy.
*/

// SIMPLIFIED CALCULATION
// best 'diff_from_avg_points * diff_from_avg_site_visits'

const locationHistoryDBI = require('../../database/location_history-interface');
const pointsHistoryDBI = require('../../database/points_history-interface');
const strategyDBI = require('../../database/strategy-interface');
const strategyTemplateDBI = require('../../database/strategy_template-interface');

function main(eventID) {
	let followers = [];
	let stratID;
	let basePoints;

	let logData = ['strategy_Bal'];

	strategyTemplateDBI.getStratIDFromName("Balanced")
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
				avg_visit_count: 0,
				avg_points_earned: 0,
				calculation: 0
			};
		});
		return Promise.all(followers.map((follower) => {
			return locationHistoryDBI.getVisitHistoryOverMinutes(eventID, follower.team_id, 10);
		}));
	})
	.then((locations) => {
		logData.push(locations);
		let avgVisitCount = 0;
		followers.map((follower, index) => {
			follower.visit_count = locations[index].length;
			avgVisitCount += locations[index].length;
		})
		avgVisitCount /= followers.length;
		followers.map((follower) => {
			follower.avg_visit_count = avgVisitCount;
		})

		return Promise.all(followers.map((follower) => {
			return pointsHistoryDBI.getVisitPointsHistoryOverMinutes(eventID, follower.team_id, 10);
		}))
	})
	.then((points) => {
		logData.push(points);
		let avgPointsEarned = 0;
		followers.map((follower, index) => {
			let total = 0;
			points[index].map((point) => {
				total += point.points_diff;
			});
			follower.points_earned = total;
			avgPointsEarned += total;
		});
		avgPointsEarned /= followers.length;
		return followers.map((follower, index) => {
			follower.avg_points_earned = avgPointsEarned;

			follower.calculation = Math.abs(follower.points_earned - follower.avg_points_earned) // diff_from_avg_points
									* Math.abs(follower.visit_count - follower.avg_visit_count) // diff_from_avg_visits
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