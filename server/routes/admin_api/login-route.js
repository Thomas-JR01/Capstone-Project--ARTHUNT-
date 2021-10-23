var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

const adminUserDBI = require('../../database/admin_user-interface');

// POST 'admin-api/login/' page
/* Success Response:
token: String
*/
router.post('/', async function(req, res, next) {
	let username = req.body.username;
	let providedHash = req.body.password_hash;

	req['mongo'] = ['admin-api/login/'];

	adminUserDBI.getAdminUserPasswordHash(username)
	.then(async (passwordHash) => {
		req.mongo.push(passwordHash);
		if (passwordHash === undefined) {
			throw "Invalid Login";
		}

		let validPassword = await bcrypt.compare(providedHash, passwordHash.password_hash);
		if (!validPassword) {
			throw "Invalid Login";
		}

		// Create JWT Token
		const SECRET_KEY = require('../../env').config.jwt.secret;
		const expiresIn = 60; // seconds
		const expiry = Date.now() + expiresIn * 1000;
		const jwtToken = jwt.sign({username, 'perm':passwordHash.permission, expiry}, SECRET_KEY);

		let rsp = {
			'status': "success",
			'response': jwtToken
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
	})
	.catch((error) => {
		req.mongo.push(error);
		console.log(error.stack);
		let rsp = {
			status: "error",
			message: error
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
	})
})


module.exports = router;
