const { crawl } = require('./crawl');

const distribution = require('../config.js');
const id = distribution.util.id;

const crawlGroup = {};
const indexGroup = {};
const indexOrchestrator = null;

/*
    The local node will be the orchestrator.
*/
let localServer = null;

const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};

const checkValid = async (MAX_URLs, visited) => {
    if (!visited || MAX_URLs !== visited.length) {
      return false;
    } else if (new Set(visited).size != visited.length) {
        return false;
    }
  
    for (let url of visited) {
        try {
            const result = await new Promise((resolve, reject) => {
                distribution.index.store.get(url, (err, res) => {
                if (err || res == null) return reject(err || new Error('Not found'));
                resolve(res);
                });
            });
        } catch (err) {
            return false;
        }
    }
  
    return true;
};

test('crawl with max 0 urls', (done) => {
    const seedURLs = ['https://www.gutenberg.org/'];
    const MAX_URLS = 0;
    const URLS_PER_BATCH = 10;

    crawl(crawlGroup, indexGroup, indexOrchestrator, 
    seedURLs, MAX_URLS, URLS_PER_BATCH, async (toCrawl, visited) => {
        try {
            expect(await checkValid(MAX_URLS, visited)).toBeTruthy();
            done();
        } catch (err) {
            done(err);
        }
    });
});

test('crawl with max 1 url', (done) => {
    const seedURLs = ['https://www.gutenberg.org/'];
    const MAX_URLS = 1;
    const URLS_PER_BATCH = 10;

    crawl(crawlGroup, indexGroup, indexOrchestrator, 
    seedURLs, MAX_URLS, URLS_PER_BATCH, async (toCrawl, visited) => {
        try {
            expect(await checkValid(MAX_URLS, visited)).toBeTruthy();
            done();
        } catch (err) {
            done(err);
        }
    });
});

test('crawl with normal small workload', (done) => {
    const seedURLs = ['https://www.gutenberg.org/'];
    const MAX_URLS = 30;
    const URLS_PER_BATCH = 10;

    crawl(crawlGroup, indexGroup, indexOrchestrator, 
    seedURLs, MAX_URLS, URLS_PER_BATCH, async (toCrawl, visited) => {
        try {
            expect(await checkValid(MAX_URLS, visited)).toBeTruthy();
            done();
        } catch (err) {
            done(err);
        }
    });
});

test('crawl with stop in between', (done) => {
    const seedURLs = ['https://www.gutenberg.org/'];
    let MAX_URLS = 15;
    const URLS_PER_BATCH = 10;

    crawl(crawlGroup, indexGroup, indexOrchestrator, 
    seedURLs, MAX_URLS, URLS_PER_BATCH, async (toCrawl, visited) => {
        try {
            expect(await checkValid(MAX_URLS, visited)).toBeTruthy();
            MAX_URLS = 30;
            crawl(crawlGroup, indexGroup, indexOrchestrator, 
            seedURLs, MAX_URLS, URLS_PER_BATCH, async (toCrawl2, visited2) => {
                try {
                    expect(await checkValid(MAX_URLS, visited2)).toBeTruthy();
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

/*
    Test setup and teardown
*/

beforeAll((done) => {
  crawlGroup[id.getSID(n1)] = n1;
  crawlGroup[id.getSID(n2)] = n2;

  indexGroup[id.getSID(n3)] = n3;

  const startNodes = (cb) => {
    distribution.local.status.spawn(n1, (e, v) => {
      distribution.local.status.spawn(n2, (e, v) => {
        distribution.local.status.spawn(n3, (e, v) => {
          cb();
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
    distribution.local.store.del('toCrawl', () => {
        distribution.local.store.del('visited', () => {
            done();
        });
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
