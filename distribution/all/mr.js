/** @typedef {import("../types").Callback} Callback */

/**
 * Map functions used for mapreduce
 * @callback Mapper
 * @param {any} key
 * @param {any} value
 * @returns {object[]}
 */

/**
 * Reduce functions used for mapreduce
 * @callback Reducer
 * @param {any} key
 * @param {Array} value
 * @returns {object}
 */

/**
 * @typedef {Object} MRConfig
 * @property {Mapper} map
 * @property {Reducer} reduce
 * @property {string[]} keys
 */


/*
  Note: The only method explicitly exposed in the `mr` service is `exec`.
  Other methods, such as `map`, `shuffle`, and `reduce`, should be dynamically
  installed on the remote nodes and not necessarily exposed to the user.
*/

function mr(config) {
  const context = {
    gid: config.gid || 'all',
  };

  /**
   * @param {MRConfig} configuration
   * @param {Callback} cb
   * @return {void}
   */
  function exec(configuration, cb) {
    // Handle parameters
    const keys = configuration.keys || [];
    const map = configuration.map || function(x) {return x};
    const reduce = configuration.reduce || function(x) {return x};
    if (!Array.isArray(keys) || typeof(map) != 'function' || typeof(reduce) != 'function') {
      cb(new Error('Invalid configuration', null));
    }

    /*
      Workflow using group comm:
        1. Orchestrator group sends routes.put to instantiate map/reduce commands on workers

        2. Once complete, orchestrator group sends command to map (with full list of keys)
            - In map, workers will get relevant key-values from group's gid, do map, group store outputs in unique gid, and remove keys

        3. Once complete, orchestrator group sends command to reduce
            - In reduce, workers will get key-values, do reduce, remove keys, remove services, and return value (throgh callback)

        4. Once complete, orchestrator will remove service (if present), and return outputs

        Note -- could create notify service on orchestrator for better fault tolerance and information sharing
    */

    // Worker map function
    function doMap(keys, group, gid, map, serviceName, callback) {
      // Handle parameters
      keys = keys || [];
      callback = callback || function() { };
      gid = gid || 'local';
      map = map || function () { };
      if (!Array.isArray(keys) || typeof callback != 'function' || typeof gid != 'string' || typeof map != 'function') {
        callback(new Error('Invalid parameters'), null);
      }

      // Filter for keys node is responsible for
      global.distribution[gid].store.getNodes(keys, group, (e, v) => {
        if (e) {
          callback(e, null);
          return;
        }
        const id = global.distribution.util.id;
        const nodeKeys = keys.filter((key, index) => (id.getNID(v[index]) == id.getNID(global.nodeConfig)));
        if (nodeKeys.length == 0) {
          callback(null, []);
          return;
        }

        // Perform map operation on these keys
        let counter = 0;
        let output = [];
        nodeKeys.forEach((key) => {
          global.distribution.local.store.get({gid: gid, key: key}, (error, value) => {
            if (error) {
              counter++;
            } else {
              const keyOutput = map(key, value);
              output = output.concat(keyOutput);
              counter++;
            }

            if (counter == nodeKeys.length) {
              // Temporary -- send output back to main node
              callback(null, output);
              
              // Map keys to lists of values
              const keyToValues = new Map();
              for (let kv of output) {
                const key = Object.keys(kv)[0];
                const value = Object.values(kv)[0];
                if (keyToValues.has(key)) {
                  keyToValues.set(key, keyToValues.get(key).push(value));
                } else {
                  keyToValues.set(key, [value]);
                }
              }

              // Store keys with serviceName- prefix
              
            }
          });
        });
      });
    }


    // Worker reduce function
    function doReduce() {
    }

    // Map-Reduce workflow (ignore error handling for now)
    const service = {doMap, doReduce};
    const serviceID = global.distribution.util.id.getID(configuration);
    const serviceName = 'mr-' + serviceID;

    // Get local view of group
    global.distribution.local.groups.get(context.gid, (e1, v1) => {
      // Instantiate relevant functions on workers
      global.distribution[context.gid].routes.put(service, serviceName, (e2, v2) => {
        // Call map on workers
        const remote1 = {service: serviceName, method: 'doMap'};
        const message1 = [keys, v1, context.gid, map, serviceName];
        global.distribution[context.gid].comm.send(message1, remote1, (e3, v3) => {
          console.log('returned values: ', v3, e3);
          // Temporary -- log the return values
          cb(new Error('NYI'), null);
        });
      });
    });
  }

  return {exec};
};

module.exports = mr;
