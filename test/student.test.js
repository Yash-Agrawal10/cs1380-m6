/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
*/

const distribution = require('../config.js');

// M1 Test Cases

test('m1: sample test', () => {
  const object = {milestone: 'm1', status: 'complete'};
  const serialized = distribution.util.serialize(object);
  const deserialized = distribution.util.deserialize(serialized);

  expect(deserialized).toEqual(object);
});

test('m1: dates', () => {
  const now = new Date(Date.now());
  const sNow = distribution.util.serialize(now);
  const dNow = distribution.util.deserialize(sNow);
  expect(dNow).toEqual(now);

  const zero = new Date(0);
  const sZero = distribution.util.serialize(zero);
  const dZero = distribution.util.deserialize(sZero);
  expect(dZero).toEqual(zero);
})

test('m1: errors', () => {
  const empty = new Error();
  const sEmpty = distribution.util.serialize(empty);
  const dEmpty = distribution.util.deserialize(sEmpty);
  expect(dEmpty).toEqual(empty);

  const messaage = new Error("message");
  const sMessaage = distribution.util.serialize(messaage);
  const dMessaage = distribution.util.deserialize(sMessaage);
  expect(dMessaage).toEqual(messaage);
})

test('m1: objects', () => {
  const empty = {};
  const sEmpty = distribution.util.serialize(empty);
  const dEmpty = distribution.util.deserialize(sEmpty);
  expect(dEmpty).toEqual(empty);

  const flat = {
    num: 1, 
    str: "string",
    arr: [1, 2, 3],
  };
  const sFlat = distribution.util.serialize(flat);
  const dFlat = distribution.util.deserialize(sFlat);
  expect(dFlat).toEqual(flat);

  const rec = {
    l1: {
      l2: {
        l3: 3
      }
    }
  };
  const sRec = distribution.util.serialize(rec);
  const dRec = distribution.util.deserialize(sRec);
  expect(dRec).toEqual(rec);
});

test('m1: arrays', () => {
  const empty = [];
  const sEmpty = distribution.util.serialize(empty);
  console.log(sEmpty);
  const dEmpty = distribution.util.deserialize(sEmpty);
  expect(dEmpty).toEqual(empty);

  const nums = [1, 2, 3];
  const sNums = distribution.util.serialize(nums);
  const dNums = distribution.util.deserialize(sNums);
  expect(dNums).toEqual(nums);

  const strings = ["a", "bc", "def"];
  const sStrings = distribution.util.serialize(strings);
  const dStrings = distribution.util.deserialize(sStrings);
  expect(dStrings).toEqual(strings);
});

test('m1: functions', () => {
  // Currently only tests simple function functionality, not deep equality
  const empty = () => {};
  const sEmpty = distribution.util.serialize(empty);
  const dEmpty = distribution.util.deserialize(sEmpty);
  expect(dEmpty()).toBeUndefined();

  const identity = (x) => x;
  const sIdentity = distribution.util.serialize(identity);
  const dIdentity = distribution.util.deserialize(sIdentity);
  expect(dIdentity(5)).toEqual(5);

  const double = (x) => 2 * x;
  const sDouble = distribution.util.serialize(double);
  const dDouble = distribution.util.deserialize(sDouble);
  expect(dDouble(5)).toEqual(10);

  const multiLine = (x) => {
    x *= 5;
    return x / 2;
  };
  const sMultiLine = distribution.util.serialize(multiLine);
  const dMultiLine = distribution.util.deserialize(sMultiLine);
  expect(dMultiLine(10)).toEqual(25);
});

test('m1: simple primitives', () => {
  const t = true;
  const sT = distribution.util.serialize(t);
  const dT = distribution.util.deserialize(sT);
  expect(dT).toEqual(t);

  const f = false;
  const sF = distribution.util.serialize(f);
  const dF = distribution.util.deserialize(sF);
  expect(dF).toEqual(f);

  const n = null;
  const sN = distribution.util.serialize(n);
  const dN = distribution.util.deserialize(sN);
  expect(dN).toEqual(n);

  const u = undefined;
  const sU = distribution.util.serialize(u);
  const dU = distribution.util.deserialize(sU);
  expect(dU).toEqual(u);
});

test('m1: strings', () => {
  const empty = "";
  const sEmpty = distribution.util.serialize(empty);
  const dEmpty = distribution.util.deserialize(sEmpty);
  expect(dEmpty).toEqual(empty);

  const lower = "test";
  const sLower = distribution.util.serialize(lower);
  const dLower = distribution.util.deserialize(sLower);
  expect(dLower).toEqual(lower);

  const upper = "test";
  const sUpper = distribution.util.serialize(upper);
  const dUpper = distribution.util.deserialize(sUpper);
  expect(dUpper).toEqual(upper);

  const num = "123";
  const sNum = distribution.util.serialize(num);
  const dNum = distribution.util.deserialize(sNum);
  expect(dNum).toEqual(num);

  const random = "  wasdWASD123!@#  ";
  const sRandom = distribution.util.serialize(random);
  const dRandom = distribution.util.deserialize(sRandom);
  expect(dRandom).toEqual(random);
});

test('m1: numbers', () => {
  const singleDigit = 1;
  const sSingleDigit = distribution.util.serialize(singleDigit);
  const dSingleDigit = distribution.util.deserialize(sSingleDigit);
  expect(dSingleDigit).toEqual(singleDigit);

  const multiDigit = 100;
  const sMultiDigit = distribution.util.serialize(multiDigit);
  const dMultiDigit = distribution.util.deserialize(sMultiDigit);
  expect(dMultiDigit).toEqual(multiDigit);

  const decimal = 10.23;
  const sDecimal = distribution.util.serialize(decimal);
  const dDecimal = distribution.util.deserialize(sDecimal);
  expect(dDecimal).toEqual(decimal);

  const nan = NaN;
  const sNan = distribution.util.serialize(nan);
  const dNan = distribution.util.deserialize(sNan);
  expect(dNan).toEqual(nan);

  const infinity = Infinity;
  const sInfinity = distribution.util.serialize(infinity);
  const dInfinity = distribution.util.deserialize(sInfinity);
  expect(dInfinity).toEqual(infinity);
});

// M2 Test Cases

// M3 Test Cases

// M4 Test Cases

// M5 Test Cases
