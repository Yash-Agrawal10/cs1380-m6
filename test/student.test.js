/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
*/

const distribution = require('../config.js');
const local = distribution.local;
const util = distribution.util;
const id = distribution.util.id;

// M1 Test Cases

const serializeAndDeserialize = (object) => {
  const serialized = util.serialize(object);
  if (serialized instanceof Error) {
    return Error("Serialization failed");
  }
  const deserialized = util.deserialize(serialized);
  return deserialized;
}

describe('m1', () => {
  test('m1: sample test', () => {
    const object = {milestone: 'm1', status: 'complete'};
    const serialized = util.serialize(object);
    const deserialized = util.deserialize(serialized);
  
    expect(deserialized).toEqual(object);
  });
  
  test('m1: dates', () => {
    const now = new Date(Date.now());
    const myNow = serializeAndDeserialize(now);
    expect(myNow).toEqual(now);
  
    const zero = new Date(0);
    const myZero = serializeAndDeserialize(zero);
    expect(myZero).toEqual(zero);
  })
  
  test('m1: errors', () => {
    const empty = new Error();
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty).toEqual(empty);
  
    const message = new Error("message");
    const myMessage = serializeAndDeserialize(message);
    expect(myMessage).toEqual(message);
  })
  
  test('m1: objects', () => {
    const empty = {};
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty).toEqual(empty);
  
    const flat = {
      num: 1, 
      str: "string",
      arr: [1, 2, 3],
    };
    const myFlat = serializeAndDeserialize(flat);
    expect(myFlat).toEqual(flat);
  
    const rec = {
      l1: {
        l2: {
          l3: 3
        }
      }
    };
    const myRec = serializeAndDeserialize(rec);
    expect(myRec).toEqual(rec);
  });
  
  test('m1: arrays', () => {
    const empty = [];
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty).toEqual(empty);
  
    const nums = [1, 2, 3];
    const myNums = serializeAndDeserialize(nums);
    expect(myNums).toEqual(nums);
  
    const strings = ["a", "bc", "def"];
    const myStrings = serializeAndDeserialize(strings);
    expect(myStrings).toEqual(strings);
  
    const mixed = [1, "a", {test: 'test!'}];
    const myMixed = serializeAndDeserialize(mixed);
    expect(myMixed).toEqual(mixed);
  });
  
  test('m1: functions', () => {
    // Currently only tests simple function functionality, not deep equality
    const empty = () => {};
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty()).toBeUndefined();
  
    const identity = (x) => x;
    const myIdentity = serializeAndDeserialize(identity);
    expect(myIdentity(5)).toEqual(5);
  
    const double = (x) => 2 * x;
    const myDouble = serializeAndDeserialize(double);
    expect(myDouble(5)).toEqual(10);
  
    const multiLine = (x) => {
      x *= 5;
      return x / 2;
    };
    const myMultiLine = serializeAndDeserialize(multiLine);
    expect(myMultiLine(10)).toEqual(25);
  });
  
  test('m1: simple primitives', () => {
    const myTrue = serializeAndDeserialize(true);
    expect(myTrue).toEqual(true);
  
    const myFalse = serializeAndDeserialize(false);
    expect(myFalse).toEqual(false);
  
    const myNull = serializeAndDeserialize(null);
    expect(myNull).toEqual(null);
  
    const myUndefined = serializeAndDeserialize(undefined);
    expect(myUndefined).toEqual(undefined);
  });
  
  test('m1: strings', () => {
    const empty = "";
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty).toEqual(empty);
  
    const lower = "test";
    const myLower = serializeAndDeserialize(lower);
    expect(myLower).toEqual(lower);
  
    const upper = "test";
    const myUpper = serializeAndDeserialize(upper);
    expect(myUpper).toEqual(upper);
  
    const num = "123";
    const myNum = serializeAndDeserialize(num);
    expect(myNum).toEqual(num);
  
    const random = "  wasdWASD123!@#  ";
    const myRandom = serializeAndDeserialize(random);
    expect(myRandom).toEqual(random);
  });
  
  test('m1: numbers', () => {
    const singleDigit = 1;
    const mySingleDigit = serializeAndDeserialize(singleDigit);
    expect(mySingleDigit).toEqual(singleDigit);
  
    const multiDigit = 100;
    const myMultiDigit = serializeAndDeserialize(multiDigit);
    expect(myMultiDigit).toEqual(multiDigit);
  
    const decimal = 10.23;
    const myDecimal = serializeAndDeserialize(decimal);
    expect(myDecimal).toEqual(decimal);
  
    const myNaN = serializeAndDeserialize(NaN);
    expect(myNaN).toEqual(NaN);
  
    const myInfinity = serializeAndDeserialize(Infinity);
    expect(myInfinity).toEqual(Infinity);
  });
})

// M2 Test Cases

describe('m2', () => {
  let localServer = null;
  let node = null;

  beforeAll((done) => {
    distribution.node.start((server) => {
      localServer = server;
      node = distribution.node.config;
      done();
    });
  });

  afterAll((done) => {
    localServer.close();
    done();
  });

  test('m2: comm.send(routes.get(status.get)) nid', (done) => {
    const remote = {node: node, service: 'status', method: 'get'};
    local.comm.send(['nid'], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(id.getNID(node));
        done();
      } catch (error) {
        done(error);
      }
    })
  });

  test('m2: comm.send(routes.get(status.get)) sid', (done) => {
    const remote = {node: node, service: 'status', method: 'get'};
    local.comm.send(['sid'], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(id.getSID(node));
        done();
      } catch (error) {
        done(error);
      }
    })
  });

  test('m2: comm.send(routes.get(status.get)) ip', (done) => {
    const remote = {node: node, service: 'status', method: 'get'};
    local.comm.send(['ip'], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(global.nodeConfig.ip);
        done();
      } catch (error) {
        done(error);
      }
    })
  });

  test('m2: comm.send(routes.get(status.get)) port', (done) => {
    const remote = {node: node, service: 'status', method: 'get'};
    local.comm.send(['port'], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(global.nodeConfig.port);
        done();
      } catch (error) {
        done(error);
      }
    })
  });

  test('m2: comm.send(routes.get(status.get)) counts', (done) => {
    const remote = {node: node, service: 'status', method: 'get'};
    local.comm.send(['counts'], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(typeof v).toEqual('number');
        expect(v >= 0).toBeTruthy();
        done();
      } catch (error) {
        done(error);
      }
    })
  });

  test('m2: comm.send(routes.get(status.get)) heapTotal', (done) => {
    const remote = {node: node, service: 'status', method: 'get'};
    local.comm.send(['heapTotal'], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(typeof v).toEqual('number');
        expect(v >= 0).toBeTruthy();
        done();
      } catch (error) {
        done(error);
      }
    })
  });

  test('m2: comm.send(routes.get(status.get)) heapUsed', (done) => {
    const remote = {node: node, service: 'status', method: 'get'};
    local.comm.send(['heapUsed'], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(typeof v).toEqual('number');
        expect(v >= 0).toBeTruthy();
        done();
      } catch (error) {
        done(error);
      }
    })
  });

  test('m2: comm.send(routes.get(status.get)) invalid config', (done) => {
    const remote = {node: node, service: 'status', method: 'get'};
    local.comm.send(['invalid'], remote, (e, v) => {
      try {
        expect(v).toBeFalsy();
        expect(e instanceof Error).toBeTruthy();
        done();
      } catch (error) {
        done(error);
      }
    })
  })

  test('m2: comm.send(routes.get) invalid service', (done) => {
    const remote = {node: node, service: 'invalid', method: 'get'};
    local.comm.send(['counts'], remote, (e, v) => {
      try {
        expect(v).toBeFalsy();
        expect(e instanceof Error).toBeTruthy();
        done();
      } catch (error) {
        done(error);
      }
    })
  })

  test('m2: comm.send(routes.get) invalid method', (done) => {
    const remote = {node: node, service: 'status', method: 'invalid'};
    local.comm.send(['counts'], remote, (e, v) => {
      try {
        expect(v).toBeFalsy();
        expect(e instanceof Error).toBeTruthy();
        done();
      } catch (error) {
        done(error);
      }
    })
  })

  test('m2: comm.send(routes.put) stateless', (done) => {
    const helloWorld = () => {
      return 'Hello World!';
    }
    const helloWorldRPC = util.wire.createRPC(util.wire.toAsync(helloWorld));
    const service = {
      helloWorld: helloWorldRPC
    };

    const remotePut = {node: node, service: 'routes', method: 'put'};
    const remoteGet = {node: node, service: 'helloWorld', method: 'helloWorld'}
    local.comm.send([service, 'helloWorld'], remotePut, (e, v) => {
      local.comm.send([], remoteGet, (e, v) => {
        try {
          expect(e).toBeFalsy();
          expect(v).toEqual('Hello World!');
          done();
        } catch (error) {
          done(error);
        }
      })
    })
  })

  test('m2: comm.send(routes.put) stateless invalid method', (done) => {
    const helloWorld = () => {
      return 'Hello World!';
    }
    const helloWorldRPC = util.wire.createRPC(util.wire.toAsync(helloWorld));
    const service = {
      helloWorld: helloWorldRPC
    };

    const remotePut = {node: node, service: 'routes', method: 'put'};
    const remoteGet = {node: node, service: 'helloWorld', method: 'hello'}
    local.comm.send([service, 'helloWorld'], remotePut, (e, v) => {
      local.comm.send([], remoteGet, (e, v) => {
        try {
          expect(v).toBeFalsy();
          expect(e instanceof Error).toBeTruthy();
          done();
        } catch (error) {
          done(error);
        }
      })
    })
  })

  test('m2: comm.send(routes.put) stateful', (done) => {
    const message = 'Hello World!';
    const helloWorld = () => {
      return message;
    }
    const helloWorldRPC = util.wire.createRPC(util.wire.toAsync(helloWorld));
    const service = {
      helloWorld: helloWorldRPC
    };

    const remotePut = {node: node, service: 'routes', method: 'put'};
    const remoteGet = {node: node, service: 'helloWorld', method: 'helloWorld'}
    local.comm.send([service, 'helloWorld'], remotePut, (e, v) => {
      local.comm.send([], remoteGet, (e, v) => {
        try {
          expect(e).toBeFalsy();
          expect(v).toEqual(message);
          done();
        } catch (error) {
          done(error);
        }
      })
    })
  })

  test('m2: comm.send(routes.rem) stateless', (done) => {
    const helloWorld = () => {
      return 'Hello World!';
    }
    const helloWorldRPC = util.wire.createRPC(util.wire.toAsync(helloWorld));
    const service = {
      helloWorld: helloWorldRPC
    };

    const remotePut = {node: node, service: 'routes', method: 'put'};
    const remoteRem = {node: node, service: 'routes', method: 'rem'};
    const remoteGet = {node: node, service: 'helloWorld', method: 'helloWorld'}
    local.comm.send([service, 'helloWorld'], remotePut, (e, v) => {
      local.comm.send(['helloWorld'], remoteRem, (e, v) => {
        local.comm.send([], remoteGet, (e, v) => {
          try {
            expect(v).toBeFalsy();
            expect(e instanceof Error).toBeTruthy();
            done();
          } catch (error) {
            done(error);
          }
        })
      })
    })
  })

  test('m2: comm.send(routes.rem) stateful', (done) => {
    const message = 'Hello World!';
    const helloWorld = () => {
      return message;
    }
    const helloWorldRPC = util.wire.createRPC(util.wire.toAsync(helloWorld));
    const service = {
      helloWorld: helloWorldRPC
    };

    const remotePut = {node: node, service: 'routes', method: 'put'};
    const remoteRem = {node: node, service: 'routes', method: 'rem'};
    const remoteGet = {node: node, service: 'helloWorld', method: 'helloWorld'}
    local.comm.send([service, 'helloWorld'], remotePut, (e, v) => {
      local.comm.send(['helloWorld'], remoteRem, (e, v) => {
        local.comm.send([], remoteGet, (e, v) => {
          try {
            expect(v).toBeFalsy();
            expect(e instanceof Error).toBeTruthy();
            done();
          } catch (error) {
            done(error);
          }
        })
      })
    })
  })

  test('m2: comm.send(routes.rem) non-existent service', (done) => {
    const remoteRem = {node: node, service: 'routes', method: 'rem'};
    local.comm.send(['helloWorld'], remoteRem, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toBeFalsy();
        done();
      } catch (error) {
        done(error);
      }
    })
  })
})

// M3 Test Cases

// M4 Test Cases

// M5 Test Cases
