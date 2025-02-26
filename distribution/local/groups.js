const id = require('../util/id');

const groups = {};

const namesToNodes = new Map();

groups.get = function(name, callback) {
  // Handle parameters
  name = name || '';
  callback = callback || function() { };

  // Get and return group
  if (name == 'all') {
    let allGroup = {};
    for (const [key, value] of namesToNodes) {
      allGroup = {
        ...allGroup, 
        ...value
      };
    }
    callback(null, allGroup);
  } else if (namesToNodes.has(name)) {
    const group = namesToNodes.get(name);
    callback(null, group);
  } else {
    callback(new Error('Group not found'), null);
  }
};

groups.put = function(config, group, callback) {
  // Handle parameters
  config = config || '';
  callback = callback || function() { };
  group = group || {};
  let gid;
  let hash;
  if (typeof config == 'string') {
    gid = config;
  } else {
    gid = config.gid;
    hash = config.hash;
  }

  // Populate distribution.gid
  global.distribution[gid] = {};
  global.distribution[gid].status =
      require('../all/status')({gid: gid});
  global.distribution[gid].comm =
      require('../all/comm')({gid: gid});
  global.distribution[gid].gossip =
      require('../all/gossip')({gid: gid});
  global.distribution[gid].groups =
      require('../all/groups')({gid: gid});
  global.distribution[gid].routes =
      require('../all/routes')({gid: gid});
  global.distribution[gid].mem =
      require('../all/mem')({gid: gid});
  global.distribution[gid].store =
      require('../all/store')({gid: gid, hash: hash});

  // Put group in local map
  namesToNodes.set(gid, group);
  callback(null, group);
};

groups.del = function(name, callback) {
  // Handle parameters
  name = name || '';
  callback = callback || function() { };

  // Remove service from map
  if (namesToNodes.has(name)) {
    const group = namesToNodes.get(name);
    namesToNodes.delete(name);
    callback(null, group);
  } else {
    callback(new Error('Group not found'), null);
  }
};

groups.add = function(name, node, callback) {
  // Handle parameters
  name = name || '';
  callback = callback || function() { };

  // Add node
  if (namesToNodes.has(name)) {
    const group = namesToNodes.get(name);
    group[id.getSID(node)] = node;
    namesToNodes.set(name, group);
    callback(null, group);
  } else {
    callback(new Error('Group not found'), null);
  }
};

groups.rem = function(name, node, callback) {
  // Handle parameters
  name = name || '';
  callback = callback || function() { };

  if (namesToNodes.has(name)) {
    const group = namesToNodes.get(name);
    if (group.hasOwnProperty(node)) {
        delete group[node];
        namesToNodes.set(name, group);
        callback(null, group);
    } else {
        callback(new Error('Node not found in group'), null);
    }
  } else {
    callback(new Error('Group not found'), null);
  }
};

module.exports = groups;

