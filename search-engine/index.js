const distribution = require('../config');

const index = (indexGroup, queryGroup, URLS_PER_BATCH, cb) => {
    // Set up toIndex list
    const setupList = (callback) => {
        // Initialize toIndex list
        distribution.local.store.get('toIndex', (e1, v1) => {
            const toIndex = v1 || [];
            distribution.local.store.put(toIndex, 'toIndex', (e2, v2) => {
                callback(toIndex);
            });
        });
    }

    // Set up groups
    const setupGroups = (callback) => {
        // Set up index group on orchestrator
        distribution.local.groups.put('index', indexGroup, (e1, v1) => {
            // Set up index group on workers
            distribution.index.groups.put('index', indexGroup, (e2, v2) => {
                // Set up query group on workers and orchestrator
                distribution.index.groups.put('query', queryGroup, (e3, v3) => {
                    distribution.local.groups.put('query', queryGroup, (e4, v4) => {
                        callback();
                    });
                });
            });
        });
    }

    // Define map and reduce functions
    const mapper = async (key, value) => {
        const url = key;
        try {
            const text = await new Promise((resolve, reject) => {
                distribution.index.store.get(url, (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });

            // Process text, counting words and stuff
            // Return [{term: {url, freq}}]
        } catch (err) {
            console.log('Error occurred in index mapper: ', err);
            return [];
        }
    }

    const reducer = async (key, values) => {
        const term = key;
        const urlFreqPairs = values;
        try {
            await new Promise((resolve, reject) => {
                distribution.query.store.append(urlFreqPairs, term, queryGroup, (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });
            return [{[term]: urlFreqPairs}];
        } catch (err) {
            console.log('Error occurred in index reducer');
        }
    }
}