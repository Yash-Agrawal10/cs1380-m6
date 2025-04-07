const { getQuery } = require('./getQuery')

const distribution = require('../config');
const id = distribution.util.id;

const queryGroup = {};

const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};

test('simple index one length', (done) => {
    const term1Index = [{url: 'url-1', freq: 5}, {url: 'url-2', freq: 3}];
    distribution.query.store.put(term1Index, 'term1', () => {
        const query = getQuery(queryGroup);
        query('term1', 1, (v) => {
            try {
                const expected = [{url: 'url-1', freq: 5}];
                expect(JSON.stringify(v)).toBe(JSON.stringify(expected));
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});

test('simple index two length', (done) => {
    const term1Index = [{url: 'url-1', freq: 5}, {url: 'url-2', freq: 3}];
    distribution.query.store.put(term1Index, 'term1', () => {
        const query = getQuery(queryGroup);
        query('term1', 2, (v) => {
            try {
                const expected = [{url: 'url-1', freq: 5}, {url: 'url-2', freq: 3}];
                expect(JSON.stringify(v)).toBe(JSON.stringify(expected));
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});

beforeAll((done) => {
    queryGroup[id.getSID(n1)] = n1;
    queryGroup[id.getSID(n2)] = n2;
    queryGroup[id.getSID(n3)] = n3;

    const startNodes = (cb) => {
        distribution.local.status.spawn(n1, (e, v) => {
        distribution.local.status.spawn(n2, (e, v) => {
            distribution.local.status.spawn(n3, (e, v) => {
                distribution.local.groups.put('query', queryGroup, () => {
                    cb();
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