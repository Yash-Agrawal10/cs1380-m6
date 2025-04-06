const distribution = require('../config')

const queryGroup = {};

const query = (term, count, cb) => {
    distribution.local.groups.put('query', queryGroup, (e1, v1) => {
        distrubution.query.store.get(term, (e2, v2) => {
            const results = v2;
            const output = results.slice(count);
            cb(output);
        });
    });
}

const args = process.argv.slice(2);
const term = args[0];
const count = args[1] ? parseInt(args[1], 10) : 3;

if (!term) {
    console.error('Usage: node script.js <term> [count]');
    process.exit(1);
}

query(term, count, console.log);
