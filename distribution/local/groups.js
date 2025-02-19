const id = require('../util/id');

const groups = {};

const namesToNodes = new Map();

groups.get = function(name, callback) {
  // Handle parameters
  name = name || '';
  callback = callback || function() { };
  if (typeof name != 'string' || typeof callback != 'function') {
    callback(new Error('Invalid parameters'), null);
    return;
  }
  // Get and return group
  if (namesToNodes.has(name)) {
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
      require('../all/store')({gid: gid});

  // Put group in local map
  namesToNodes.set(gid, group);
  callback(null, group);
};

groups.del = function(name, callback) {
  // Handle parameters
  name = name || '';
  callback = callback || function() { };
  if (typeof name != 'string' || typeof callback != 'function') {
    callback(new Error('Invalid parameters'), null);
    return;
  }
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
  if (typeof name != 'string' || typeof callback != 'function' || typeof node != 'object') {
    callback(new Error('Invalid parameters'), null);
    return;
  }

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
  if (typeof name != 'string' || typeof callback != 'function' || typeof node != 'string') {
    callback(new Error('Invalid parameters'), null);
    return;
  }

  if (namesToNodes.has(name)) {
    const group = namesToNodes.get(name);
    console.log(group);
    if (group.hasOwnProperty(node)) {
        console.log(group);
        delete group[node];
        console.log(group);
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

