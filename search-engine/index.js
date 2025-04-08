const { getIndex } = require('./getIndex');
const { indexGroup, indexOrchestrator, 
    queryGroup, MAX_URLS, URLS_PER_INDEX_BATCH } = require('./searchEngineConfig')
    
global.nodeConfig = indexOrchestrator;
const distribution = require('../distribution');

const index = getIndex(indexGroup, queryGroup, MAX_URLS, URLS_PER_INDEX_BATCH);

distribution.node.start((server) => {
    const indexService = {
        index: () => {index(() => {console.log('done with indexing batch!')})},
    }
    distribution.local.routes.put(indexService, 'index', () => {
        console.log('ready to start indexing!')
    });
});