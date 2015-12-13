var process = require('process');
process.chdir(__dirname + '/build');
require("babel-core/register");
require("babel-polyfill");
require('./build/entry');