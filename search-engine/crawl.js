const getCrawl = require('./getCrawl');
const { crawlGroup, crawlOrchestrator, 
    indexGroup, indexOrchestrator, 
    seedURLs, MAX_URLS, URLS_PER_CRAWL_BATCH } = require('./searchEngineConfig')
    
global.nodeConfig = crawlOrchestrator;
const distribution = require('../distribution');

const crawl = getCrawl(crawlGroup, indexGroup, indexOrchestrator, seedURLs, MAX_URLS, URLS_PER_CRAWL_BATCH);

const spawnCrawlers = (cb) => {
    let counter = 0;
    const nodes = Object.values(crawlGroup);
    for (let node of nodes) {
        distribution.local.status.spawn(node, () => {
            counter++;
            if (counter == nodes.length) {
                cb();
            }
        });
    }
}

spawnCrawlers(() => crawl(() => {console.log('Done crawling!!')}));