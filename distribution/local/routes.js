/** @typedef {import("../types").Callback} Callback */

const serviceMap = new Map();

/**
 * @param {string} configuration
 * @param {Callback} callback
 * @return {void}
 */
function get(configuration, callback) {
  // Handle parameters
  configuration = configuration || '';
  callback = callback || function() { };
  if ((typeof configuration != 'string' && typeof configuration != 'object') || typeof callback != 'function') {
    callback(new Error('Invalid parameters'), null);
    return;
  }
  let gid;
  let serviceName;
  if (typeof configuration == 'object') {
    gid = configuration.gid || 'local';
    serviceName = configuration.service;
  } else {
    gid = 'local';
    serviceName = configuration;
  }

  // Get and return service
  if (gid == 'local') {
    if (serviceMap.has(serviceName)) {
      const service = serviceMap.get(serviceName);
      callback(null, service);
    } else {
      callback(new Error('Service not found'), null);
    }
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
  configuration = configuration || '';
  callback = callback || function() { };
  if (typeof service != 'object' || typeof configuration != 'string' || typeof callback != 'function') {
    callback(new Error('Invalid parameters'), null);
    return;
  }
  // Put service in serviceMap
  serviceMap.set(configuration, service);
  callback(null, configuration);
}

/**
 * @param {string} configuration
 * @param {Callback} callback
 */
function rem(configuration, callback) {
  // Handle parameters
  configuration = configuration || '';
  callback = callback || function() { };
  if (typeof configuration != 'string' || typeof callback != 'function') {
    callback(new Error('Invalid parameters'), null);
    return;
  }

  // Remove service from map
  const service = serviceMap.get(configuration);
  serviceMap.delete(configuration);
  callback(null, service);
};

module.exports = {get, put, rem};
