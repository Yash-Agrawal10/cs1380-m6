const { getQuery } = require('./getQuery')
const { queryGroup } = require('./searchEngineConfig');
const natural = require('natural');

const query = getQuery(queryGroup);

const args = process.argv.slice(2);
const term = natural.PorterStemmer.stem(args[0]);
const count = args[1] ? parseInt(args[1], 10) : 3;

if (!term) {
    console.error('Usage: node script.js <term> [count]');
    process.exit(1);
}

query(term, count, console.log);