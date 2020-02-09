'use strict';

const assert = require('assert');
const add = require('../lib/addMocha');

describe('My tests', () => {
  it('This test fails', () => {
    assert.equal(add(1, 3), 2);
  });
});
