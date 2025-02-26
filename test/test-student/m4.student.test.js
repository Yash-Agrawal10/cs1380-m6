/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

jest.spyOn(process, 'exit').mockImplementation((n) => { });

const distribution = require('../../config.js');
const id = distribution.util.id;

test('(1 pts) student test - local.mem put, get, del, get', (done) => {
  // Fill out this test case...
  const key = 'mykey';
  const value = {value: 'any'};
  distribution.local.mem.put(value, key, (e0, v0) => {
    expect(e0).toBeFalsy();
    expect(v0).toEqual(value);
    distribution.local.mem.get(key, (e1, v1) => {
      expect(e1).toBeFalsy();
      expect(v1).toEqual(value);
      distribution.local.mem.del(key, (e2, v2) => {
        expect(e2).toBeFalsy();
        expect(v2).toEqual(value);
        distribution.local.mem.get(key, (e3, v3) => {
          expect(e3).toBeTruthy();
          expect(v3).toBeFalsy();
          done();
        });
      });
    });
  });
});

test('(1 pts) student test - local.store put, get, del, get', (done) => {
  // Fill out this test case...
  const key = 'mykey';
  const value = {value: 'any'};
  distribution.local.store.put(value, key, (e0, v0) => {
    expect(e0).toBeFalsy();
    expect(v0).toEqual(value);
    distribution.local.store.get(key, (e1, v1) => {
      expect(e1).toBeFalsy();
      expect(v1).toEqual(value);
      distribution.local.store.del(key, (e2, v2) => {
        expect(e2).toBeFalsy();
        expect(v2).toEqual(value);
        distribution.local.store.get(key, (e3, v3) => {
          expect(e3).toBeTruthy();
          expect(v3).toBeFalsy();
          done();
        });
      });
    });
  });
});

test('(1 pts) student test - put in mem, get in store', (done) => {
  // Fill out this test case...
  const key = 'mykey';
  const value = 'value';
  distribution.local.mem.put(value, key, (e0, v0) => {
    expect(e0).toBeFalsy();
    expect(v0).toEqual(value);
    distribution.local.store.get(key, (e1, v1) => {
      expect(e1).toBeTruthy();
      expect(v1).toBeFalsy();
      done();
    });
  });
});

test('(1 pts) student test - put group A, get group B', (done) => {
  // Fill out this test case...
  const key = 'mykey';
  const value = 'value';
  distribution.mygroup.mem.put(value, key, (e0, v0) => {
    expect(e0).toBeFalsy();
    expect(v0).toEqual(value);
    distribution.mygroupB.mem.get(key, (e1, v1) => {
      expect(e1).toBeTruthy();
      expect(v1).toBeFalsy();
      done();
    });
  });
});

test('(1 pts) student test - rewrite store.put in all', (done) => {
  // Fill out this test case...
  const key = 'mykey';
  const value = 'value';
  const value2 = 'value2';
  distribution.all.store.put(value, key, (e0, v0) => {
    expect(e0).toBeFalsy();
    expect(v0).toEqual(value);
    distribution.all.store.put(value2, key, (e1, v1) => {
      expect(e1).toBeFalsy();
      expect(v1).toEqual(value2);
      distribution.all.store.get(key, (e2, v2) => {
        expect(e2).toBeFalsy();
        expect(v2).toEqual(value2);
        done();
      });
    });
  });
});

test('(1 pts) student test - consistent hashing', (done) => {
  // Fill out this test case...
  const key = 'mykey';
  const keyHash = id.getID(key);

  const nids = nodes.map((node) => id.getNID(node));
  const hash = id.consistentHash(keyHash, nids);
  
  nids.pop();
  const newHash = id.consistentHash(keyHash, nids);

  expect(hash).toEqual(newHash);
  done();
});


/*
    Following is the setup for the tests (taken from store.all.test.js).
*/

const mygroupGroup = {};
const mygroupBGroup = {};

/*
   This is necessary since we can not
   gracefully stop the local listening node.
   This is because the process that node is
   running in is the actual jest process
*/
let localServer = null;

const n1 = {ip: '127.0.0.1', port: 9001};
const n2 = {ip: '127.0.0.1', port: 9002};
const n3 = {ip: '127.0.0.1', port: 9003};
const n4 = {ip: '127.0.0.1', port: 9004};
const n5 = {ip: '127.0.0.1', port: 9005};
const n6 = {ip: '127.0.0.1', port: 9006};

const nodes = [n1, n2, n3, n4, n5, n6];

beforeAll((done) => {
  // First, stop the nodes if they are running
  const remote = {service: 'status', method: 'stop'};

  const fs = require('fs');
  const path = require('path');

  fs.rmSync(path.join(__dirname, '../store'), {recursive: true, force: true});
  fs.mkdirSync(path.join(__dirname, '../store'));

  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        remote.node = n4;
        distribution.local.comm.send([], remote, (e, v) => {
          remote.node = n5;
          distribution.local.comm.send([], remote, (e, v) => {
            remote.node = n6;
            distribution.local.comm.send([], remote, (e, v) => {
              startNodes();
            });
          });
        });
      });
    });
  });

  const startNodes = () => {
    mygroupGroup[id.getSID(n1)] = n1;
    mygroupGroup[id.getSID(n2)] = n2;
    mygroupGroup[id.getSID(n3)] = n3;
    mygroupGroup[id.getSID(n4)] = n4;
    mygroupGroup[id.getSID(n5)] = n5;

    mygroupBGroup[id.getSID(n1)] = n1;
    mygroupBGroup[id.getSID(n2)] = n2;
    mygroupBGroup[id.getSID(n3)] = n3;
    mygroupBGroup[id.getSID(n4)] = n4;
    mygroupBGroup[id.getSID(n5)] = n5;

    // Now, start the nodes listening node
    distribution.node.start((server) => {
      localServer = server;

      const groupInstantiation = () => {
        const mygroupConfig = {gid: 'mygroup'};
        const mygroupBConfig = {gid: 'mygroupB', hash: id.rendezvousHash};

        // Create the groups
        distribution.local.groups.put(mygroupBConfig, mygroupBGroup, (e, v) => {
          distribution.local.groups.put(mygroupConfig, mygroupGroup, (e, v) => {
            distribution.mygroup.groups.put(mygroupConfig, mygroupGroup, (e, v) => {
              done();
            });
          });
        });
      };

      // Start the nodes
      distribution.local.status.spawn(n1, (e, v) => {
        distribution.local.status.spawn(n2, (e, v) => {
          distribution.local.status.spawn(n3, (e, v) => {
            distribution.local.status.spawn(n4, (e, v) => {
              distribution.local.status.spawn(n5, (e, v) => {
                distribution.local.status.spawn(n6, (e, v) => {
                  groupInstantiation();
                });
              });
            });
          });
        });
      });
    });
  };
});

afterAll((done) => {
  const remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        remote.node = n4;
        distribution.local.comm.send([], remote, (e, v) => {
          remote.node = n5;
          distribution.local.comm.send([], remote, (e, v) => {
            remote.node = n6;
            distribution.local.comm.send([], remote, (e, v) => {
              localServer.close();
              done();
            });
          });
        });
      });
    });
  });
});


