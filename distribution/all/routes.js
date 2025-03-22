/** @typedef {import("../types").Callback} Callback */

function routes(config) {
  const context = {};
  context.gid = config.gid || 'all';

  /**
   * @param {object} service
   * @param {string} name
   * @param {Callback} callback
   */
  function put(service, name, callback = () => { }) {
    // Handle parameters
    service = service || {};
    name = name || '';
    callback = callback || function() { };

    global.distribution[context.gid].comm.send([service, name], {service: 'routes', method: 'put'}, callback);
  }

  /**
   * @param {object} service
   * @param {string} name
   * @param {Callback} callback
   */
  function rem(name, callback = () => { }) {
    // Handle parameters
    name = name || '';
    callback = callback || function() { };

    global.distribution[context.gid].comm.send([name], {service: 'routes', method: 'rem'}, callback);
  }

  return {put, rem};
}

module.exports = routes;
