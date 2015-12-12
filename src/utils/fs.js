"use strict";
import * as fs from 'fs';
export async function exists(filePath) {
	return await new Promise(resolve => fs.access(filePath, fs.R_OK | fs.W_OK, err => resolve(!err)));
}
export async function mkdir(filePath) {
	return await new Promise(resolve => fs.mkdir(filePath, err => resolve(!err)));
}
export async function readFile(fileName, encoding) {
	return await new Promise((resolve, reject) => fs.readFile(fileName, encoding, (err, content) => {
		if (err) {
			reject(err);
			return;
		}
		resolve(content);
	}));
}
export async function writeFile(fileName, fileContent) {
	return await new Promise(resolve => fs.writeFile(fileName, fileContent, err => resolve(!err)));
}