const path = require('node:path');
const fs = require('node:fs');
const id = require('../util/id');
const { index } = require('cheerio/dist/commonjs/api/traversing');

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

function getIndex(term, callback) {
    const nid = id.getNID(global.distribution.node.config);
    const gid = 'query';
    const prefix = term[0];

    const storePath = path.resolve(__dirname, '../../store', nid, gid);
    if (!fs.existsSync(storePath)) {
        fs.mkdirSync(storePath, { recursive: true });
    }
    const indexPath = path.join(storePath, prefix);

    if (!fs.existsSync(indexPath)) {
        callback(null, {});
    } else {
        const serializedState = fs.readFileSync(indexPath, 'utf8');
        const deserializedState = deserializeIndex(serializedState);
        callback(null, deserializedState);
    }
}

function addToIndex(localIndex, callback) {
    const indexByPrefix = new Map();
    for (let o of localIndex) {
        const key = Object.keys(o)[0];
        const prefix = key[0];
        if (indexByPrefix.has(prefix)) {
            indexByPrefix.set(indexByPrefix.get(prefix).append(o));
        } else {
            indexByPrefix.set([o]);
        }
    }

    let counter = 0;
    for (let [prefix, index] of indexByPrefix) {
        getIndex(prefix, (error, globalIndex) => {
            for (let o of index) {
                const key = Object.keys(o)[0];
                const newValues = Object.values(o).sort(global.distribution.util.compare);
                const oldValues = globalIndex[key] || [];
                const values = global.distribution.util.mergeSortedArrays(newValues, oldValues, global.distribution.util.compare);
                globalIndex[key] = values;
            }
    
            const nid = id.getNID(global.distribution.node.config);
            const gid = 'query';
            const storePath = path.resolve(__dirname, '../../store', nid, gid);
            if (!fs.existsSync(storePath)) {
                fs.mkdirSync(storePath, { recursive: true });
            }
            const indexPath = path.join(storePath, prefix);
    
            const serializedIndex = serializeIndex(index);
            fs.writeFileSync(indexPath, serializedIndex, 'utf8');
            counter++;
            if (counter == indexByPrefix.size) {
                callback(null, null);
            }
        });
    }
}

function getKey(key, callback) {
    getIndex(key, (error, globalIndex) => {
        const values = globalIndex[key] || [];
        callback(null, values);
    });
}

module.exports = { addToIndex, getKey };