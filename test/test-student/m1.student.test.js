/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const distribution = require('../../config.js');
const util = distribution.util;

const serializeAndDeserialize = (object) => {
  const serialized = util.serialize(object);
  if (serialized instanceof Error) {
    return Error('Serialization failed');
  }
  const deserialized = util.deserialize(serialized);
  return deserialized;
};

describe('m1', () => {
  test('m1: sample test', () => {
    const object = {milestone: 'm1', status: 'complete'};
    const serialized = util.serialize(object);
    const deserialized = util.deserialize(serialized);

    expect(deserialized).toEqual(object);
  });

  test('m1: dates', () => {
    const now = new Date(Date.now());
    const myNow = serializeAndDeserialize(now);
    expect(myNow).toEqual(now);

    const zero = new Date(0);
    const myZero = serializeAndDeserialize(zero);
    expect(myZero).toEqual(zero);
  });

  test('m1: errors', () => {
    const empty = new Error();
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty).toEqual(empty);

    const message = new Error('message');
    const myMessage = serializeAndDeserialize(message);
    expect(myMessage).toEqual(message);
  });

  test('m1: objects', () => {
    const empty = {};
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty).toEqual(empty);

    const flat = {
      num: 1,
      str: 'string',
      arr: [1, 2, 3],
    };
    const myFlat = serializeAndDeserialize(flat);
    expect(myFlat).toEqual(flat);

    const rec = {
      l1: {
        l2: {
          l3: 3,
        },
      },
    };
    const myRec = serializeAndDeserialize(rec);
    expect(myRec).toEqual(rec);
  });

  test('m1: arrays', () => {
    const empty = [];
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty).toEqual(empty);

    const nums = [1, 2, 3];
    const myNums = serializeAndDeserialize(nums);
    expect(myNums).toEqual(nums);

    const strings = ['a', 'bc', 'def'];
    const myStrings = serializeAndDeserialize(strings);
    expect(myStrings).toEqual(strings);

    const mixed = [1, 'a', {test: 'test!'}];
    const myMixed = serializeAndDeserialize(mixed);
    expect(myMixed).toEqual(mixed);
  });

  test('m1: functions', () => {
    const empty = () => {};
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty()).toBeUndefined();

    const identity = (x) => x;
    const myIdentity = serializeAndDeserialize(identity);
    expect(myIdentity(5)).toEqual(5);

    const double = (x) => 2 * x;
    const myDouble = serializeAndDeserialize(double);
    expect(myDouble(5)).toEqual(10);

    const multiLine = (x) => {
      x *= 5;
      return x / 2;
    };
    const myMultiLine = serializeAndDeserialize(multiLine);
    expect(myMultiLine(10)).toEqual(25);
  });

  test('m1: simple primitives', () => {
    const myTrue = serializeAndDeserialize(true);
    expect(myTrue).toEqual(true);

    const myFalse = serializeAndDeserialize(false);
    expect(myFalse).toEqual(false);

    const myNull = serializeAndDeserialize(null);
    expect(myNull).toEqual(null);

    const myUndefined = serializeAndDeserialize(undefined);
    expect(myUndefined).toEqual(undefined);
  });

  test('m1: strings', () => {
    const empty = '';
    const myEmpty = serializeAndDeserialize(empty);
    expect(myEmpty).toEqual(empty);

    const lower = 'test';
    const myLower = serializeAndDeserialize(lower);
    expect(myLower).toEqual(lower);

    const upper = 'test';
    const myUpper = serializeAndDeserialize(upper);
    expect(myUpper).toEqual(upper);

    const num = '123';
    const myNum = serializeAndDeserialize(num);
    expect(myNum).toEqual(num);

    const random = '  wasdWASD123!@#  ';
    const myRandom = serializeAndDeserialize(random);
    expect(myRandom).toEqual(random);
  });

  test('m1: numbers', () => {
    const singleDigit = 1;
    const mySingleDigit = serializeAndDeserialize(singleDigit);
    expect(mySingleDigit).toEqual(singleDigit);

    const multiDigit = 100;
    const myMultiDigit = serializeAndDeserialize(multiDigit);
    expect(myMultiDigit).toEqual(multiDigit);

    const decimal = 10.23;
    const myDecimal = serializeAndDeserialize(decimal);
    expect(myDecimal).toEqual(decimal);

    const myNaN = serializeAndDeserialize(NaN);
    expect(myNaN).toEqual(NaN);

    const myInfinity = serializeAndDeserialize(Infinity);
    expect(myInfinity).toEqual(Infinity);
  });
});