const distribution = require('../config.js');

const timeSerialization = (list) => {
  const items = list.length;
  const startTime = performance.now();
  const serialized = list.map(distribution.util.serialize);
  const deserialized = serialized.map(distribution.util.deserialize);
  const endTime = performance.now();
  console.log(deserialized);
  const elapsedTime = endTime - startTime;
  const latency = items / elapsedTime;
  return latency;
};

const T2Array = [1, 10, 100,
  'test', 'testing', 'This is a test',
  true, false, null, undefined];

const funcOne = () => {};
function funcTwo(x) {
  return x;
}
const funcThree = (x, y) => {
  return x + y;
};
function funcFour(x) {
  let sum = 0;
  for (const elt of x) {
    sum += elt;
  }
  return sum;
}

const T3Array = [funcOne, funcTwo, funcThree, funcFour];

const T4Array = [{}, {key: 'value'}, {l1: {l2: {l3: {}}}},
  [], [1, 2, 3], ['a', 'b', 'c'], [1, 'b', {key: 'c'}],
  Error(), Error('test'), Date(Date.now()), Date(0)];

const T2Latency = timeSerialization(T2Array);
const T3Latency = timeSerialization(T3Array);
const T4Latency = timeSerialization(T4Array);

console.log(`T2 Latency: ${T2Latency} ms/item`);
console.log(`T3 Latency: ${T3Latency} ms/item`);
console.log(`T4 Latency: ${T4Latency} ms/item`);
