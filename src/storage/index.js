/// <typings path="../../typings/tsd.d.ts">
"use strict";
export let storage = null;
export async function initialize(config) {
	let StorageClass = null;
	if (config) {
		await terminate();
		StorageClass = require("./" + config.type).default;
		storage = new StorageClass();
	} 
	if (storage === null) return false;
	return await storage.initialize(config);
}
export async function terminate() {
	if (storage === null) return false;
	return await storage.terminate();
}
