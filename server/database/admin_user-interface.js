const {MongoClient} = require('mongodb');
const uri = require('../env').config.mongo.uri;
const client = new MongoClient(uri);

// Creates a new admin user
async function createNewAdminUser(user, pass, perm) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("admin_users")
		.insertOne({username: user, password_hash: pass, permission: perm})
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})
}

// Returns the password hash and the permissions for a given user
async function getAdminUserPasswordHash(user) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("admin_users")
		.findOne({ username:user }, 
			{projection: {password_hash:1, permission:1}})
	})
	.then((result) => {
		return result;
	})
	.catch((error) => {
		throw error;
	})

}

// Returns if the admin name has been taken
async function isAdminNameTaken(user) {
	return client.connect()
	.then(() => {
		return client.db("ArtHuntDB")
		.collection("admin_users")
		.findOne({username: user})
	})
	.then((result) => {
		return (result!==undefined)
	})
	.catch((error) => {
		throw error;
	})
}

module.exports.createNewAdminUser = createNewAdminUser;
module.exports.getAdminUserPasswordHash = getAdminUserPasswordHash;
module.exports.isAdminNameTaken = isAdminNameTaken;