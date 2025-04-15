const path = require('node:path');
const fs = require('node:fs');
const id = require('../util/id');

function serializeIndex(indexObj) {
    const optimized = {};
    // Loop over each key and map the list of objects to arrays
    for (const key in indexObj) {
        if (Object.hasOwnProperty.call(indexObj, key)) {
        optimized[key] = indexObj[key].map(item => [item.url, item.freq]);
        }
    }
    return JSON.stringify(optimized, null, 2);
}

function deserializeIndex(data) {
    const parsed = JSON.parse(data);
    const rebuilt = {};
    // Recreate original object structure from the optimized format
    for (const key in parsed) {
        if (Object.hasOwnProperty.call(parsed, key)) {
        rebuilt[key] = parsed[key].map(item => ({
            url: item[0],
            freq: item[1]
        }));
        }
    }
    return rebuilt;
}

function getIndex(callback) {
    const nid = id.getNID(global.distribution.node.config);
    const gid = 'query';
    const storePath = path.resolve(__dirname, '../../store', nid, gid);
    if (!fs.existsSync(storePath)) {
        fs.mkdirSync(storePath, { recursive: true });
    }
    const indexPath = path.join(storePath, 'index');

    if (!fs.existsSync(indexPath)) {
        callback(null, {});
    } else {
        const serializedState = fs.readFileSync(indexPath, 'utf8');
        const deserializedState = deserializeIndex(serializedState);
        callback(null, deserializedState);
    }
}

function addToIndex(localIndex, callback) {
    getIndex((error, globalIndex) => {
        for (let o of localIndex) {
            const key = Object.keys(o)[0];
            const newValues = Object.values(o).sort(global.distribution.util.compare);
            const oldValues = globalIndex[key] || [];
            // console.log('newValues:', newValues, 'oldValues:', oldValues);
            const values = global.distribution.util.mergeSortedArrays(newValues, oldValues, global.distribution.util.compare);
            globalIndex[key] = values;
        }

        const nid = id.getNID(global.distribution.node.config);
        const gid = 'query';
        const storePath = path.resolve(__dirname, '../../store', nid, gid);
        if (!fs.existsSync(storePath)) {
            fs.mkdirSync(storePath, { recursive: true });
        }
        const indexPath = path.join(storePath, 'index');

        const serializedIndex = serializeIndex(globalIndex);
        fs.writeFileSync(indexPath, serializedIndex, 'utf8');
        callback(null, globalIndex);
    });
}

function getKey(key, callback) {
    getIndex((error, globalIndex) => {
        const values = globalIndex[key] || [];
        callback(null, values);
    });
}

module.exports = { addToIndex, getKey };