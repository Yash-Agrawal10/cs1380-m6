const distribution = require('../config')

const getQuery = (queryGroup) => {
    // Setup group
    const setupGroup = (cb) => {
        distribution.local.groups.put('query', queryGroup, () => {
            cb();
        });
    }

    // Make query
    const makeQuery = (query, count, cb) => {
        distribution.query.store.get(query, (e, v) => {
            v = v || [];
            const output = v.slice(0, count);
            cb(output);
        });
    }

    return (query, count, cb) => setupGroup(() => makeQuery(query, count, cb));
}

module.exports = {getQuery};