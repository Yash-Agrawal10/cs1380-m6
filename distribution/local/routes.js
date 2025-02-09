/** @typedef {import("../types").Callback} Callback */

const serviceMap = {};

/**
 * @param {string} configuration
 * @param {Callback} callback
 * @return {void}
 */
function get(configuration, callback) {
    const service = serviceMap[configuration];
    if (service == null) {
        callback(new Error('Service not found'), null);
        return;
    }
    callback(null, service);
}

/**
 * @param {object} service
 * @param {string} configuration
 * @param {Callback} callback
 * @return {void}
 */
function put(service, configuration, callback) {
    serviceMap[configuration] = service;
    callback(null, configuration);
}

/**
 * @param {string} configuration
 * @param {Callback} callback
 */
function rem(configuration, callback) {
    delete serviceMap[configuration];
    callback(null, configuration);
};

module.exports = {get, put, rem};
