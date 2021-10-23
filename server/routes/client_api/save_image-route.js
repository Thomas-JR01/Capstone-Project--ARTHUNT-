var express = require('express');
var router = express.Router();
var fs = require('fs');

const auth = require('../../auth').authenticate;

// POST 'client-api/save-image/' page
/* Success Response:
{}
*/
router.post('/:img_name', auth, function(req, res, next) {
	let name = req.params.img_name;
	let imgData = req.body.img_data;

	if (imgData === undefined) {
		console.log("Image Not Found");
		let rsp = {
			status: "error",
			message: "Image Was Not Found."
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
		return;
	}
	
	let fileDir = `${require('../../env').config.file_dir.imgs}saved_img/${name}.png`;

	if (!["team", "admin", "superadmin"].includes(req.perm)) {
		console.log("Access Denied");
		let rsp = {
			'status': "error",
			'message': "You are not allowed to access this."
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
		return;
	}

	fs.writeFile(fileDir, imgData, 'base64', (err) => { 
		if (err) {
			console.log("Image Saving Failed");
			let rsp = {
				status: "error",
				message: "Image Saving Failed"
			};
			res.json(rsp);
			req.rsp = rsp;
			next();
			return;
		}
		let rsp = {
			'status': "success",
			'message': {}
		};
		res.json(rsp);
		req.rsp = rsp;
		next();
	})
})

module.exports = router;
