const fs = require('fs');
const loggingDBI = require('./database/logging-interface');

const dbLog = (req, res, next) => {
	if (require('./env').config.debug.db_log) {
		let info = {
			type: "request",
			data: {
				client_request: {
					url: req.url,
					method: req.method,
					status_code: req.statusCode,
					aborted: req.aborted,
					requestor: req._remoteAddress,
					http_version: req.httpVersion,
					header: {
						user_agent: req.headers['user-agent'],
						authorization: req.headers.authorization
					},
					body: req.body
				},
				server_response: req.rsp,
				decoded_token: req.info
			},
			timestamp: new Date()
		};
		loggingDBI.saveLog(info)
		.then((result) => {
			let info = {
				type: "mongo",
				data: req.mongo,
				timestamp: new Date()
			};
			return loggingDBI.saveLog(info)
		})
		.then((result) => {})
		.catch((err) => { console.log("Error saving log!"); })
	}
};

function saveCriticalError(data) {
	fs.appendFileSync(require('./env').config.debug.critical_log, data);
}

function singleLogData(type, data) {
	if (require('./env').config.debug.db_log) {
		let info = {
			type: type,
			data: data,
			timestamp: new Date()
		};
		return loggingDBI.saveLog(info)
		.then((result) => {})
		.catch((err) => { console.log("Error saving log!"); })
	}
}

module.exports.dbLog = dbLog;
module.exports.saveCriticalError = saveCriticalError;
module.exports.singleLogData = singleLogData;