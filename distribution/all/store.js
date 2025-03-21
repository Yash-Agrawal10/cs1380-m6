const id = require('../util/id');
const groups = require('../local/groups')
const { send } = require('../local/comm');

function store(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.hash = config.hash || global.distribution.util.id.naiveHash;

  /* For the distributed store service, the configuration will
          always be a string */
  function getNodes(configuration, group, callback){
    // Handle parameters
    callback = callback || function() { };
    if (!Array.isArray(configuration)) {
      keys = [configuration];
    } else {
      keys = configuration;
    }

    const nodes = Object.values(group);
    const nids = nodes.map(node => id.getNID(node));
    const kids = keys.map((key) => id.getID(key));
    const targetNIDs = kids.map((kid) => context.hash(kid, nids));
    const targetNodes = targetNIDs.map((targetNID) => nodes.filter((node) => id.getNID(node) == targetNID)[0]);

    if (!Array.isArray(configuration)) {
      callback(null, targetNodes[0]);
    } else {
      callback(null, targetNodes);
    }
  }

  function get(configuration, callback){
    // Handle parameters
    callback = callback || function() { };

    // Get value
    groups.get(context.gid, (e, v) => {
      if (e) {
        callback(e, null);
        return;
      }

      getNodes(configuration, v, (e0, v0) => {
        if (e0) {
          callback(e0, null);
          return;
        }
  
        const message = [{key: configuration, gid: context.gid}];
        const remote = {node: v0, service: 'store', method: 'get'};
        send(message, remote, (e1, v1) => {
          if (e1) {
            callback(e1, null);
          } else {
            callback(null, v1);
          }
        });
  
      });
    });
  }

  function put(state, configuration, callback){
    // Handle parameters
    callback = callback || function() { };
    configuration = configuration || id.getID(state);

    groups.get(context.gid, (e, v) => {
      if (e) {
        callback(e, null);
        return;
      }

      getNodes(configuration, v, (e0, v0) => {
        if (e0) {
          callback(e0, null);
          return;
        }
  
        const message = [state, {key: configuration, gid: context.gid}];
        const remote = {node: v0, service: 'store', method: 'put'};
        send(message, remote, (e1, v1) => {
          if (e1) {
            callback(e1, null);
          } else {
            callback(null, v1);
          }
        });
      });
    });
  }

  function del(configuration, callback){
    // Handle parameters
    callback = callback || function() { };

    // Get value
    groups.get(context.gid, (e, v) => {
      if (e) {
        callback(e, null);
        return;
      }

      getNodes(configuration, (e0, v0) => {
        if (e0) {
          callback(e0, null);
          return;
        }
  
        const message = [{key: configuration, gid: context.gid}];
        const remote = {node: v0, service: 'store', method: 'del'};
        send(message, remote, (e1, v1) => {
          if (e1) {
            callback(e1, null);
          } else {
            callback(null, v1);
          }
        });
      });
    });
  }

  function reconf(configuration, callback){
  }

  return {getNodes, get, put, del, reconf};
};

module.exports = store;
