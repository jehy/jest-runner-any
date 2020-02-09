'use strict';

module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: [
    '<rootDir>/test/*.test.js',
  ],
  maxWorkers: 2,
};
