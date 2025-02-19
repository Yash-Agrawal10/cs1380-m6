const groups = function(config) {
  const context = {};
  context.gid = config.gid || 'all';

  return {
    put: (config, group, callback) => {
      // Handle parameters
      config = config || '';
      callback = callback || function() { };
      group = group || {};
      if (typeof group != 'object' || (typeof config != 'string' && typeof config != 'object') || typeof callback != 'function') {
        callback(new Error('Invalid parameters'), null);
        return;
      }
      let gid;
      if (typeof config == 'string') {
        gid = config;
      } else {
        gid = config.gid;
        if (!gid) {
          callback(new Error('Invalid parameters'), null);
          return;
        }
      }

      global.distribution[context.gid].comm.send([config, group], {service: 'groups', method: 'put'}, callback);
    },

    del: (name, callback) => {
      // Handle parameters
      name = name || '';
      callback = callback || function() { };
      if (typeof name != 'string' || typeof callback != 'function') {
        callback(new Error('Invalid parameters'), null);
        return;
      }

      global.distribution[context.gid].comm.send([name], {service: 'groups', method: 'del'}, callback);
    },

    get: (name, callback) => {
      // Handle parameters
      name = name || '';
      callback = callback || function() { };
      if (typeof name != 'string' || typeof callback != 'function') {
        callback(new Error('Invalid parameters'), null);
        return;
      }

      global.distribution[context.gid].comm.send([name], {service: 'groups', method: 'get'}, callback);
    },

    add: (name, node, callback) => {
      // Handle parameters
      name = name || '';
      callback = callback || function() { };
      if (typeof name != 'string' || typeof callback != 'function' || typeof node != 'object') {
        callback(new Error('Invalid parameters'), null);
        return;
      }

      global.distribution[context.gid].comm.send([name, node], {service: 'groups', method: 'add'}, callback);
    },

    rem: (name, node, callback) => {
      // Handle parameters
      name = name || '';
      callback = callback || function() { };
      if (typeof name != 'string' || typeof callback != 'function' || typeof node != 'string') {
        callback(new Error('Invalid parameters'), null);
        return;
      }

      global.distribution[context.gid].comm.send([name, node], {service: 'groups', method: 'rem'}, callback);
    },
  };
};

module.exports = groups;
