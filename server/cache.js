let cache = {};

function addCacheEntry(key, data, expiry=(10*1000)) {
	if (require('./env').config.debug.cache) {
		cache[key] = {
			data: data,
			expiry: (Date.now()+expiry)
		};
	}
}

function deleteCacheEntry(key) {
	delete cache[key];
}

function getCacheEntryData(key) {
	return cache[key]?.data;
}

function isCacheExpired(key) {
	if (cache[key] !== undefined) {
		return (cache[key]?.expiry < Date.now());
	}
	return true;
}


module.exports.addCacheEntry = addCacheEntry;
module.exports.deleteCacheEntry = deleteCacheEntry;
module.exports.getCacheEntryData = getCacheEntryData;
module.exports.isCacheExpired = isCacheExpired;