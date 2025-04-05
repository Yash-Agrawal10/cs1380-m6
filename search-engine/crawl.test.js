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

test('crawl with max 0 urls', (done) => {
    const seedURLs = ['https://www.gutenberg.org/'];
    const MAX_URLS = 0;
    const URLS_PER_BATCH = 10;

    crawl(crawlGroup, indexGroup, indexOrchestrator, 
    seedURLs, MAX_URLS, URLS_PER_BATCH, (toCrawl, visited) => {
        try {
            expect(visited).toBeTruthy();
            expect(visited.length).toEqual(MAX_URLS);
            expect(new Set(visited).size).toEqual(visited.length);
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
    seedURLs, MAX_URLS, URLS_PER_BATCH, (toCrawl, visited) => {
        try {
            expect(visited).toBeTruthy();
            expect(visited.length).toEqual(MAX_URLS);
            expect(new Set(visited).size).toEqual(visited.length);
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
    seedURLs, MAX_URLS, URLS_PER_BATCH, (toCrawl, visited) => {
        try {
            expect(visited).toBeTruthy();
            expect(visited.length).toEqual(MAX_URLS);
            expect(new Set(visited).size).toEqual(visited.length);
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
    seedURLs, MAX_URLS, URLS_PER_BATCH, (toCrawl, visited) => {
        try {
            expect(visited).toBeTruthy();
            expect(visited.length).toEqual(MAX_URLS);
            expect(new Set(visited).size).toEqual(visited.length);
            MAX_URLS = 30;
            crawl(crawlGroup, indexGroup, indexOrchestrator, 
            seedURLs, MAX_URLS, URLS_PER_BATCH, (toCrawl2, visited2) => {
                try {
                    expect(visited2).toBeTruthy();
                    expect(visited2.length).toEqual(MAX_URLS);
                    expect(new Set(visited2).size).toEqual(visited2.length);
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
  crawlGroup[id.getSID(n3)] = n3;

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
