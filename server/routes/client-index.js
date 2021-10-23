var express = require('express');
var router = express.Router();

const clientLogin = require('./client_api/login-route');
const clientRegister = require('./client_api/register-route');
const getCoordinator = require('./client_api/coordinator-route');
const getEventLocation = require('./client_api/event_location-route');
const getEventTime = require('./client_api/event_time-route');
const getImages = require('./client_api/images-route');
const getLocations = require('./client_api/locations-route');
const getMessages = require('./client_api/messages-route');
const getPoints = require('./client_api/leaderboard-route');
const getSiteInfo = require('./client_api/site_info-route');
const getSitesInfo = require('./client_api/sites_info-route');
const getSites = require('./client_api/sites-route');
const getTeamData = require('./client_api/team_details-route');
const getTeamLocations = require('./client_api/team_locations-route');
const getName = require('./client_api/id_to_name-route');
const joinStrat = require('./client_api/join_strategy-route');
const leaveStrat = require('./client_api/leave_strategy-route');
const listParticipants = require('./client_api/participants-route');
const listStrategies = require('./client_api/strategies-route');
const sendImage = require('./client_api/save_image-route');
const sendMessage = require('./client_api/send_message-route');
const siteAttempt = require('./client_api/site_attempt-route');
const siteVisits = require('./client_api/site_visits-route');
const subscribeMessages = require('./client_api/subscribe_messages-route').router;
const transferPoints = require('./client_api/points-route');

router.use("/coordinator", getCoordinator);
router.use("/event-location", getEventLocation);
router.use("/event-time", getEventTime);
router.use("/id-to-name", getName);
router.use("/images", getImages);
router.use("/join-strategy", joinStrat)
router.use("/leaderboard", getPoints);
router.use("/leave-strategy", leaveStrat);
router.use("/locations", getLocations);
router.use("/login", clientLogin);
router.use("/messages", getMessages);
router.use("/participants", listParticipants);
router.use("/points", transferPoints);
router.use("/register", clientRegister)
router.use("/save-image", sendImage);
router.use("/send-message", sendMessage);
router.use("/sites", getSites);
router.use("/site-attempt", siteAttempt);
router.use("/site-info", getSiteInfo);
router.use("/sites-info", getSitesInfo);
router.use("/site-visits", siteVisits);
router.use("/strategies", listStrategies);
router.use("/subscribe-messages", subscribeMessages)
router.use("/team-details", getTeamData);
router.use("/team-locations", getTeamLocations);


module.exports = router;
