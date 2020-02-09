'use strict';

const semver = require('semver');

const runJest = require('./runJest');

function normalize(res) {
  return res
    .split('\n')
    .filter(
      line => !line.includes(
        'ExperimentalWarning: The fs.promises API is experimental',
      ),
    )
    .join('\n');
}

it('Works when it has only passing tests', () => {
  return expect(runJest('passing')).resolves.toMatchSnapshot();
});

it('Works when it has only passing tests and --coverage', () => {
  return expect(runJest('passing', ['--coverage'])).resolves.toMatchSnapshot();
});

const runV8Test = semver.satisfies(process.version, '>= 10.12.0') ? it : xit;
runV8Test('Works when it has only passing tests and --coverage with v8', () => {
  return expect(
    runJest('passing', ['--coverage', '--coverageProvider', 'v8']).then(
      normalize,
    ),
  ).resolves.toMatchSnapshot();
});
