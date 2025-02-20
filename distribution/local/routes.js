/** @typedef {import("../types").Callback} Callback */

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

  // Handle rpc
  if (serviceName == 'rpc') {
    callback(null, global.rpcMap);
    return;
  }

  // Get and return service
  const serviceMap = global.distribution[gid];
  if (serviceMap.hasOwnProperty(serviceName)) {
    const service = serviceMap[serviceName];
    callback(null, service);
  } else {
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
  configuration = configuration || '';
  callback = callback || function() { };
  if (typeof service != 'object' || typeof configuration != 'string' || typeof callback != 'function') {
    callback(new Error('Invalid parameters'), null);
    return;
  }
  // Put service in serviceMap
  const serviceMap = global.distribution['local'];
  serviceMap[configuration] = service;
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
  const serviceMap = global.distribution['local'];
  const service = serviceMap[configuration];
  delete serviceMap[configuration];
  callback(null, service);
};

module.exports = {get, put, rem};
