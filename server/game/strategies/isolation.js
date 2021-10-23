/* STRATEGY SUMMARY
This strategy involves splitting from the other teams from the beginning in an attempt to
secure an area of sites that other teams are unlikely to visit themselves. Since sites have
reduced point totals after it has been attempted, this strategy tries to only hit sites
that haven’t been attempted in order to maximise point earnings. 

While it might seem obvious to want to get away from other teams as quickly as possible, we
want to prevent it from becoming too lucrative as we dont want every game to involve groups
from always moving away from each other. This is because the map itself is quite large and
there can be benefits to staying near other teams, opening up strategic opportunities. 

We can do this by making this strategy not as valuable by lowering far off site values or
spreading out sites around the outside of the map. Either way, the size of the playing field
is already large and with each game usually having low amounts of teams, this strategy will
likely happen on its own. 

Basic Balancing 
    Sites Visited: Average 
    Points Per Site: Average 
    Difficulty: Low 
    Points Modifier: 100% 
    Strategy Type: Cluster of sites over individual 
    Risk: Low 
    Reward: Medium 

Implementation 
Since isolated places already have a higher increase ratio than clumped up spaces, this kind
of strategy is already viable. Once the team is properly isolated, they can choose to visit
sites and answer questions at their own pace, and swap to another base strategy if they like.
This strategy is more for teams who like to go at it their own way and who want to avoid
attempting a site that a team has previously visited.  

A way to properly measure the effectiveness of this site, a heat map showing the different
teams and what sites they visited would help in showing the effectiveness of teams based
on proximity. This will help us measure the distance away from other teams and how isolated
teams compare. 
*/

// SIMPLIFIED CALCULATION
// distance_from_centre / points


const eventDBI = require('../../database/event-interface');
const locationHistoryDBI = require('../../database/location_history-interface');
const pointsHistoryDBI = require('../../database/points_history-interface');
const strategyDBI = require('../../database/strategy-interface');
const strategyTemplateDBI = require('../../database/strategy_template-interface');

const helper = require('../../helper');

function main(eventID) {
	let followers = [];
	let stratID;
	let basePoints;
	let eventCentre;

	let logData = ['strategy_ISO'];

	eventDBI.getEventLocation(eventID)
	.then((eventLocation) => {
		logData.push(eventLocation);
		eventCentre = {lat: eventLocation.base_lat, long: eventLocation.base_long};
		return strategyTemplateDBI.getStratIDFromName("Isolation");
	})
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
				distance_from_centre: 0,
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
			let total = 0;
			locations[index].forEach((location) => {
				total += helper.getDistBetweenCoords(eventCentre, location.new_value)
			});
			follower.distance_from_centre = total;
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
			follower.calculation = follower.distance_from_centre / follower.points_earned;
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