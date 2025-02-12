const distribution = require('../config');
const local = distribution.local;

const node = distribution.node.config;
const remote = {node: node, service: 'status', method: 'get'};
const message = ['nid'];

const startTime = performance.now();

const targetCount = 5;
for (let i = 0; i < targetCount; i++)
  local.comm.send(message, remote, () => {});

const endTime = performance.now();

const elapsedTime = endTime - startTime;
const throughput = elapsedTime / targetCount * 1000;
const latency = targetCount / elapsedTime;

console.log(`Comm throughput: ${throughput} items/ms`);
console.log(`Comm latency: ${latency} ms/item`);
