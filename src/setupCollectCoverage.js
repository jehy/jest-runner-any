'use strict';

const minimatch = require('minimatch');

function setupCollectCoverage({
  rootDir,
  coveragePathIgnorePatterns,
  allowBabelRc,
}) {
  // HERE BE DRAGONS
  // Needs to be loaded dynamically otherwise will instrument all your code...
  // eslint-disable-next-line global-require
  const register = require('@babel/register');
  register({
    plugins: [
      [
        'babel-plugin-istanbul',
        {
          // files outside `cwd` will not be instrumented
          cwd: rootDir,
          useInlineSourceMaps: false,
          exclude: coveragePathIgnorePatterns,
        },
      ],
    ],
    ignore: [
      /node_modules/,
      filename => coveragePathIgnorePatterns.some(pattern => minimatch(filename, pattern)),
    ],
    babelrc: allowBabelRc,
    // compact: true,
    retainLines: true,
    sourceMaps: 'inline',
  });
}

module.exports = setupCollectCoverage;
