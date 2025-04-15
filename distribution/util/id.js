/** @typedef {import("../types.js").Node} Node */

const assert = require('assert');
const crypto = require('crypto');

// The ID is the SHA256 hash of the JSON representation of the object
/** @typedef {!string} ID */

/**
 * @param {any} obj
 * @return {ID}
 */
function getID(obj) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

/**
 * The NID is the SHA256 hash of the JSON representation of the node
 * @param {Node} node
 * @return {ID}
 */
function getNID(node) {
  node = {ip: node.ip, port: node.port};
  return getID(node);
}

/**
 * The SID is the first 5 characters of the NID
 * @param {Node} node
 * @return {ID}
 */
function getSID(node) {
  return getNID(node).substring(0, 5);
}


function getMID(message) {
  const msg = {};
  msg.date = new Date().getTime();
  msg.mss = message;
  return getID(msg);
}

function idToNum(id) {
  const n = parseInt(id, 16);
  assert(!isNaN(n), 'idToNum: id is not in KID form!');
  return n;
}

function naiveHash(kid, nids) {
  const sortedNIDs = [...nids].sort();
  return sortedNIDs[idToNum(kid) % sortedNIDs.length];
}

function consistentHash(kid, nids) {
  const kidNum = idToNum(kid);
  const nidNums = nids.map(nid => idToNum(nid));
  const allNums = [kidNum, ...nidNums];
  const sortedNums = [...allNums].sort();
  const kidIndex = sortedNums.indexOf(kidNum);
  const selectedNidNum = sortedNums[(kidIndex + 1) % sortedNums.length];
  const selectedIndex = nidNums.indexOf(selectedNidNum);
  return nids[selectedIndex];
}


function rendezvousHash(kid, nids) {
  const combinedIds = nids.map(nid => kid + nid);
  const hashedIds = combinedIds.map(getID);
  const sortedIds = [...hashedIds].sort();
  const selectedHashedId = sortedIds[sortedIds.length - 1];
  const selectedIndex = hashedIds.indexOf(selectedHashedId);
  return nids[selectedIndex];
}

module.exports = {
  getID,
  getNID,
  getSID,
  getMID,
  naiveHash,
  consistentHash,
  rendezvousHash,
};
