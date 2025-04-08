const getIndex = require('./getIndex');
const { indexGroup, indexOrchestrator, 
    queryGroup, MAX_URLS, URLS_PER_INDEX_BATCH } = require('./searchEngineConfig')
    
global.nodeConfig = indexOrchestrator;
const distribution = require('../distribution');

const index = getIndex(indexGroup, queryGroup, MAX_URLS, URLS_PER_INDEX_BATCH);

const spawnIndexers = (cb) => {
    let counter = 0;
    const nodes = Object.values(indexGroup);
    for (let node of nodes) {
        distribution.local.status.spawn(node, () => {
            counter++;
            if (counter == nodes.length) {
                cb();
            }
        });
    }
}

const setupRoutes = (cb) => {
    const index = getIndex(() => {console.log('Done with indexing batch!!')});
    const indexSerive = {
        index: index,
    }
    distribution.local.routes.put(indexSerive, 'index', () => {
        cb();
    });
}

distribution.node.start((server) => {
    setupRoutes(() => {
        spawnIndexers(() => {
            
        });
    });
});