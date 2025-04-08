const distribution = require('../config.js');
const id = distribution.util.id;

const n1 = {ip: '127.0.0.1', port: 7110};
const n2 = {ip: '127.0.0.1', port: 7111};
const n3 = {ip: '127.0.0.1', port: 7112};
const n4 = {ip: '127.0.0.1', port: 7113};
const n5 = {ip: '127.0.0.1', port: 7114};

const crawlGroup = {
    [id.getSID(n1)]: n1,
    [id.getSID(n2)]: n2,
};

const indexGroup = {
    [id.getSID(n3)]: n3,
    [id.getSID(n4)]: n4,
};

const queryGroup = {
    [id.getSID(n5)]: n5,
};

const crawlOrchestrator = n1;
const indexOrchestrator = n3;
const queryOrchestrator = n5;

const seedURLs = [];

const MAX_URLS = 0;
const URLS_PER_CRAWL_BATCH = 0;
const URLS_PER_INDEX_BATCH = 0;

module.exports = {
    crawlGroup, indexGroup, queryGroup,
    crawlOrchestrator, indexOrchestrator, queryOrchestrator,
    seedURLs,
    MAX_URLS, URLS_PER_CRAWL_BATCH, URLS_PER_INDEX_BATCH
}