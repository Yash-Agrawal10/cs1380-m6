/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const distribution = require('../../config.js');
const { local } = require('@brown-ds/distribution');
const id = distribution.util.id;

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

const n1 = {ip: '127.0.0.1', port: 8000};
const n2 = {ip: '127.0.0.1', port: 8001};
const n3 = {ip: '127.0.0.1', port: 8002};

test('(1 pts) student test - groups.get(groups.del(groups.put)))', (done) => {
  // Fill out this test case...
  const groupA = {};
  groupA[id.getSID(n1)] = n1;
  groupA[id.getSID(n2)] = n2;
  groupA[id.getSID(n3)] = n3;

  distribution.local.groups.put('groupA', groupA, () => {
    distribution.local.groups.del('groupA', (e, v) => {
      expect(e).toBeFalsy();
      expect(v).toBeTruthy();
      distribution.local.groups.get('groupA', (err, val) => {
        expect(err).toBeTruthy();
        expect(val).toBeFalsy();
        done();
      });
    });
  });
});


test('(1 pts) student test - groups.rem(groups.add)', (done) => {
  // Fill out this test case...
  const groupA = {};
  groupA[id.getSID(n1)] = n1;
  groupA[id.getSID(n2)] = n2;

  distribution.local.groups.put('groupA', groupA, () => {
    distribution.local.groups.add('groupA', n3, () => {
      distribution.local.groups.get('groupA', (e, v) => {
        expect(e).toBeFalsy();
        expect(Object.values(v)).toEqual(expect.arrayContaining([n1, n2, n3]));
        distribution.local.groups.rem('groupA', id.getSID(n3), () => {
          distribution.local.groups.get('groupA', (err, val) => {
            expect(err).toBeFalsy();
            expect(Object.values(val)).toEqual(expect.arrayContaining([n1, n2]));
            expect(Object.values(val).length).toEqual(2);
            done();
          })
        })
      });
    });
  });
});


test('(1 pts) student test - local comm gids', (done) => {
  // Fill out this test case...
  const groupA = {};
  groupA[id.getSID(n1)] = n1;

  distribution.local.groups.put('groupA', groupA, () => {
    const remote = {node: distribution.node.config, gid: 'groupA', service: 'status', method: 'get'};
    const message = ['nid'];
    distribution.local.comm.send(message, remote, (e, v) => {
      try {
        expect(Object.keys(e)).toEqual([id.getSID(n1)]);
        expect(Object.keys(v)).toEqual([]);
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});

test('(1 pts) student test - distributed comm', (done) => {
  // Fill out this test case...
  const groupA = {};
  groupA[id.getSID(n1)] = n1;
  groupA[id.getSID(n2)] = n2;

  distribution.local.groups.put('groupA', groupA, () => {
    const remote = {service: 'status', method: 'get'};
    const message = ['nid'];
    distribution.groupA.comm.send(message, remote, (e, v) => {
      try {
        expect(Object.keys(e)).toEqual(expect.arrayContaining([id.getSID(n1), id.getSID(n2)]));
        expect(v).toEqual({});
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});

test('(1 pts) student test - routes.get config', (done) => {
  // Fill out this test case...
  const config = {service: 'status', gid: 'local'};
  local.routes.get(config, (error, service) => {
    expect(error).toBeFalsy();
    service.get('sid', (e, v) => {
      expect(e).toBeFalsy();
      expect(v).toEqual(id.getSID(distribution.node.config));
      done();
    })
  });
});
