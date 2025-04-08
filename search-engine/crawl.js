const { getCrawl } = require('./getCrawl');
const { crawlGroup, crawlOrchestrator, 
    indexGroup, indexOrchestrator, 
    seedURLs, MAX_URLS, URLS_PER_CRAWL_BATCH } = require('./searchEngineConfig')
    
global.nodeConfig = crawlOrchestrator;
const distribution = require('../distribution');
const id = distribution.util.id;

const crawl = getCrawl(crawlGroup, indexGroup, indexOrchestrator, seedURLs, MAX_URLS, URLS_PER_CRAWL_BATCH);

crawl(() => console.log('done crawling!'));