'use strict';

module.exports = {
  testPathIgnorePatterns: ['/node_modules/'],
  testMatch: [
    '<rootDir>/test/*.js',
  ],
  runner: './src',
  maxWorkers: 2,
};
