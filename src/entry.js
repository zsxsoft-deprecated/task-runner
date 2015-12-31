/// <reference path="../typings/tsd.d.ts" />
"use strict";
const CONFIG_NAME = "./../config.json";
const TASK_DIR = './tasks/';
import * as fs from 'fs';
import * as log from './utils/console';
let koa = require('koa');
let intercept = require('intercept-stdout');
var capturedText = [];
var unhook_intercept = intercept((txt) => {
  if (config.system) {
    if (config.system.maxLogCount <= capturedText.length) {
      capturedText.shift();
    }
  }
  capturedText.push(txt);
});
var config = {};
var tasks = [];
var app = koa();
var firstInit = false;
app.use(function* () {
  this.body = capturedText.join("");//'Hello World';
});


fs.readdir(TASK_DIR, (err, files) => files.forEach(file => {
  if (/(storage)\.js/i.test(file)) { // priority
    tasks.unshift(require(TASK_DIR + file));
  }
  else if (/\.js$/.test(file)) {
    tasks.push(require(TASK_DIR + file));
  }
}));
 
function initializeSystem() {
  fs.readFile(CONFIG_NAME, "utf-8", async function (err, data) {
    config = JSON.parse(data);
    if (!firstInit) app.listen(config.system.port);
    for (let i = 0; i < tasks.length; i++) { // should not use forEach
      let task = tasks[i];
      await task.unhook();
      log.log(task.namespace + " unhooked!");
    }
    for (let i = 0; i < tasks.length; i++) {
      let task = tasks[i];
      let fuck = await task.hook(config[task.namespace]);
      log.log(task.namespace + " hooked!");
    }
    firstInit = true;
  });
}

fs.watchFile(CONFIG_NAME, initializeSystem);
initializeSystem();

/*
// logger
app.use(function* (next) {
  let start = new Date().getTime();
  yield next;
  let ms = new Date().getTime() - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});
*/
// response

