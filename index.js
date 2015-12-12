var process = require('process');
process.chdir('build');
require("babel-core/register");
require("babel-polyfill");
require('./build/entry');