// config-overrides.js
const { override, addWebpackAlias, addWebpackModuleRule } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    crypto: 'crypto-browserify',
    stream: 'stream-browserify',
    buffer: 'buffer',
    path: 'path-browserify',
    fs: false // fs is not available in the browser
  }),
  addWebpackModuleRule({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false
    }
  })
);