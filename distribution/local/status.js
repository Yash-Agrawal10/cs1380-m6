const id = require('../util/id');
const log = require('../util/log');

const status = {};

global.moreStatus = {
  sid: id.getSID(global.nodeConfig),
  nid: id.getNID(global.nodeConfig),
  counts: 0,
};

status.get = function(configuration, callback) {
  // TODO: implement remaining local status items
  
  // Handle parameters
  configuration = configuration || "";
  callback = callback || console.log;
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


status.spawn = function(configuration, callback) {
};

status.stop = function(callback) {
};

module.exports = status;
