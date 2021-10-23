var jwt = require('jsonwebtoken');
const eventDBI = require('./database/event-interface');

const authenticate = (req, res, next) => {
    const authField = req.headers.authorization?.split("Bearer ")[1]; // get just the JWT token

	jwt.verify(authField, require('./env').config.jwt.secret, (err, decoded) => {
		if (err) {
			console.log(err.stack)
			res.json({
				status: "error",
				message: err.message
			});
		}
		else {
			req.perm = decoded.perm;
			req.info = decoded;

			if (decoded.perm === "team") {
				const eventID = parseInt(decoded.eventID);

				eventDBI.getGameState(eventID)
				.then((eventState) => {
					if (eventState.state !== "active") {
						res.json({
							status: "error",
							message: "The event is currently not active."
						})
						return
					} 
					else if (eventState.state === "active") {
						next();
					}
				})
			}
			else {
				next();
			}
		}
	});
};

module.exports.authenticate = authenticate;
