'use strict';

it('Works when it has only passing tests', () => {
  return expect({a: 1}).toMatchSnapshot();
});
