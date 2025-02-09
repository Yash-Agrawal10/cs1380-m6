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
    callback = callback || function() { };

    const serializedArgs = serialize(message);
    const ip = remote.node.ip;
    const port = remote.node.port;
    const gid = 'local';
    const service = remote.service;
    const method = remote.method;
    const path = `/${gid}/${service}/${method}`;

    const options = {
        hostname: ip,
        port: port,
        path: path,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(serializedArgs)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                callback(null, parsedData);
            } catch (error) {
                return callback(error, null);
            }
        })
    })

    req.on('error', (error) => {
        callback(error, null);
    })

    req.write(serializedArgs);
    req.end();
}

module.exports = {send};
