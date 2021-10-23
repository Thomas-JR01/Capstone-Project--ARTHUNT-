var express = require('express');
var router = express.Router();

const siteTemplateDBI = require('../../database/site_template-interface');
const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'admin-api/site-templates/' page
/* Success Summary:
[{
_id: ObjectId,
location: String,
main_img: String,
abstract_img: String,
closeup: String,
title: String,
artist: String,
year: Number,
active: Boolean,
theme: String,
lat: Number,
long: Number,
information: String,
type: String,
clue: String,
notes: String
}, ...]
*/
router.get('/', auth, function(req, res, next) {
	const cacheKey = `${req.baseUrl}`;

	req['mongo'] = ['admin-api/site-templates/'];

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

	if (!cache.isCacheExpired(cacheKey)) {
		let rsp = cache.getCacheEntryData(cacheKey);
		req.rsp = rsp;
		res.json(rsp);
		next();
		return;
	}

	siteTemplateDBI.getAllSiteTemplates()
	.then((templates) => {
		req.mongo.push(templates);
		let rsp = {
			'status': "success",
			'response': templates
		};
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp);
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
		cache.addCacheEntry(cacheKey, rsp);
		req.rsp = rsp;
		next();
	})
})

module.exports = router;
