'use strict';

const add = require('../../lib/addJest');

test('adds 1 + 3 to equal 4', () => {
  expect(add(1, 3)).toBe(4);
});
