const { getIndex } = require('./getIndex');
const { indexGroup, indexOrchestrator, 
    queryGroup, MAX_URLS, URLS_PER_INDEX_BATCH } = require('./searchEngineConfig')
    
const distribution = require('../distribution')(indexOrchestrator);

const index = getIndex(indexGroup, queryGroup, MAX_URLS, URLS_PER_INDEX_BATCH);

distribution.node.start((server) => {
    const indexService = {
        index: (cb) => {index(cb)},
    }
    distribution.local.routes.put(indexService, 'index', () => {
        console.log('ready to start indexing!')
    });
});