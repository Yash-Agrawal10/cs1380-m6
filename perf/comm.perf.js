const distribution = require('../config');

const config = {ip: '127.0.0.1', port: 8080};

const startTime = performance.now();

distribution.local.status.spawn(config, () => console.log('spawned'));

const endTime = performance.now();

const elapsedTime = endTime - startTime;
const throughput = elapsedTime / targetCount * 1000;
const latency = targetCount / elapsedTime;

console.log(`Comm throughput: ${throughput} items/ms`);
console.log(`Comm latency: ${latency} ms/item`);
