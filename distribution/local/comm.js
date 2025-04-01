/** @typedef {import("../types").Callback} Callback */
/** @typedef {import("../types").Node} Node */

const http = require('node:http');
const {serialize, deserialize} = require('../util/serialization');

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
  message = message || []

  // Serialize the message
  let serializedMessage = serialize(message)
  let gid = remote.gid || 'local'
  // Build path
  let path = '/' + gid + '/' + remote.service + '/' + remote.method
  // Set up options object for http.request
  let options = {
      hostname: remote.node.ip,
      port: remote.node.port,
      path: path,
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(serializedMessage)
      }
  }

  const req = http.request(options, (res) => {
      let data = ''

      // Handle data chunks
      res.on('data', (chunk) => {
          data += chunk
      })

      // Handle end of response
      res.on('end', () => {
          let trueData = deserialize(data)
          if (res.statusCode >= 200 || res.statusCode < 300) {
              let error = trueData.error
              let value = trueData.value
              callback(error, value)
              return
          }
          const message = `Request failed with status code ${req.statusCode}: ${data}`;
          callback(new Error(message), null);
      })
  })

  // Handle network errors
  req.on('error', (err) => {
      callback(err)  // Pass the error to the callback
  })

  req.write(serializedMessage)
  req.end()
}

module.exports = {send};
