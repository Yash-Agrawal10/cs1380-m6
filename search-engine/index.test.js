const { getIndex } = require('./getIndex.js');

const distribution = require('../config.js');
const id = distribution.util.id;

const indexGroup = {};
const queryGroup = {};

/*
    The local node will be the orchestrator.
*/
let localServer = null;

const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    // Sort both arrays and check equality
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();

    for (let i = 0; i < sortedArr1.length; i++) {
        if (sortedArr1[i] !== sortedArr2[i]) return false;
    }

    return true;
}

test('index with max 1 url', (done) => {
    const MAX_URLS = 1;
    const URLS_PER_BATCH = 5;
    const index = getIndex(indexGroup, queryGroup, MAX_URLS, URLS_PER_BATCH);
    distribution.local.store.put(['url-one'], 'toIndex', () => {
        distribution.index.store.put("this is a test", 'url-one', () => {
            distribution.query.store.del('term1', () => {
              distribution.query.store.del('term2', () => {
                index(() => {
                    distribution.query.store.get('term1', (e, v) => {
                        try {
                          expect(JSON.stringify(v)).toBe(JSON.stringify([{url: 'url-one', freq: 1}]));
                          distribution.query.store.get('term2', (e2, v2) => {
                            try {
                              expect(JSON.stringify(v2)).toBe(JSON.stringify([{url: 'url-one', freq: 2}]));
                              done();
                            } catch (err) {
                              done(err);
                            }
                          });
                        } catch (err) {
                          done(err);
                        }
                    });
                });
              });
            });
        });
    });
});

/*
    Test setup and teardown
*/

beforeAll((done) => {

  indexGroup[id.getSID(n1)] = n1;
  indexGroup[id.getSID(n2)] = n2;

  queryGroup[id.getSID(n3)] = n3;

  const startNodes = (cb) => {
    distribution.local.status.spawn(n1, (e, v) => {
      distribution.local.status.spawn(n2, (e, v) => {
        distribution.local.status.spawn(n3, (e, v) => {
            distribution.local.groups.put('index', indexGroup, (e, v) => {
                distribution.local.groups.put('query', queryGroup, (e, v) => {
                    cb();
                });
            });
        });
      });
    });
  };

  distribution.node.start((server) => {
    distribution.local.groups.put()
    localServer = server;
    startNodes(() => done());
  });
});

beforeEach((done) => {
    distribution.local.store.del('toIndex', () => {
        // Should delete all index data as well, not sure how though
        done();
    });
});

afterAll((done) => {
  const remote = {service: 'status', method: 'stop'};
  remote.node = n1;
  distribution.local.comm.send([], remote, (e, v) => {
    remote.node = n2;
    distribution.local.comm.send([], remote, (e, v) => {
      remote.node = n3;
      distribution.local.comm.send([], remote, (e, v) => {
        localServer.close();
        done();
      });
    });
  });
});
