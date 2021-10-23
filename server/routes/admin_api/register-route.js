var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');

const auth = require('../../auth').authenticate;

const adminUserDBI = require('../../database/admin_user-interface');

// POST 'admin-api/register/' page
/* Success Response:
{}
*/
router.post('/', auth, async function(req, res, next) {
	let adminName = req.body.admin_name;
	let adminPass = req.body.admin_pass;
	let adminRank = req.body.admin_rank;

	req['mongo'] = ['admin-api/register/'];

	if (!["superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		let rsp = {
			status: "error",
			message: "Access Denied"
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
		return;
	}

	adminUserDBI.isAdminNameTaken(adminName)
	.then(async (adminNameTaken) => {
		req.mongo.push(adminNameTaken);
		if (adminNameTaken) {
			throw "Admin User Taken!";
		}

		let permissions = {A: "admin", SA: "superadmin"};
		let adminPerm = permissions[adminRank];

		let salt = await bcrypt.genSalt(require('../../env').config.bcrypt.num_salt);
		let storePass = await bcrypt.hash(adminPass, salt);
		return adminUserDBI.createNewAdminUser(adminName, storePass, adminPerm);
	})
	.then((created) => {
		req.mongo.push(created);
		let rsp = {
			status: "success",
			response: {}
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
	})
	.catch((error) => {
		req.mongo.push(error);
		console.log(error);
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
