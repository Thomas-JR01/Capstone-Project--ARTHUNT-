var express = require('express');
var fs = require('fs');
var router = express.Router();

const cache = require('../../cache');
const auth = require('../../auth').authenticate;

// GET 'admin-api/list-images/' page
/* Success Response:
[
image_name,
...]
*/
router.get('/:event_id', auth, function(req, res, next) {
	let eventID = parseInt(req.params.event_id);
	const cacheKey = `${req.baseUrl}_${eventID}`;

	if (!["admin", "superadmin"].includes(req.perm)) {
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

	fs.readdir(`${require('../../env').config.file_dir.imgs}/saved_img/`, (error, files) => {
		if (error) {
			console.log(error.stack);
			let rsp = {
				status: "error",
				message: "Error reading the saved file directory"
			}
			req.rsp = rsp;
			res.json(rsp);
			cache.addCacheEntry(cacheKey, rsp);
			next();
			return;
		}
		let eventImages = files.filter((file) => {return file.split("_")[0] === eventID.toString()})
							   .map((value) => {return value.split(".")[0]}) // remove file extension
		let rsp = {
			status: "success",
			response: eventImages
		}
		req.rsp = rsp;
		res.json(rsp);
		cache.addCacheEntry(cacheKey, rsp);
		next();
		return;
	})
})


module.exports = router;
