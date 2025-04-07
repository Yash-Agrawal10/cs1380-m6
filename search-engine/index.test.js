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

function stringAndSort(arr) {
  return arr.map((o) => JSON.stringify(o)).sort();
}

function arraysEqual(arr1, arr2) {
    console.log(arr1, arr2);
    if (arr1.length !== arr2.length) return false;

    // Sort both arrays and check equality
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();

    for (let i = 0; i < sortedArr1.length; i++) {
        if (sortedArr1[i] !== sortedArr2[i]) return false;
    }

    return true;
}

function valid(arr1, arr2) {
  return arraysEqual(stringAndSort(arr1), stringAndSort(arr2));
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
                          expect(valid(v, [{url: 'url-one', freq: 1}])).toBeTruthy();
                          distribution.query.store.get('term2', (e2, v2) => {
                            try {
                              expect(valid(v2, [{url: 'url-one', freq: 2}])).toBeTruthy();
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

test('index with max 2 urls', (done) => {
  const MAX_URLS = 2;
  const URLS_PER_BATCH = 5;
  const index = getIndex(indexGroup, queryGroup, MAX_URLS, URLS_PER_BATCH);
  distribution.local.store.put(['url-one', 'url-two'], 'toIndex', () => {
      distribution.index.store.put("this is a test", 'url-one', () => {
        distribution.index.store.put("this is also a test", 'url-two', () => {
          distribution.query.store.del('term1', () => {
            distribution.query.store.del('term2', () => {
              index(() => {
                  distribution.query.store.get('term1', (e, v) => {
                      try {
                        const expected = [{url: 'url-one', freq: 1}, {url: 'url-two', freq: 1}];
                        console.log(v, expected);
                        expect(valid(v, expected)).toBeTruthy();
                        distribution.query.store.get('term2', (e2, v2) => {
                          try {
                            const expected2 = [{url: 'url-one', freq: 2}, {url: 'url-two', freq: 2}];
                            expect(valid(v2, expected2)).toBeTruthy();
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
