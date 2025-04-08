const serialization = require('./serialization');
const id = require('./id');
const wire = require('./wire');
const { compare } = require('./compare');
const { inverter } = require('./inverter/inverter.js');

module.exports = {
  serialize: serialization.serialize,
  deserialize: serialization.deserialize,
  id: id,
  wire: wire,
  compare: compare,
  inverter: inverter,
};
