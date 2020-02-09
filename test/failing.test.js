'use strict';

const semver = require('semver');
const runJest = require('./runJest');

const normalize = res => res.replace(' [ERR_ASSERTION]', '');

it('Works when it has failing tests', () => {
  return expect(runJest('failing').then(normalize)).resolves.toMatchSnapshot();
});

const runV8Test = !semver.satisfies(process.version, '>= 10.12.0') ? it : xit;

runV8Test('Should fail v8 coverage on old node versions', () => {
  return expect(
    runJest('failing', ['--coverage', '--coverageProvider', 'v8']),
  ).resolves.toMatchSnapshot();
});
