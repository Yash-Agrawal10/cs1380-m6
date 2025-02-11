/** @typedef {import("../types").Callback} Callback */

const serviceMap = {};

/**
 * @param {string} configuration
 * @param {Callback} callback
 * @return {void}
 */
function get(configuration, callback) {
    // Handle parameters
    configuration = configuration || "";
    callback = callback || function() { };
    if (typeof configuration != 'string' || typeof callback != 'function') {
        callback(new Error('Invalid parameters'), null);
        return;
    }

    // Handle RPC case
    if (configuration == 'rpc') {
        const service = global.toLocal;
        callback(null, service);
    }

    // Get and return service
    else if (serviceMap.hasOwnProperty(configuration)) {
        const service = serviceMap[configuration];
        callback(null, service);
    }
    else {
        callback(new Error('Service not found'), null);
    }    
}

/**
 * @param {object} service
 * @param {string} configuration
 * @param {Callback} callback
 * @return {void}
 */
function put(service, configuration, callback) {
    // Handle parameters
    service = service || {};
    configuration = configuration || "";
    callback = callback || function() { };
    if (typeof service != 'object' || typeof configuration != 'string' || typeof callback != 'function') {
        callback(new Error('Invalid parameters'), null);
        return;
    }
    // Put service in serviceMap
    serviceMap[configuration] = service;
    callback(null, configuration);
}

/**
 * @param {string} configuration
 * @param {Callback} callback
 */
function rem(configuration, callback) {
    // Handle parameters
    configuration = configuration || "";
    callback = callback || function() { };
    if (typeof configuration != 'string' || typeof callback != 'function') {
        callback(new Error('Invalid parameters'), null);
        return;
    }

    // Remove service from map
    const service = serviceMap[configuration];
    delete serviceMap[configuration];
    callback(null, service);
};

module.exports = {get, put, rem};
