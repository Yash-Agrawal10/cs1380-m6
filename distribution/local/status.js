const log = require('../util/log');
const { spawn } = require('child_process');
const path = require('path');
const { createRPC } = require('../util/wire');
const { serialize, deserialize } = require('../util/serialization');

const status = {};

global.moreStatus = {
  sid: global.distribution.util.id.getSID(global.nodeConfig),
  nid: global.distribution.util.id.getNID(global.nodeConfig),
  counts: 0,
};

status.get = function(configuration, callback) {
  // TODO: implement remaining local status items

  // Handle parameters
  configuration = configuration || '';
  callback = callback || function () { };
  if (typeof configuration != 'string' || typeof callback != 'function') {
    callback(new Error('Invalid parameters'), null);
    return;
  }

  // Update state
  global.moreStatus.counts++;

  // Get requested value
  switch (configuration) {
    case 'nid':
      callback(null, global.moreStatus.nid);
      break;

    case 'sid':
      callback(null, global.moreStatus.sid);
      break;

    case 'ip':
      callback(null, global.nodeConfig.ip);
      break;

    case 'port':
      callback(null, global.nodeConfig.port);
      break;

    case 'counts':
      callback(null, global.moreStatus.counts);
      break;

    case 'heapTotal':
      callback(null, process.memoryUsage().heapTotal);
      break;

    case 'heapUsed':
      callback(null, process.memoryUsage().heapUsed);
      break;

    default:
      callback(new Error('Status key not found'), null);
      break;
  }
};


status.spawn = require('@brown-ds/distribution/distribution/local/status').spawn; 
status.stop = require('@brown-ds/distribution/distribution/local/status').stop; 

// status.spawn = function(configuration, callback) {
//   // Handle Parameters
//   callback = callback || function() { };
//   if (typeof callback != 'function' || typeof configuration != 'object') {
//     // Not sure what to do here
//     return;
//   }

//   // Create and add RPC to config
//   const callbackRPC = createRPC(callback);
//   if (configuration.onStart) {
//     function g() {
//       configuration.onStart();
//       callbackRPC();
//     }
//     configuration.onStart = g;
//   } else {
//     configuration.onStart = callbackRPC;
//   }

//   // Spawn child
//   const serializedConfig = serialize(configuration);
//   const scriptPath = path.resolve(__dirname, '../../distribution.js');
//   console.log(scriptPath);
//   console.log(serializedConfig);
//   const child = spawn(scriptPath, ['--config', serializedConfig]);
// };

// status.stop = function(callback) {
  
// };

module.exports = status;
