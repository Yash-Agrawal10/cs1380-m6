const http = require('http');
const url = require('url');
const log = require('../util/log');

const { serialize, deserialize } = require('../util/serialization');
const routes = require('./routes');

/*
    The start function will be called to start your node.
    It will take a callback as an argument.
    After your node has booted, you should call the callback.
*/


const start = function(callback) {
  const server = http.createServer((req, res) => {
    /* Your server will be listening for PUT requests. */

    // Write some code...
    // Handle wrong method
    if (req.method != 'PUT') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      const message = { error: 'Only PUT methods allowed'};
      res.end(serialize(message));
      return;
    }

    /*
      The path of the http request will determine the service to be used.
      The url will have the form: http://node_ip:node_port/service/method
    */


    // Write some code...
    // Parse path for service/method names
    const parsedURL = url.parse(req.url);
    const path = parsedURL.pathname.split('/').filter(Boolean);
    if (path.length != 3) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      const message = { error: 'Invalid Path Length'};
      res.end(serialize(message));
      return;
    }
    const [gid, serviceName, methodName] = path;
    gid;  // Avoid linting for now
    /*

      A common pattern in handling HTTP requests in Node.js is to have a
      subroutine that collects all the data chunks belonging to the same
      request. These chunks are aggregated into a body variable.

      When the req.on('end') event is emitted, it signifies that all data from
      the request has been received. Typically, this data is in the form of a
      string. To work with this data in a structured format, it is often parsed
      into a JSON object using JSON.parse(body), provided the data is in JSON
      format.

      Our nodes expect data in JSON format.

    */

    // Write some code...
    // Collect request
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

      /* Here, you can handle the service requests.
      Use the local routes service to get the service you need to call.
      You need to call the service with the method and arguments provided in the request.
      Then, you need to serialize the result and send it back to the caller.
      */

    // Write some code...
    // Handle request
    req.on('end', () => {
      // Basic response setup
      res.setHeader('Content-Type', 'application/json');

      // Deserialize arguments
      const argString = body;
      const args = deserialize(argString);
      if ((args instanceof Error && args.message == 'Deserialization failed') || !Array.isArray(args)) {
        res.statusCode = 422;
        const body = new Error('Invalid Serialized Arguments');
        res.end(serialize(body));
        return;
      }

      // Debugging
      // console.log(`Incoming Request, Path: ${path}, args: ${args}`);

      // Create service callback
      const serviceCallback = (serviceError, value) => {
        if (serviceError) {
          res.statusCode = 500;
          const body = new Error('Internal Error');
          res.end(serialize(body));
          return;
        } else {
          res.statusCode = 200;
          res.end(serialize(value));
        }
      }

      // Handle rpc method
      if (serviceName == 'rpc') {
        if (global.rpcMap.has(methodName)) {
          const method = global.rpcMap.get(methodName);
          method(...args, serviceCallback);
          return;
        } else {
          res.statusCode = 404;
          const body = new Error('RPC method not found');
          res.end(serialize(body));
          return;
        }
      }

      // Make call to service/method
      const getServiceCallback = (getServiceError, service) => {
        if (getServiceError) {
          res.statusCode = 404;
          const body = new Error('Service not found');
          res.end(serialize(body));
          return;
        }

        if (!service[methodName]) {
          res.statusCode = 404;
          const body = new Error('Method not found');
          res.end(serialize(body));
          return;
        }
        service[methodName](...args, serviceCallback);
      };
      routes.get(serviceName, getServiceCallback);
    })

  });


  /*
    Your server will be listening on the port and ip specified in the config
    You'll be calling the `callback` callback when your server has successfully
    started.

    At some point, we'll be adding the ability to stop a node
    remotely through the service interface.
  */

  server.listen(global.nodeConfig.port, global.nodeConfig.ip, () => {
    log(`Server running at http://${global.nodeConfig.ip}:${global.nodeConfig.port}/`);
    global.distribution.node.server = server;
    callback(server);
  });

  server.on('error', (error) => {
    // server.close();
    log(`Server error: ${error}`);
    throw error;
  });
};

module.exports = {
  start: start,
};
