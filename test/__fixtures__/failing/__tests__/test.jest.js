'use strict';

const add = require('../lib/addJest');

test('adds 1 + 2 to equal 4', () => {
  expect(add(1, 2)).toBe(4);
});
