const { getQuery } = require('./getQuery')
const { queryGroup } = require('./searchEngineConfig');
const natural = require('natural');

const query = getQuery(queryGroup);

const termList = ["usenix", "test", "research", "random", "day", 
"month", "year", "author", "paper", "acaedmic", "computer", "science"];

const repeats = 1000;
const count = termList.length * repeats;

const startTime = performance.now();

let counter = 0;
for (let i = 0; i < count; i++) {
    const term = termList[i % termList.length];
    const resCount = Math.floor(Math.random() * 10) + 1;
    query(term, resCount, (response) => {
        console.log(response);
        if (counter == count) {
            const endTime = performance.now();
            const time = endTime - startTime;
            // Throughput in items/ms
            const throughput = count / time; 
            // Latency in ms/item
            const latency = time / count;
            console.log(`Throughput: ${throughput} items/ms`);
            console.log(`Latency: ${latency} ms/item`);
        }
    });
}