/** @typedef {import("../types").Callback} Callback */
/** @typedef {import("../types").Node} Node */

const http = require('node:http');
const { serialize, deserialize } = require('../util/serialization');

/**
 * @typedef {Object} Target
 * @property {string} service
 * @property {string} method
 * @property {Node} node
 */

/**
 * @param {Array} message
 * @param {Target} remote
 * @param {Callback} [callback]
 * @return {void}
 */
function send(message, remote, callback) {
    // Handle parameters
    message = message || [];
    callback = callback || function() { };
    // No default for remote, might change later
    if (!Array.isArray(message) || typeof callback != 'function' || typeof remote != 'object') {
        callback(new Error('Invalid parameters'), null);
        return;
    }

    // Set up message
    const serializedArgs = serialize(message);
    // first path arg is 'gid', only local for now
    const path = `/local/${remote.service}/${remote.method}`;
    const options = {
        hostname: remote.node.ip,
        port: remote.node.port,
        path: path,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(serializedArgs)
        }
    };

    // Create request
    const req = http.request(options, (res) => {
        let body = '';

        res.on('data', (chunk) => {
            body += chunk;
        });

        res.on('end', () => {
            console.log(`BODY: ${body}`);
            const rc = deserialize(body);
            console.log(`RC: ${rc}`);
            if (res.statusCode >= 200 || res.statusCode < 300) {
                if (rc instanceof Error) {
                    callback(rc, null);
                } else {
                    callback(null, rc);
                }
            } else {
                const message = `Request failed with status code ${req.statusCode}: ${body}`;
                callback(new Error(message), null);
            }
        })
    })

    // Send request
    req.on('error', (e) => {
        callback(e, null);
    })
    req.write(serializedArgs);
    req.end();
}

module.exports = {send};
