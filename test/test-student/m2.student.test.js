/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const distribution = require('../../config.js');
const local = distribution.local;
const util = distribution.util;
const id = distribution.util.id;
const config = distribution.node.config;

// Test infrastructure

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

// Tests

describe('m2: status - student test', () => {
  test('m2: status.get nid', () => {
    local.status.get('nid', (error, nid) => {
      expect(error).toBeFalsy();
      expect(nid).toEqual(id.getNID(config));
    });
  });

  test('m2: status.get sid - student test', () => {
    local.status.get('sid', (error, sid) => {
      expect(error).toBeFalsy();
      expect(sid).toEqual(id.getSID(config));
    });
  });

  test('m2: status.get ip - student test', () => {
    local.status.get('ip', (error, ip) => {
      expect(error).toBeFalsy();
      expect(ip).toEqual(global.nodeConfig.ip);
    });
  });

  test('m2: status.get port - student test', () => {
    local.status.get('port', (error, port) => {
      expect(error).toBeFalsy();
      expect(port).toEqual(global.nodeConfig.port);
    });
  });

  test('m2: status.get counts - student test', () => {
    local.status.get('counts', (error, counts) => {
      expect(error).toBeFalsy();
      expect(typeof counts).toEqual('number');
    });
  });

  test('m2: status.get heapTotal - student test', () => {
    local.status.get('heapTotal', (error, counts) => {
      expect(error).toBeFalsy();
      expect(typeof counts).toEqual('number');
    });
  });

  test('m2: status.get heapUsed - student test', () => {
    local.status.get('heapUsed', (error, counts) => {
      expect(error).toBeFalsy();
      expect(typeof counts).toEqual('number');
    });
  });

  test('m2: status.get invalid config - student test', () => {
    local.status.get('invalid', (error, value) => {
      expect(error).toBeTruthy();
      expect(value).toBeFalsy();
    });
  });
});

describe('m2: routes', () => {
  test('m2: routes.get status - student test', () => {
    local.routes.get('status', (error, service) => {
      expect(error).toBeFalsy();
      expect(typeof service).toEqual('object');
      expect(typeof service.get).toEqual('function');
    });
  });

  test('m2: routes.get invalid - student test', () => {
    local.routes.get('invalid', (error, service) => {
      expect(error).toBeTruthy();
      expect(service).toBeFalsy();
    });
  });

  test('m2: routes.put - student test', () => {
    const helloWorld = (callback) => {
      callback(null, 'Hello World!');
    };

    const helloWorldService = {
      helloWorld: helloWorld,
    };

    local.routes.put(helloWorldService, 'helloWorld', (error, config) => {
      expect(error).toBeFalsy();
      expect(config).toEqual('helloWorld');
    });
  });

  test('m2: routes.get(routes.put)) - student test', () => {
    const helloWorld = (callback) => {
      callback(null, 'Hello World!');
    };

    const helloWorldService = {
      helloWorld: helloWorld,
    };

    local.routes.put(helloWorldService, 'helloWorld', (error, config) => {
      local.routes.get('helloWorld', (err, service) => {
        expect(err).toBeFalsy();
        expect(typeof service).toEqual('object');
        service.helloWorld((err, val) => {
          expect(err).toBeFalsy();
          expect(val).toEqual('Hello World!');
        });
      });
    });
  });

  test('m2: routes.rem(routes.put) - student test', () => {
    const helloWorld = (callback) => {
      callback(null, 'Hello World!');
    };
    const helloWorldService = {
      helloWorld: helloWorld,
    };
    local.routes.put(helloWorldService, 'helloWorld');

    local.routes.rem('helloWorld', (error, value) => {
      expect(error).toBeFalsy();
      expect(typeof value).toEqual('object');
    });
  });

  test('m2: routes.get(routes.rem(routes.put)) - student test', () => {
    const helloWorld = (callback) => {
      callback(null, 'Hello World!');
    };
    const helloWorldService = {
      helloWorld: helloWorld,
    };
    local.routes.put(helloWorldService, 'helloWorld');

    local.routes.rem('helloWorld', (error, value) => {
      expect(error).toBeFalsy();
      expect(typeof value).toEqual('object');
      local.routes.get('helloWorld', (err, service) => {
        expect(err).toBeTruthy();
        expect(service).toBeFalsy();
      });
    });
  });

  test('m2: routes.rem invalid - student test', () => {
    local.routes.rem('invalid', (error, value) => {
      expect(error).toBeFalsy();
      expect(value).toBeFalsy();
    });
  });
});

describe('m2: comm', () => {
  test('m2: comm.send(routes.get(status.get)) - student test', (done) => {
    const remote = {node: node, service: 'status', method: 'get'};
    local.comm.send(['ip'], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual(node.ip);
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  test('m2: comm.send(routes.get(routes.put)) - student test', (done) => {
    const helloWorld = (callback) => {
      callback(null, 'Hello World!');
    };
    const helloWorldRPC = {
      helloWorld: helloWorld,
    };
    const remote = {node: node, service: 'routes', method: 'put'};
    local.comm.send([helloWorldRPC, 'helloWorld'], remote, (e, v) => {
      try {
        expect(e).toBeFalsy();
        expect(v).toEqual('helloWorld');
        const remote2 = {node: node, service: 'helloWorld', method: 'helloWorld'};
        local.comm.send([], remote2, (err, val) => {
          expect(err).toBeFalsy();
          expect(val).toEqual('Hello World!');
          done();
        });
      } catch (error) {
        done(error);
      }
    });
  });

  test('m2: comm.send(routes.get) invalid service - student test', (done) => {
    const remote = {node: node, service: 'invalid', method: 'get'};
    local.comm.send(['counts'], remote, (e, v) => {
      try {
        expect(v).toBeFalsy();
        expect(e instanceof Error).toBeTruthy();
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  test('m2: comm.send(routes.get) invalid method - student test', (done) => {
    const remote = {node: node, service: 'status', method: 'invalid'};
    local.comm.send(['counts'], remote, (e, v) => {
      try {
        expect(v).toBeFalsy();
        expect(e instanceof Error).toBeTruthy();
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});

describe('m2: rpc', () => {
  test('m2: rpc is created and can send message to itself - student test', (done) => {
    const helloWorld = () => {
      return 'Hello World!';
    };
    const helloWorldRPC = util.wire.createRPC(util.wire.toAsync(helloWorld));
    helloWorldRPC((err, value) => {
      try {
        expect(err).toBeFalsy();
        expect(value).toEqual('Hello World!');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  test('m2: comm.send(routes.put) stateless - student test', (done) => {
    const helloWorld = () => {
      return 'Hello World!';
    };
    const helloWorldRPC = util.wire.createRPC(util.wire.toAsync(helloWorld));
    const service = {
      helloWorld: helloWorldRPC,
    };

    const remotePut = {node: node, service: 'routes', method: 'put'};
    const remoteGet = {node: node, service: 'helloWorld', method: 'helloWorld'};
    local.comm.send([service, 'helloWorld'], remotePut, (e, v) => {
      local.comm.send([], remoteGet, (e, v) => {
        try {
          expect(e).toBeFalsy();
          expect(v).toEqual('Hello World!');
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });

  test('m2: comm.send(routes.put) stateful - student test', (done) => {
    const message = 'Hello World!';
    const helloWorld = () => {
      return message;
    };
    const helloWorldRPC = util.wire.createRPC(util.wire.toAsync(helloWorld));
    const service = {
      helloWorld: helloWorldRPC,
    };

    const remotePut = {node: node, service: 'routes', method: 'put'};
    const remoteGet = {node: node, service: 'helloWorld', method: 'helloWorld'};
    local.comm.send([service, 'helloWorld'], remotePut, (e, v) => {
      local.comm.send([], remoteGet, (e, v) => {
        try {
          expect(e).toBeFalsy();
          expect(v).toEqual(message);
          done();
        } catch (error) {
          done(error);
        }
      });
    });
  });
});

// test('(1 pts) student test', (done) => {
//   // Fill out this test case...
//   done(new Error('Not implemented'));
// });
