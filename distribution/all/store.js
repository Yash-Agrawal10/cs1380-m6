const id = require('../util/id');
const groups = require('../local/groups')
const { send } = require('../local/comm');

function store(config) {
  const context = {};
  context.gid = config.gid || 'all';
  context.hash = config.hash || global.distribution.util.id.naiveHash;

  /* For the distributed store service, the configuration will
          always be a string */
  return {
    get: (configuration, callback) => {
      // Handle parameters
      callback = callback || function() { };

      // Get value
      groups.get(context.gid, (e0, v0) => {
        if (e0) {
          callback(e0, null);
          return;
        }

        const nodes = Object.values(v0);
        const nids = nodes.map(node => id.getNID(node));
        const kid = id.getID(configuration);
        const targetNID = context.hash(kid, nids);
        const targetNode = nodes.filter((node) => id.getNID(node) == targetNID)[0];
        const message = [{key: configuration, gid: context.gid}];
        const remote = {node: targetNode, service: 'store', method: 'get'};
        send(message, remote, (e1, v1) => {
          if (e1) {
            callback(e1, null);
          } else {
            callback(null, v1);
          }
        });
      });
    },

    put: (state, configuration, callback) => {
      // Handle parameters
      callback = callback || function() { };
      configuration = configuration || id.getID(state);

      groups.get(context.gid, (e0, v0) => {
        if (e0) {
          callback(e0, null);
          return;
        }

        const nodes = Object.values(v0);
        const nids = nodes.map(node => id.getNID(node));
        const kid = id.getID(configuration);
        const targetNID = context.hash(kid, nids);
        const targetNode = nodes.filter((node) => id.getNID(node) == targetNID)[0];
        const message = [state, {key: configuration, gid: context.gid}];
        const remote = {node: targetNode, service: 'store', method: 'put'};
        send(message, remote, (e1, v1) => {
          if (e1) {
            callback(e1, null);
          } else {
            callback(null, v1);
          }
        });
      });
    },

    del: (configuration, callback) => {
      // Handle parameters
      callback = callback || function() { };

      // Get value
      groups.get(context.gid, (e0, v0) => {
        if (e0) {
          callback(e0, null);
          return;
        }

        const nodes = Object.values(v0);
        const nids = nodes.map(node => id.getNID(node));
        const kid = id.getID(configuration);
        const targetNID = context.hash(kid, nids);
        const targetNode = nodes.filter((node) => id.getNID(node) == targetNID)[0];
        const message = [{key: configuration, gid: context.gid}];
        const remote = {node: targetNode, service: 'store', method: 'del'};
        send(message, remote, (e1, v1) => {
          if (e1) {
            callback(e1, null);
          } else {
            callback(null, v1);
          }
        });
      });
    },

    reconf: (configuration, callback) => {
    },
  };
};

module.exports = store;
