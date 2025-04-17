const path = require('node:path');
const fs = require('node:fs');
const id = require('../util/id');

const NUM_BUCKETS = 100;

function serializeIndex(indexObj) {
    return Object
    .entries(indexObj)
    .map(([key, list]) => {
        const pairs = list.map(({url, freq}) => [url, freq]);
        return JSON.stringify([ key, pairs ]);
    })
    .join('\n');
}

function deserializeIndex(data) {
    const rebuilt = {};
    for (const line of data.split('\n')) {
        if (!line) continue;
        const [ key, pairs ] = JSON.parse(line);
        rebuilt[key] = pairs.map(([url, freq]) => ({ url, freq }));
    }
    return rebuilt;
}

function getBucket(key, numBuckets = NUM_BUCKETS) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    }
    return (Math.abs(hash) % numBuckets).toString();
}

function getIndex(bucket, callback) {
    const nid = id.getNID(global.distribution.node.config);
    const gid = 'query';
    const storePath = path.resolve(__dirname, '../../store', nid, gid);
    if (!fs.existsSync(storePath)) {
        fs.mkdirSync(storePath, { recursive: true });
    }
    const indexPath = path.join(storePath, bucket);
    if (!fs.existsSync(indexPath)) {
        callback(null, {});
    } else {
        const serializedState = fs.readFileSync(indexPath, 'utf8');
        const deserializedState = deserializeIndex(serializedState);
        callback(null, deserializedState);
    }
}

function addToIndex(localIndex, callback) {
    const indexByBucket = new Map();
    for (const o of localIndex) {
        const key = Object.keys(o)[0];
        const bucket = getBucket(key);
        if (!indexByBucket.has(bucket)) {
            indexByBucket.set(bucket, []);
        }
        indexByBucket.get(bucket).push(o);
    }

    let counter = 0;
    for (const [bucket, index] of indexByBucket.entries()) {
        getIndex(bucket, (error, globalIndex) => {
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
            const indexPath = path.join(storePath, bucket);
    
            const serializedIndex = serializeIndex(globalIndex);
            fs.writeFileSync(indexPath, serializedIndex, 'utf8');
            counter++;
            if (counter == indexByBucket.size) {
                callback(null, null);
            }
        });
    }
}

function getKey(key, callback) {
    const bucket = getBucket(key);
    getIndex(bucket, (error, bucketIndex) => {
        const values = bucketIndex[key] || [];
        callback(null, values);
    });
}

module.exports = { addToIndex, getKey };