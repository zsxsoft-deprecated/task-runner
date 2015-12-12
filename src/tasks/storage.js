/* global async */
/* global await */
/// <typings path="../../typings/tsd.d.ts">
"use strict";
import * as cron from 'cron';
import * as storage from '../storage';
let job = null;

var Storage = {
	namespace: 'storage',
	hook: async function (config) {
		return new Promise(async function (resolve, reject) {
			await storage.initialize(config);
			global.storage = storage.storage;
			job = new cron.CronJob({
				cronTime: config.cronTime,
				onTick: () => {
					if (storage.storage === null) return;
					storage.storage.save().then(()=>{});
				},
				onComplete: () => {
	
				},
				start: true
			});
			resolve();
			return true;
		});
	}, 
	unhook: async function () {
		if (job) job.cancel();
		return true;
	}
};
module.exports = Storage;