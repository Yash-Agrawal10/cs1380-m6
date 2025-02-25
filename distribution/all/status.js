
const status = function(config) {
  const context = {};
  context.gid = config.gid || 'all';

  return {
    get: (configuration, callback) => {
      // Handle parameters
      configuration = configuration || '';
      callback = callback || function () { };

      global.distribution[context.gid].comm.send([configuration], {service: 'status', method: 'get'}, (e, v) => {
        if (e instanceof Error) {
          callback(e, null);
          return;
        }

        if (configuration == 'counts' || configuration == 'heapTotal' || configuration == 'heapUsed') {
          let total = 0;
          for (let value of Object.values(v)) {
            total += value;
          }
          callback(e, total);
        } else {
          callback(e, v);
        }
      })
    },

    spawn: (configuration, callback) => {
      // Handle parameters
      configuration = configuration || '';
      callback = callback || function () { };

      // Call spawn on each node
      global.distribution[context.gid].comm.send([configuration], {service: 'status', method: 'spawn'}, callback);
    },

    stop: (callback) => {
      // Handle parameters
      callback = callback || function () { };

      // Call stop on each node
      global.distribution[context.gid].comm.send([], {service: 'status', method: 'stop'}, callback);
    },
  };
};

module.exports = status;
