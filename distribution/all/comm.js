/** @typedef {import("../types").Callback} Callback */

const groups = require('../local/groups');
const id = require('../util/id');
const { send } = require('../local/comm');

/**
 * NOTE: This Target is slightly different from local.all.Target
 * @typdef {Object} Target
 * @property {string} service
 * @property {string} method
 */

/**
 * @param {object} config
 * @return {object}
 */
function comm(config) {
  const context = {};
  context.gid = config.gid || 'all';

  /**
   * @param {Array} message
   * @param {object} configuration
   * @param {Callback} callback
   */
  function send(message, configuration, callback) {
    // Handle parameters
    message = message || [];
    callback = callback || function() { };
    if (!Array.isArray(message) || typeof callback != 'function' || typeof configuration != 'object') {
      callback(new Error('Invalid parameters'), null);
      return;
    }

    /*
      Idea - have the callback consume an index and value/error objects to accumulate in, 
      if index == groups.length call the actual callback with value/error objects,
      if index < groups.length call local.comm.send to node that corresponds to index passed in,
      and in the callback for that, append error/value to object, then call callback itself with index incremented

      Can initiate recursive calls by calling the callback itself with cb(0, {}, {});

      This all must be done inside a callback to group.get so that it can access group size/list
    */
    groups.get(gid, (e, v) => {
      // Handle error
      if (e) {
        callback(e, null);
        return;
      }

      // Create callback
      const nodes = v;
      const numNodes = nodes.length;
      const cb = (index, errors, values) => {
        if (index == numNodes) {
          callback(errors, values);
        } else {
          const node = nodes[index];
          send(message, configuration, (e, v) => {
            const sid = id.getSID(node)
            if (e) {
              errors[sid] = e;
            } else {
              values[sid] = v;
            }
            cb(index + 1, errors, values);
          });
        }
      }
      
      // Execute callback logic
      cb(0, {}, {});
    });
  }

  return {send};
};

module.exports = comm;
