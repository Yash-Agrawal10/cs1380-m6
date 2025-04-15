const distribution = require('../config.js');
const id = distribution.util.id;

/*
    Example startup command for node using terminal
    const node = {ip: '127.0.0.1', port: 1234};
    ./distribution.js --ip '127.0.0.1' --port 7112
*/

/*
    Example to kill process on certain port
    Show: lsof -i :<port>
    Kill: kill -9 $(lsof -t -i :<port>)
*/

/*
    Usage instructions:
    1. Start all worker nodes using terminal (./distribution.js --ip '127.0.0.1' --port 1234)
    2. Start index orchestrator using index.js (node search-engine/index.js)
    3. Start crawl orchestrator using crawl.js (node search-engine/crawl.js)
    4. Query generated index using query.js (node search-engine/query.js <term>)
*/

// Orchestrators
const crawlOrchestrator = {ip: '127.0.0.1', port: 7110, onStart: () => {console.log(global.nodeConfig)}}; 
const indexOrchestrator = {ip: '127.0.0.1', port: 7111, onStart: () => {console.log(global.nodeConfig)}};

// Workers
const crawlWorkerOne = {ip: '127.0.0.1', port: 7112, onStart: () => {console.log(global.nodeConfig)}};
const crawlWorkerTwo = {ip: '127.0.0.1', port: 7113, onStart: () => {console.log(global.nodeConfig)}};
const crawlWorkerThree = {ip: '127.0.0.1', port: 7114, onStart: () => {console.log(global.nodeConfig)}};
const indexWorkerOne = {ip: '127.0.0.1', port: 7115, onStart: () => {console.log(global.nodeConfig)}};
const queryWorkerOne = {ip: '127.0.0.1', port: 7116, onStart: () => {console.log(global.nodeConfig)}};
const queryWorkerTwo = {ip: '127.0.0.1', port: 7117, onStart: () => {console.log(global.nodeConfig)}};

const crawlGroup = {
    [id.getSID(crawlOrchestrator)]: crawlOrchestrator,
    [id.getSID(crawlWorkerOne)]: crawlWorkerOne,
    [id.getSID(crawlWorkerTwo)]: crawlWorkerTwo,
    [id.getSID(crawlWorkerThree)]: crawlWorkerThree,
};

const indexGroup = {
    [id.getSID(indexOrchestrator)]: indexOrchestrator,
    [id.getSID(indexWorkerOne)]: indexWorkerOne,
};

const queryGroup = {
    [id.getSID(queryWorkerOne)]: queryWorkerOne,
    [id.getSID(queryWorkerTwo)]: queryWorkerTwo,
};

const seedURLs = ['https://www.usenix.org/publications/proceedings'];

const MAX_URLS = 1000;
const URLS_PER_CRAWL_BATCH = 30;
const URLS_PER_INDEX_BATCH = 30;

module.exports = {
    crawlGroup, indexGroup, queryGroup,
    crawlOrchestrator, indexOrchestrator,
    seedURLs, MAX_URLS, URLS_PER_CRAWL_BATCH, URLS_PER_INDEX_BATCH
}