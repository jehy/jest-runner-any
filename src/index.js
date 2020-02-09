'use strict';

const {v4} = require('uuid');

const runners = {};
const Mocha = require('jest-runner-mocha-next');
const  JestRunner  = require('jest-runner');
const path = require('path');

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

class Runner {
  constructor(options) {
    require('fs').writeFileSync(`./tmp/cons${v4()}.json`, JSON.stringify(options, null, 3));
    // const runnerOptions = options; // {...options, collectCoverage: true};

    /*
    runners.jasmine = new JestRunner({...clone(options), name: v4(), runner: require.resolve(JestRunner)});
    runners.mocha = new Mocha({...clone(options), name: v4(), runner: require.resolve(Mocha)});
     */
    runners.jasmine = new JestRunner(options);
    //runners.mocha = new Mocha({...clone(options), name: v4()});
  }

  async runTests(...data) {
    require('fs').writeFileSync(`./tmp/run${v4()}.json`, JSON.stringify(data, null, 3));
    const [tests, watcher, onStart, onResult, onFailure, options] = data;
    const testsByRunner = tests.reduce((res, item)=>{
      let foundWorker = 0;
      if (item.path.includes('mocha.js')) {
        res.mocha.push({...item, name: v4()});
        foundWorker++;
      }
      if (item.path.includes('jest.js')) {
        res.jasmine.push({...item, name: v4()});
        foundWorker++;
      }
      if (foundWorker === 0) {
        // throw new Error(`path "${item.path}" did not match any worker!`);
      }
      if (foundWorker > 1) {
        throw new Error(`path "${item.path}" matched several workers!`);
      }
      return res;
    }, {jasmine: [], mocha: []});


    require('fs').writeFileSync(`./tmp/testsByRunner${v4()}.json`, JSON.stringify(testsByRunner, null, 3));

    // await runners.mocha.runTests(testsByRunner.mocha, watcher, onStart, onResult, onFailure, options);

    await runners.jasmine.runTests(testsByRunner.jasmine, watcher, onStart, onResult, onFailure, options);
  }
}

module.exports = Runner;
