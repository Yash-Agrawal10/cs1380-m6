// const distribution = require('../config');
// const local = distribution.local;

// function cb() {
//     console.log('spawned');
// }
// const config = {ip: "127.0.0.1", port: 8000, onStart: cb};
// const iterations = 1;

// console.log('spawning');

// const startTime = performance.now();
// local.status.spawn(config);
// const endTime = performance.now();

// const elapsedTime = endTime - startTime;

// const throughput = iterations / elapsedTime;
// const latency = elapsedTime / iterations;

// console.log(`Comm throughput: ${throughput} items/ms`);
// console.log(`Comm latency: ${latency} ms/item`);

const distribution = require('../config');
const config = {ip: "127.0.0.1", port: 8004};
distribution.local.status.spawn(config, () => console.log('spawned'));