/*
    In this file, add your own test cases that correspond to functionality introduced for each milestone.
    You should fill out each test case so it adequately tests the functionality you implemented.
    You are left to decide what the complexity of each test case should be, but trivial test cases that abuse this flexibility might be subject to deductions.

    Imporant: Do not modify any of the test headers (i.e., the test('header', ...) part). Doing so will result in grading penalties.
*/

const distribution = require('../../config.js');

test.only('(1 pts) student test - local.mem put, get, del, get', (done) => {
  // Fill out this test case...
  const key = 'mykey';
  const value = {value: 'any'};
  distribution.local.mem.put(value, key, (e0, v0) => {
    expect(e0).toBeFalsy();
    expect(v0).toEqual(value);
    distribution.local.mem.get(key, (e1, v1) => {
      expect(e1).toBeFalsy();
      expect(v1).toEqual(value);
      distribution.local.mem.del(key, (e2, v2) => {
        expect(e2).toBeFalsy();
        expect(v2).toEqual(value);
        distribution.local.mem.get(key, (e3, v3) => {
          expect(e3).toBeTruthy();
          expect(v3).toBeFalsy();
          done();
        });
      });
    });
  });
});


test('(1 pts) student test', (done) => {
  // Fill out this test case...
  done(new Error('Not implemented'));
});


test('(1 pts) student test', (done) => {
  // Fill out this test case...
  done(new Error('Not implemented'));
});

test('(1 pts) student test', (done) => {
  // Fill out this test case...
  done(new Error('Not implemented'));
});

test('(1 pts) student test', (done) => {
  // Fill out this test case...
  done(new Error('Not implemented'));
});
