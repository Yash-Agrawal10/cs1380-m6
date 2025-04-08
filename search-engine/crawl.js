const { getCrawl } = require('./getCrawl');
const { crawlGroup, crawlOrchestrator, 
    indexGroup, indexOrchestrator, 
    seedURLs, MAX_URLS, URLS_PER_CRAWL_BATCH } = require('./searchEngineConfig')
    
const distribution = require('../distribution')(crawlOrchestrator);

const crawl = getCrawl(crawlGroup, indexGroup, indexOrchestrator, seedURLs, MAX_URLS, URLS_PER_CRAWL_BATCH);

distribution.node.start((server) => {
    crawl(() => console.log('done crawling!'));
});