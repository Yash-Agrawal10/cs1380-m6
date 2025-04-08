const distribution = require('../config.js');
const id = distribution.util.id;

/*
    Example serialized node to start up other nodes
    const node = {ip: '127.0.0.1', port: 1234, onStart: () => console.log(global.distribution.node.config)};

    c='{"type":"object","value":"{\"ip\":\"{\\\"type\\\":\\\"string\\\",\\\"value\\\":\\\"127.0.0.1\\\"}\",\"port\":\"{\\\"type\\\":\\\"number\\\",\\\"value\\\":\\\"1234\\\"}\",\"onStart\":\"{\\\"type\\\":\\\"function\\\",\\\"value\\\":\\\"() => console.log(global.distribution.node.config)\\\"}\"}"}'

    ./distribution.js --config "$c"
*/

/*
    Example to kill process on certain port
    Show: lsof -i :<port>
    Kill: kill -9 $(lsof -t -i :<port>)
*/

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

const seedURLs = ['https://www.gutenberg.org/'];

const MAX_URLS = 25;
const URLS_PER_CRAWL_BATCH = 10;
const URLS_PER_INDEX_BATCH = 10;

module.exports = {
    crawlGroup, indexGroup, queryGroup,
    crawlOrchestrator, indexOrchestrator, queryOrchestrator,
    seedURLs,
    MAX_URLS, URLS_PER_CRAWL_BATCH, URLS_PER_INDEX_BATCH
}