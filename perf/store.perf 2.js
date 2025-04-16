const distribution = require('../config');
// const { serialize } = require('../distribution/util/serialization');
const id = distribution.util.id;

// Example serialized node to start up other nodes
// const node = {ip: '127.0.0.1', port: 1234, onStart: () => console.log(global.distribution.node.config)};
// console.log(serialize(node));

// c='{"type":"object","value":"{\"ip\":\"{\\\"type\\\":\\\"string\\\",\\\"value\\\":\\\"127.0.0.1\\\"}\",\"port\":\"{\\\"type\\\":\\\"number\\\",\\\"value\\\":\\\"1234\\\"}\",\"onStart\":\"{\\\"type\\\":\\\"function\\\",\\\"value\\\":\\\"() => console.log(global.distribution.node.config)\\\"}\"}"}'

// c='{"type":"object","value":"{\"ip\":\"{\\\"type\\\":\\\"string\\\",\\\"value\\\":\\\"127.0.0.1\\\"}\",\"port\":\"{\\\"type\\\":\\\"number\\\",\\\"value\\\":\\\"1234\\\"}\"}"}'

// ./distribution.js --config "$c"

// Create group of self and IPs (assume nodes have been started)
const mygroup = {};
for (let i = 2; i < process.argv.length; i++) {
    const ip = process.argv[i];
    const node = {ip: ip, port: 1234};
    mygroup[id.getSID(node)] = node;
}

distribution.local.groups.put('mygroup', mygroup, () => {
    // Generate kv-pairs
    const kvpairs = [];
    for (let i = 0; i < 1000; i++) {
        const key = getRandomString(10);
        const value = getRandomObject(0.3);
        kvpairs.push({key, value});
    }

    let insertionStart, insertionEnd, queryStart, queryEnd;
    // Create final callback that prints throughput/latency
    const finalCallback = () => {
        // Times are in ms
        const insertionTime = insertionEnd - insertionStart;
        const queryTime = queryEnd - queryStart;

        // Throughput is items/ms
        const insertionThroughput = kvpairs.length / insertionTime;
        const queryThroughput = kvpairs.length / queryTime;

        // Latency is ms/item
        const insertionLatency = insertionTime / kvpairs.length;
        const queryLatency = queryTime / kvpairs.length;

        // Print
        console.log('Insertion Throughput: ', insertionThroughput, ' items/ms');
        console.log('Query Throughput: ', queryThroughput, ' items/ms');
        console.log('Insertion Latency: ', insertionLatency, ' ms/item');
        console.log('Query Latency: ', queryLatency, ' ms/item');
    }

    // Create callbacks that will execute desired put/get logic
    const queryCallback = (index) => {
        if (index == kvpairs.length) {
            queryEnd = performance.now();
            finalCallback();
        } else {
            if (index == 0) {
                queryStart = performance.now();
            }
            kvpair = kvpairs[index];
            distribution.mygroup.store.get(kvpair.key, (e, v) => {
                console.assert(e == null, e, 'Erorr should be null for gets');
                console.assert(JSON.stringify(v) === JSON.stringify(kvpair.value), v, kvpair.value, 'Value should match local value for gets');
                queryCallback(index + 1);
            });
        }
    };

    const insertionCallback = (index) => {
        if (index == kvpairs.length) {
            insertionEnd = performance.now();
            queryCallback(0);
        } else {
            if (index == 0) {
                insertionStart = performance.now();
            }
            kvpair = kvpairs[index];
            distribution.mygroup.store.put(kvpair.value, kvpair.key, (e, v) => {
                console.assert(e == null, e, 'Erorr should be null for puts');
                console.assert(JSON.stringify(v) === JSON.stringify(kvpair.value), v, kvpair.value, 'Value should match local value for puts');
                insertionCallback(index + 1);
            });
        }
    };

    insertionCallback(0);
});


// Utility
function getRandom(array) {
    let index = Math.floor(Math.random() * array.length);
    return array[index];
}

function getRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += getRandom(characters);
    }
    return result;
}

function getRandomObject(prob) {
    const chars = ['a', 'b', 'c', 'd', 'e'];
    const nums = [1, 2, 3, 4, 5];
    const strings = ['this', 'is', 'my', 'test'];

    const obj = {};
    if (Math.random() < prob) {
        obj.a = getRandomObject(prob / 2);
    } else {
        obj.a = getRandom(chars);
    }

    if (Math.random() < prob) {
        obj.b = getRandomObject(prob / 2);
    } else {
        obj.b = getRandom(nums);
    }

    if (Math.random() < prob) {
        obj.c = getRandomObject(prob / 2);
    } else {
        obj.c = getRandom(strings);
    }

    return obj;
}