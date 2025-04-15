const serialization = require('./serialization');
const id = require('./id');
const wire = require('./wire');
const { compare } = require('./compare');
const { process, } = require('./process.js');
const { mergeSortedArrays } = require('./mergeArrays.js')

module.exports = {
  serialize: serialization.serialize,
  deserialize: serialization.deserialize,
  id: id,
  wire: wire,
  compare: compare,
  process: process,
  mergeSortedArrays: mergeSortedArrays,
};
