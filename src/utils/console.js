"use strict";
function genetrateTime() {
	let d = new Date();
	return "[" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDay() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "] ";
}
export function log(text) {
	console.log(genetrateTime() + text);
}
export function error(text) {
	console.error(genetrateTime() + text);
}
export function warn(text) {
	console.warn(genetrateTime() + text);
}
export function object(obj) {
	console.log(obj);
}