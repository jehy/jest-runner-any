'use strict';

const add = require('../lib/addJest');

it('Works when it has only passing tests', () => {
  return expect(add(1, 2)).toMatchSnapshot();
});
