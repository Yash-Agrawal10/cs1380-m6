const log = require('../util/log');
const crypto = require('node:crypto');
const comm = require('../local/comm');

function createRPC(func) {
  // Write some code...
  let hash = '';
  while (true) {
    const randomInput = crypto.randomBytes(32).toString('hex');
    hash = crypto.createHash('sha256').update(randomInput).digest('hex');
    if (!global.rpcMap.has(hash)) {
      global.rpcMap.set(hash, func);
      break;
    }
  }

  // Create returned function
  function stub(...args) {
    const callback = args[args.length - 1];

    // Make call to remote node (serialization/deserialization is internal)
    const remote = {node: __NODE_INFO__, service: 'rpc', method: '__HASH__'};
    console.log(global.distribution.local.comm.send);
    global.distribution.local.comm.send(args, remote, callback);
  }

  // Serialize and replace node/hash information
  const serializedStub = stub.toString(); ;
  const stubWithReplacements = serializedStub.
      replace('__NODE_INFO__', `{ip: "${global.nodeConfig.ip}", port: ${global.nodeConfig.port}}`).
      replace('__HASH__', hash);

  // Return function
  const deserializedStub = new Function('return ' + stubWithReplacements)();
  return deserializedStub;
}

/*
  The toAsync function transforms a synchronous function that returns a value into an asynchronous one,
  which accepts a callback as its final argument and passes the value to the callback.
*/
function toAsync(func) {
  log(`Converting function to async: ${func.name}: ${func.toString().replace(/\n/g, '|')}`);

  // It's the caller's responsibility to provide a callback
  const asyncFunc = (...args) => {
    const callback = args.pop();
    try {
      const result = func(...args);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  };

  /* Overwrite toString to return the original function's code.
   Otherwise, all functions passed through toAsync would have the same id. */
  asyncFunc.toString = () => func.toString();
  return asyncFunc;
}

module.exports = {
  createRPC: createRPC,
  toAsync: toAsync,
};
