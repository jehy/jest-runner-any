'use strict';

const add = require('../lib/addMocha');

const assert = require('assert');

describe('My tests', () => {
  it('This test passes', () => {
    assert.equal(add(1, 2), 3);
  });
});
