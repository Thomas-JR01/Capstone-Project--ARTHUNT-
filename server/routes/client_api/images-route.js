var express = require('express');
var router = express.Router();
var fs = require('fs');

const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'client-api/images/' page
/* Success Response:
image: String
*/
router.get('/:type/:img_name', auth, function(req, res, next) {
	let type = req.params.type;
	let name = req.params.img_name;
	const cacheKey = `${req.baseUrl}_${type}_${name}`;

	let fileDir = `${require('../../env').config.file_dir.imgs}${type}_img/${name}.png`

	if (!["team", "admin", "superadmin"].includes(req.perm)) {
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

	fs.readFile(fileDir, 'base64', (err, base64Image) => { 
		if (err) {
			console.log(err.stack);
			let rsp = {
				status: "error",
				message: err
			};
			res.json(rsp);
			cache.addCacheEntry(cacheKey, rsp);
			req.rsp = rsp;
			next();
			return;
		}
		let rsp = {
			status: "success",
			response: base64Image
		};
		
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp, (5*60*1000));
		req.rsp = rsp;
		next();
	});
})

module.exports = router;
