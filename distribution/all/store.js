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
    let key;
    let orEmpty;
    if (typeof configuration == 'string') {
      key = configuration;
      orEmpty = false;
    } else if (typeof configuration == 'object') {
      key = configuration.key || '';
      if (configuration.orEmpty) {
        orEmpty = configuration.orEmpty;
      } else {
        orEmpty = false;
      }
    }

    // Get value
    groups.get(context.gid, (e, v) => {
      if (e) {
        callback(e, null);
        return;
      }

      getNodes(key, v, (e0, v0) => {
        if (e0) {
          callback(e0, null);
          return;
        }
  
        const message = [{key, gid: context.gid, orEmpty}];
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

      getNodes(configuration, v, (e0, v0) => {
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

  function append(state, key, group, callback){
    // Handle parameters
    callback = callback || function() { };
    key = key || id.getID(state);

    getNodes(key, group, (e0, v0) => {
      if (e0) {
        callback(e0, null);
        return;
      }

      const message = [state, {key, gid: context.gid}];
      const remote = {node: v0, service: 'store', method: 'append'};
      send(message, remote, (e1, v1) => {
        if (e1) {
          callback(e1, null);
        } else {
          callback(null, v1);
        }
      });
    });
  }

  function getKey(key, callback) {
    callback = callback || function() { };
    
    groups.get(context.gid, (e, v) => {
      getNodes(key, v, (e0, v0) => {
        const message = [key];
        const remote = {node: v0, service: 'query', method: 'getKey'};
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

  function addToIndex(localIndex, callback) {
    callback = callback || function() { };
    
    groups.get(context.gid, (e, v) => {
      const keys = localIndex.map(o => Object.keys(o)[0]);
      getNodes(keys, v, (e0, v0) => {
        const nodes = v0;
        const nodeToLists = new Map();
        for (let i = 0; i < localIndex.length; i++) {
          const node = nodes[i];
          if (nodeToLists.has(node)) {
            nodeToLists.get(node).push(localIndex[i]);
          } else {
            nodeToLists.set(node, [localIndex[i]]);
          }
        }
        
        const numNodes = nodesToLists.size;
        let counter = 0;
        for (const node of nodeToLists.keys()) {
          const message = nodeToLists.get(node);
          const remote = {node: node, service: 'query', method: 'addToIndex'};
          send(message, remote, (e2, v2) => {
            counter++;
            if (counter == numNodes) {
              callback(null, null);
            }
          });
        }
      });
    });
  }

  function reconf(configuration, callback){
  }

  return {getNodes, get, put, append, del, reconf};
};

module.exports = store;
