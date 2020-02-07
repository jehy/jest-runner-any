'use strict';

const {v4} = require('uuid');
const runners = {};
const Mocha = require('jest-runner-mocha-next');
const  JestRunner  = require('jest-runner');


class Runner {
  constructor(options) {
    require('fs').writeFileSync(`./tmp/cons${v4()}.json`, JSON.stringify(options, null, 3));
    runners.jasmine = new JestRunner(options);
    runners.mocha = new Mocha(options);
  }

  async runTests(...data) {
    require('fs').writeFileSync(`./tmp/run${v4()}.json`, JSON.stringify(data, null, 3));
    const [tests, watcher, onStart, onResult, onFailure, options] = data;
    const testsByRunner = tests.reduce((res, item)=>{
      if (item.path.includes('mocha.js')) {
        res.mocha.push(item);
      }
      if (item.path.includes('jest.js')) {
        res.jasmine.push(item);
      }
      return res;
    }, {jasmine: [], mocha: []});

    require('fs').writeFileSync('./tmp/testsByRunner.json', JSON.stringify(testsByRunner, null, 3));
    const mochaResults = await runners.mocha.runTests(testsByRunner.mocha, watcher, onStart, onResult, onFailure, options);
    return await runners.jasmine.runTests(testsByRunner.jasmine, watcher, onStart, onResult, onFailure, options);
  }
}

module.exports = Runner;
