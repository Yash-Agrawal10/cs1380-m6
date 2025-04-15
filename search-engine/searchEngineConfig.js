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

/*
N1: 172.31.5.125 -> CrawlOrchestrator | node distribution.js --ip '172.31.5.125' --port 7110
N2: 172.31.4.204 -> IndexOrchestrator | node --max-old-space-size=4096 search-engine/index.js TODO:

N3: 172.31.5.207 -> crawlWorkerOne | node distribution.js --ip '172.31.5.207' --port 7110
N4: 172.31.14.200 -> crawlWorkerTwo | node distribution.js --ip '172.31.14.200' --port 7110
N5: 172.31.13.134 -> crawlWorkerThree | node distribution.js --ip '172.31.13.134' --port 7110
N6: 172.31.5.90 -> indexWorkerOne | node distribution.js --ip '172.31.5.90' --port 7110
N7: 172.31.5.40 -> queryWorkerOne | node distribution.js --ip '172.31.5.40' --port 7110
N8: 172.31.12.83 -> queryWorkerTwo | node distribution.js --ip '172.31.12.83' --port 7110
*/


// Orchestrators
const crawlOrchestrator = {ip: '172.31.5.125', port: 7110, onStart: () => {console.log(global.nodeConfig)}}; 
const indexOrchestrator = {ip: '172.31.12.83', port: 7110, onStart: () => {console.log(global.nodeConfig)}};

// Workers
const crawlWorkerOne = {ip: '172.31.5.207', port: 7110, onStart: () => {console.log(global.nodeConfig)}};
// const crawlWorkerTwo = {ip: '172.31.14.200', port: 7110, onStart: () => {console.log(global.nodeConfig)}};
// const crawlWorkerThree = {ip: '172.31.13.134', port: 7110, onStart: () => {console.log(global.nodeConfig)}};
const indexWorkerOne = {ip: '172.31.5.90', port: 7110, onStart: () => {console.log(global.nodeConfig)}};
const queryWorkerOne = {ip: '172.31.5.40', port: 7110, onStart: () => {console.log(global.nodeConfig)}};
// const queryWorkerTwo = {ip: '172.31.12.83', port: 7110, onStart: () => {console.log(global.nodeConfig)}};
// const queryWorkerThree = {ip: '127.0.0.1', port: 7118, onStart: () => {console.log(global.nodeConfig)}};

const crawlGroup = {
    [id.getSID(crawlOrchestrator)]: crawlOrchestrator,
    [id.getSID(crawlWorkerOne)]: crawlWorkerOne,
    // [id.getSID(crawlWorkerTwo)]: crawlWorkerTwo,
    // [id.getSID(crawlWorkerThree)]: crawlWorkerThree,
};

const indexGroup = {
    [id.getSID(indexOrchestrator)]: indexOrchestrator,
    [id.getSID(indexWorkerOne)]: indexWorkerOne,
};

const queryGroup = {
    [id.getSID(queryWorkerOne)]: queryWorkerOne,
    // [id.getSID(queryWorkerTwo)]: queryWorkerTwo,
    // [id.getSID(queryWorkerThree)]: queryWorkerThree,
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