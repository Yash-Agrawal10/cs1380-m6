/** @typedef {import("../types").Callback} Callback */
/** @typedef {import("../types").Node} Node */

const http = require('node:http');
const { serialize } = require('../util/serialization');

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

    // Create request (might need updates for error handling)
    const req = http.request(options, (res) => {
        let body = '';

        if (res.statusCode >= 200 || res.statusCode < 300) {
            res.on('data', (chunk) => {
                body += chunk;
            });
    
            res.on('end', () => {
                callback(null, body);
            })
        }
        else {
            callback(new Error(`Invalid Status Code: ${res.statusCode}`), null);
        }
    })

    // Send request
    req.on('error', (e) => {
        callback(e, null);
    })
    req.write(serializedArgs);
    req.end();
}

module.exports = {send};
