/* Notes/Tips:

- Use absolute paths to make sure they are agnostic to where your code is running from!
  Use the `path` module for that.
*/

const path = require('node:path');
const fs = require('node:fs');
const id = require('../util/id');
const { serialize, deserialize } = require('../util/serialization');

function put(state, configuration, callback) {
  // Handle parameters
  callback = callback || function() { };
  let gid;
  let key;
  if (typeof configuration == 'string') {
      gid = 'local';
      key = configuration;
  } else if (typeof configuration == 'object' && configuration != null) {
      gid = configuration.gid || 'local';
      key = configuration.key || id.getID(state);
  } else {
      gid = 'local';
      key = id.getID(state);
  }

  // Determine path and create directory if needed
  const nid = id.getNID(global.distribution.node.config);
  const storePath = path.resolve('/usr/src/app/store', nid, gid);
  if (!fs.existsSync(storePath)) {
    fs.mkdirSync(storePath, { recursive: true });
  }

  // Place object in store
  const filePath = path.join(storePath, key);
  const serializedState = serialize(state);
  fs.writeFileSync(filePath, serializedState, 'utf8');

  // Callback
  callback(null, state);
}

function get(configuration, callback) {
  // Handle parameters
  callback = callback || function() { };
  let gid;
  let key;
  if (typeof configuration == 'string' || configuration == null) {
      gid = 'local';
      key = configuration;
  } else if (typeof configuration == 'object' && configuration != null) {
      gid = configuration.gid || 'local';
      key = configuration.key;
  }

  // Construct path and check it exists
  const nid = id.getNID(global.distribution.node.config);
  const storePath = path.resolve('/usr/src/app/store', nid, gid);
  const filePath = path.join(storePath, key);
  if (!fs.existsSync(filePath)) {
    callback(new Error('Object not found'), null);
    return;
  }

  // Return object
  const serializedState = fs.readFileSync(filePath, 'utf8');
  const deserializedState = deserialize(serializedState);
  callback(null, deserializedState);
}

function del(configuration, callback) {
  // Handle parameters
  callback = callback || function() { };
  let gid;
  let key;
  if (typeof configuration == 'string' || configuration == null) {
      gid = 'local';
      key = configuration;
  } else if (typeof configuration == 'object' && configuration != null) {
      gid = configuration.gid || 'local';
      key = configuration.key;
  }

  // Construct path and check it exists
  const nid = id.getNID(global.distribution.node.config);
  const storePath = path.resolve('/usr/src/app/store', nid, gid);
  const filePath = path.join(storePath, key);
  if (!fs.existsSync(filePath)) {
    callback(new Error('Object not found'), null);
    return;
  }

  // Return object
  const serializedState = fs.readFileSync(filePath, 'utf8');
  const deserializedState = deserialize(serializedState);
  fs.unlinkSync(filePath);
  callback(null, deserializedState);
}

module.exports = {put, get, del};
