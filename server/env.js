module.exports.config = {
	mongo: {
		uri: "mongodb://localhost:27017/?readPreference=primary&ssl=false"
	},
	jwt: {
		secret: "arthuntsecret"
	},
	bcrypt: {
		num_salt: 10
	},
	file_dir: {
		imgs: "public/images/",
		max_size: "10mb"
	},
	debug: {
		cache: true,
		db_log: false,
		critical_log: "critical_error.log",
		tick_timing: false
	}
}