const distribution = require('../config');

const getIndex = (indexGroup, queryGroup, MAX_URLS, URLS_PER_BATCH) => {
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
        const text = value;
        try {
            // Delete data
            await new Promise((resolve, reject) => {
                distribution.index.store.del(url, (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });
            // Process text
            const output = distribution.util.inverter(text, url);
            return output;
        } catch (err) {
            console.log('Error occurred in index mapper: ', err);
            return [];
        }
    }

    const reducer = async (key, values) => {
        const term = key;
        const urlFreqPairs = values;
        try {
            const state = await new Promise((resolve, reject) => {
                distribution.query.store.get({key: term, orEmpty: true}, (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });
            const sortedPairs = urlFreqPairs.sort(distribution.util.compare);
            const newState = distribution.util.mergeSortedArrays(sortedPairs, state, distribution.util.compare);
            await new Promise((resolve, reject) => {
                distribution.query.store.put(newState, term, (err, res) => {
                    if (err) return reject(err);
                    resolve(res);
                });
            });
            return [];
        } catch (err) {
            console.log('Error occurred in index reducer: ', err);
            return [];
        }
    }

    const indexStep = (toIndex, numURLs, cb) => {
        console.log('index step starting')
        // Termination condition
        if (numURLs >= MAX_URLS) {
            console.log('indexed max URLs');
            cb(toIndex);
            return;
        }

        // Get batch
        const batch = toIndex.splice(0, URLS_PER_BATCH);   
        if (batch.length == 0) {
            console.log('toIndex empty');
            cb(toIndex);
            return;
        } else {
            numURLs += batch.length;
        }

        // Call map-reduce
        distribution.index.mr.exec({keys: batch, map: mapper, reduce: reducer}, (e1, v1) => {
            distribution.local.store.put(toIndex, 'toIndex', (e2, v2) => {
                console.log('index step ending');
                indexStep(toIndex, numURLs, cb);
            });
        });
    }

    return (cb) => setupGroups(() => setupList((toIndex) => indexStep(toIndex, 0, cb)));
}

module.exports = {getIndex};