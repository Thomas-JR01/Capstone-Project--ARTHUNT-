var express = require('express');
var router = express.Router();

const siteTemplateDBI = require('../../database/site_template-interface');
const auth = require('../../auth').authenticate;

// POST 'admin-api/edit-site-template/' page
/* Success Response:
{}
*/
router.post('/:site_id', auth, function(req, res, next) {
	let siteID = req.params.site_id;
	let newData = req.body.new_data;

	req['mongo'] = ['admin-api/edit-site-template/'];

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

	siteTemplateDBI.updateSiteTemplate(siteID, newData)
	.then((updated) => {
		req.mongo.push(updated);
		let rsp = {
			'status': "success",
			'response': {}
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
