const id = require('../util/id');

const memMap = new Map();

function put(state, configuration, callback) {
    // Handle parameters
    callback = callback || function() { };
    let gid;
    let key;
    if (typeof configuration == 'string') {
        gid = 'local';
        key = configuration;
    } else if (typeof configuration == 'object' && configuration != null) {
        gid = configuration.gid || 'local';
        key = configuration.key || id.getID(state);
    } else {
        gid = 'local';
        key = id.getID(state);
    }

    // Get/create GID map
    let gidMap;
    if (memMap.has(gid)) {
        gidMap = memMap.get(gid);
    } else {
        gidMap = new Map();
        memMap.set(gid, gidMap);
    }

    // Put object in GID map
    gidMap.set(key, state);

    // Callback
    callback(null, state);
};

function get(configuration, callback) {
    // Handle parameters
    callback = callback || function() { };
    let gid;
    let key;
    if (typeof configuration == 'string' || configuration == null) {
        gid = 'local';
        key = configuration;
    } else if (typeof configuration == 'object' && configuration != null) {
        gid = configuration.gid || 'local';
        key = configuration.key;
    }

    // Get/create GID map
    let gidMap;
    if (memMap.has(gid)) {
        gidMap = memMap.get(gid);
    } else {
        callback(new Error('Object not found'), null);
        return;
    }

    // Return value from GID map
    if (gidMap.has(key)) {
        callback(null, gidMap.get(key));
    } else {
        callback(new Error('Object not found'), null);
    }
}

function del(configuration, callback) {
    // Handle parameters
    callback = callback || function() { };
    let gid;
    let key;
    if (typeof configuration == 'string' || configuration == null) {
        gid = 'local';
        key = configuration;
    } else if (typeof configuration == 'object' && configuration != null) {
        gid = configuration.gid || 'local';
        key = configuration.key;
    }

    // Get/create GID map
    let gidMap;
    if (memMap.has(gid)) {
        gidMap = memMap.get(gid);
    } else {
        callback(new Error('Object not found'), null);
        return;
    }

    // Return value from GID map
    if (gidMap.has(key)) {
        const value = gidMap.get(key);
        gidMap.delete(key);
        callback(null, value);
    } else {
        callback(new Error('Object not found'), null);
    }
};

module.exports = {put, get, del};
