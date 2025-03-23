# distribution

This is the distribution library. When loaded, distribution introduces functionality supporting the distributed execution of programs. To download it:

## Installation

```sh
$ npm i '@brown-ds/distribution'
```

This command downloads and installs the distribution library.

## Testing

There are several categories of tests:
  *	Regular Tests (`*.test.js`)
  *	Scenario Tests (`*.scenario.js`)
  *	Extra Credit Tests (`*.extra.test.js`)
  * Student Tests (`*.student.test.js`) - inside `test/test-student`

### Running Tests

By default, all regular tests are run. Use the options below to run different sets of tests:

1. Run all regular tests (default): `$ npm test` or `$ npm test -- -t`
2. Run scenario tests: `$ npm test -- -c` 
3. Run extra credit tests: `$ npm test -- -ec`
4. Run the `non-distribution` tests: `$ npm test -- -nd`
5. Combine options: `$ npm test -- -c -ec -nd -t`

## Usage

To import the library, be it in a JavaScript file or on the interactive console, run:

```js
let distribution = require("@brown-ds/distribution");
```

Now you have access to the full distribution library. You can start off by serializing some values. 

```js
let s = distribution.util.serialize(1); // '{"type":"number","value":"1"}'
let n = distribution.util.deserialize(s); // 1
```

You can inspect information about the current node (for example its `sid`) by running:

```js
distribution.local.status.get('sid', console.log); // 8cf1b
```

You can also store and retrieve values from the local memory:

```js
distribution.local.mem.put({name: 'nikos'}, 'key', console.log); // {name: 'nikos'}
distribution.local.mem.get('key', console.log); // {name: 'nikos'}
```

You can also spawn a new node:

```js
let node = { ip: '127.0.0.1', port: 8080 };
distribution.local.status.spawn(node, console.log);
```

Using the `distribution.all` set of services will allow you to act 
on the full set of nodes created as if they were a single one.

```js
distribution.all.status.get('sid', console.log); // { '8cf1b': '8cf1b', '8cf1c': '8cf1c' }
```

You can also send messages to other nodes:

```js
distribution.all.comm.send(['sid'], {node: node, service: 'status', method: 'get'}, console.log); // 8cf1c
```

# Results and Reflections

> ...


# M1: Serialization / Deserialization


## Summary

> Summarize your implementation, including key challenges you encountered. Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M1 (`hours`) and the lines of code per task.


My implementation comprises 4 software components (serialization/deserialization, testing, performance, scenarios), totaling about 300 lines of code. Key challenges included carefully handling recursive serialization of objects, developing a sufficient testing suite, and figure out how to best serialize errors.


## Correctness & Performance Characterization


> Describe how you characterized the correctness and performance of your implementation


*Correctness*: I wrote about 25 tests; these tests take 0.249 seconds to execute. This includes basic primitives, nested objects, arrays with various types, errors, dates, and more.


*Performance*: The latency of various subsystems is described in the `"latency"` portion of package.json. The characteristics of my development machines are summarized in the `"dev"` portion of package.json.


# M2: Actors and Remote Procedure Calls (RPC)


## Summary

> Summarize your implementation, including key challenges you encountered. Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M2 (`hours`) and the lines of code per task.


My implementation comprises 5 software components, totaling around 500 lines of code. Key challenges included figuring out how to properly serialize RPC functions to handle local function pointers still running in the environment the function was sent to, and learning how to manage requests and responses in JavaScript.


## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation


*Correctness*: I wrote 22 tests; these tests take 0.338 to execute.


*Performance*: I characterized the performance of comm and RPC by sending 1000 service requests in a tight loop. Average throughput and latency is recorded in `package.json`.


## Key Feature

> How would you explain the implementation of `createRPC` to someone who has no background in computer science — i.e., with the minimum jargon possible?

If you want your computer to do something with some data on another computer, you need them to communicate. That communication can be a lot of work, and oftentimes you don't want it to make simple tasks seem complicated. createRPC handles this problem exactly. It takes a function another computer can run, and returns a way for your computer to ask it to run it. It handles all the complicated communication internally.


# M4: Distributed Storage


## Summary

> Summarize your implementation, including key challenges you encountered


Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M4 (`hours`) and the lines of code per task.


## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation


*Correctness* -- I wrote 6 tests which take 0.699 seconds to run.


*Performance* -- I measured performance on AWS, having 3 EC2 instances act as a group for inserting/retrieving from a persistent store, and another EC2 instace making the queries. Numeric details are in the package.json file.


## Key Feature

> Why is the `reconf` method designed to first identify all the keys to be relocated and then relocate individual objects instead of fetching all the objects immediately and then pushing them to their corresponding locations?

This is because the whole point of better hashing algorithms is so that upon reconfiguration, you don't need to move or retrieve every object being stored, but rather a small subset.

# M5: Distributed Execution Engine


## Summary

> Summarize your implementation, including key challenges you encountered. Remember to update the `report` section of the `package.json` file with the total number of hours it took you to complete each task of M5 (`hours`) and the lines of code per task.


My implementation comprises three new software components, totaling 300 added lines of code over the previous implementation. Key challenges included resolving race conditions in store using append and ensuring that each worker didn't need to manually check if they had each item which required implementing a way to check what node was responsible for what data.


## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation


*Correctness*: I wrote 3 cases testing 3 different suggested workflows for map-reduce.


*Performance*: My map-reduce can sustain 1.32 characters/second, with an average latency of 0.756 seconds per character.


## Key Feature

> Which extra features did you implement and how?

I implemented a way for workers to figure out which keys they are responsible for in order to reduce the number of system read calls performed and improve performance. This helped on both the map and reduce ends.