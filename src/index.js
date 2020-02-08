'use strict';

const {v4} = require('uuid');
const runners = {};
const Mocha = require('jest-runner-mocha-next');
const  JestRunner  = require('jest-runner');
const { fileURLToPath } = require('url');

const { CoverageInstrumenter } = require('collect-v8-coverage');
const semver = require('semver');
const setupCollectCoverage = require('./setupCollectCoverage');
const minimatch = require('minimatch');


class Runner {
  constructor(options) {
    require('fs').writeFileSync(`./tmp/cons${v4()}.json`, JSON.stringify(options, null, 3));
    const runnerOptions = {...options, collectCoverage: true};
    runners.jasmine = new JestRunner(runnerOptions);
    runners.mocha = new Mocha(runnerOptions);
  }

  async runTests(...data) {
    require('fs').writeFileSync(`./tmp/run${v4()}.json`, JSON.stringify(data, null, 3));
    const [tests, watcher, onStart, onResult, onFailure, options] = data;
    const {config} = tests[0].context;
    const testsByRunner = tests.reduce((res, item)=>{
      if (item.path.includes('mocha.js')) {
        res.mocha.push(item);
      }
      if (item.path.includes('jest.js')) {
        res.jasmine.push(item);
      }
      return res;
    }, {jasmine: [], mocha: []});


    let v8CoverageInstrumenter;
    let v8CoverageResult;
    async function collectV8Coverage() {
      if (!semver.satisfies(process.version, '>= 10.12.0')) {
        throw new Error(`Node version ${process.version} does not have coverage information!
    Please use node >= 10.12.0 or babel coverage.`);
      }
      v8CoverageInstrumenter = new CoverageInstrumenter();
      await v8CoverageInstrumenter.startInstrumenting();
    }

    async function stopCollectingV8Coverage() {
      if (!v8CoverageInstrumenter) {
        throw new Error('You need to call `collectV8Coverage` first.');
      }
      v8CoverageResult = await v8CoverageInstrumenter.stopInstrumenting();
    }
    function shouldInstrument(file) {
      return !(
          /node_modules/.test(file)
          || config.coveragePathIgnorePatterns.some(pattern => minimatch(file, pattern))
      );
    }
    function getAllV8CoverageInfoCopy() {
      if (!v8CoverageResult) {
        throw new Error('You need to `stopCollectingV8Coverage` first');
      }

      return v8CoverageResult
          .filter(res => res.url.startsWith('file://'))
          .map(res => ({ ...res, url: fileURLToPath(res.url) }))
          .filter(
              (res) => {
                // TODO: will this work on windows? It might be better if `shouldInstrument` deals with it anyways
                return res.url.startsWith(config.rootDir) && shouldInstrument(res.url);
                // this._fileTransforms.has(res.url) &&
                //  shouldInstrument(res.url, this._coverageOptions, this._config),
              },
          )
          .map((result) => {
            const transformedFile = result.url; // this._fileTransforms.get(result.url);

            return {
              codeTransformResult: transformedFile,
              result,
            };
          });
    }

    const globalConfig = {collectCoverage: true, coverageProvider: 'v8'};
    if (globalConfig.collectCoverage) {
      if (globalConfig.coverageProvider === 'v8') {
        await collectV8Coverage();
      } else {
        setupCollectCoverage({
          filename: testPath,
          rootDir: config.rootDir,
          coveragePathIgnorePatterns: config.coveragePathIgnorePatterns,
          allowBabelRc: coverageOptions.useBabelRc,
        });
      }
    }
    require('fs').writeFileSync('./tmp/testsByRunner.json', JSON.stringify(testsByRunner, null, 3));
    let mochaResult;
    let mochaTest;
    let jasmineResult;
    const resMocha = await new Promise((resolve, reject)=>{
      runners.mocha.runTests(testsByRunner.mocha, watcher, onStart, (test,res)=>resolve(res), reject, options);
    })

    const [testJasmine, resJasmine] = await new Promise((resolve, reject)=>{
      runners.jasmine.runTests(testsByRunner.jasmine, JSON.parse(JSON.stringify(watcher)), onStart, (test,res)=>resolve([test, res]), reject, options);
    })
    //await runners.jasmine.runTests(testsByRunner.jasmine, watcher, onStart, onResult, onFailure, options);


    await stopCollectingV8Coverage();
    const v8Coverage = getAllV8CoverageInfoCopy();
    require('fs').writeFileSync('./tmp/v8Coverage.json', JSON.stringify(v8Coverage, null, 3));
    const res = {...resJasmine, v8Coverage};
    require('fs').writeFileSync('./tmp/res.json', JSON.stringify(res, null, 3));
    //return res;
    onResult(testJasmine, resJasmine);

    //require('fs').writeFileSync('./tmp/res.json', JSON.stringify(res, null, 3));
    //onResult(mochaTest, res);
    //return res;
  }
}

module.exports = Runner;
