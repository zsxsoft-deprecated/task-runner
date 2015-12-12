/// <typings path="../../typings/tsd.d.ts">
"use strict";
import Storage from './base';
import * as path from 'path';
import * as fs from 'fs';
import * as asyncFs from '../utils/fs';
import * as log from '../utils/console';
export default class File extends Storage {
	_fileDir = "";
	_store = {};
	constructor(prop) {
		super(prop);
	}
	getFileName(key) {
		return path.join(this._fileDir + "/" + key + ".json");
	}
	async get(key) {
		let self = this;
		return new Promise(async function (resolve, reject) {
			if (!await self.has(key)) {
				let fileName = self.getFileName(key);
				if (!await asyncFs.exists(fileName)) {
					resolve(null);
					return;
				}
				log.log(await asyncFs.readFile(fileName, "utf-8"));
				await self.set(key, JSON.parse(await asyncFs.readFile(fileName, "utf-8")));
				self._store[key].dirty = false;
				log.log("Loaded data: " + key);
			}
			resolve(self._store[key].data);
		});
	}
	async set(key, value) {
		let self = this;
		return new Promise(async function (resolve, reject) {
			if (!await self.has(key)) {
				self._store[key] = {
					dirty: false,
					data: {}
				}
			}
			self._store[key].dirty = true;
			self._store[key].data = value;
			resolve(true);
		});
	}
	async delete(key) {
		let self = this;
		return new Promise(async function (resolve, reject) {
			delete self._store[key];
			resolve(true);
		});
	}
	async has(key) {
		let self = this;
		return new Promise(async function (resolve, reject) {
			let ret = !!self._store[key];
			resolve(ret);
			return ret;
		});
	}
	async save() {
		let self = this;
		return new Promise(async function (resolve, reject) {
			await Object.keys(self._store).forEach(async function (key) {
				if (!self._store[key].dirty) return;
				await asyncFs.writeFile(self.getFileName(key), JSON.stringify(self._store[key].data));
				self._store[key].dirty = false;
				log.log("Saved dirty data: " + key);
			});
			resolve();
		});
	}
	async load() {
		return true;
	}
	async initialize(config) {
		let self = this;
		return new Promise(async function (resolve, reject) {
			self._fileDir = path.resolve(config.filedir);
			log.log("Save to: " + self._fileDir);
			if (!(await asyncFs.exists(self._fileDir))) {
				await asyncFs.mkdir(self._fileDir);
				log.log("Created directory: " + self._fileDir);
			}
			resolve(true);
		});
	}
	async terminate() {
		return true;
	}
}