const { crawl } = require('./crawl');

const seedURLs = ['https://www.gutenberg.org/'];

const distribution = require('../config.js');
const id = distribution.util.id;

const crawlGroup = {};
const indexGroup = {};
const indexOrchestrator = null;
const MAX_URLS = 30;
const URLS_PER_BATCH = 10;

/*
    The local node will be the orchestrator.
*/
let localServer = null;

const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};

test('crawl', (done) => {
    crawl(crawlGroup, indexGroup, indexOrchestrator, 
    seedURLs, MAX_URLS, URLS_PER_BATCH, (toCrawl, visited) => {
        try {
            console.log(toCrawl);
            console.log(visited);
            expect(visited).toBeTruthy();
            expect(visited.length).toEqual(MAX_URLS);
            done();
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
    distribution.local.store.del('toCrawl', () => {
        distribution.local.store.del('visited', () => {
            startNodes(() => done());
        });
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
