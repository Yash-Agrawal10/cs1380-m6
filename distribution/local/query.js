const distribution = require('../../config');

function getIndex(callback) {
    distribution.local.store.get('index', (e, v) => {
        if (v == null) {
            callback(null, []);
        } else {
            callback(null, v);
        }
    });
}

function addToIndex(localIndex, callback) {
    getIndex((error, globalIndex) => {
        for (let o of localIndex) {
            const key = Object.keys(o)[0];
            const newValues = Object.values(o).sort(distribution.util.compare);
            const oldValues = globalIndex[key] || [];
            const values = distribution.util.mergeSortedArrays(newValues, oldValues, distribution.util.compare);
            globalIndex[key] = values;
        }
        distribution.local.store.put(globalIndex, 'index', () => {
            callback(null, globalIndex);
        });
    });
}

function getKey(key, callback) {
    getIndex((error, globalIndex) => {
        const values = globalIndex[key] || [];
        callback(null, values);
    });
}

module.exports = { addToIndex };