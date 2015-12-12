/// <typings path="../../typings/tsd.d.ts">
"use strict";
export default class Base {
	_namespace = "";
	_store = new Map();
	constructor(namespace) {
		this._namespace = namespace;	
	}
	async get(key) {
		return this._store.get(key);
	}
	async set(key, value) {
		return this._store.set(key, value);
	}
	async delete(key) {
		return this._store.delete(key);
	}
	async has(key) {
		return this._store.has(key);
	}
	async save() {
		return false;
	}
	async load() {
		return true;
	}
	async initialize() {
		this._store = new Map();
		return true;
	}
	async terminate() {
		this._store = null;
		return true;
	}
}