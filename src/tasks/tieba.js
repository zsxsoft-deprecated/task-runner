/* global async */
/* global await */
/// <typings path="../../typings/tsd.d.ts">
"use strict";
const TIEBA_PREFIX = "http://tieba.baidu.com/";
const TIEBA_URL = TIEBA_PREFIX + "f?kw=%s&ie=utf-8";
const TIEBA_POST_URL = TIEBA_PREFIX + "%s?see_lz=1"
const TIEBA_POST_REGEX = /delPost: ?\"\\\/(.+?)\"/ig;
import * as cron from 'cron';
import * as originalRequest from 'request';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import * as storageClass from '../storage';
import * as log from '../utils/console';
let storage = null;
let savedData = {};
let request = originalRequest;
let job = null;

async function scanTieba(tiebaName) {
	return new Promise((resolve, reject) => {
		request.get({
			url: TIEBA_URL.replace("%s", encodeURIComponent(tiebaName)),
			encoding: null
		}, (err, resp, body) => {
			if (!err && resp.statusCode == 200) {
				let str = iconv.decode(body, 'utf-8');
				resolve(str);
			} else {
				reject(err);
			}
		});
	});
}
 
function getPostList(tiebaString) {
	let $ = cheerio.load(tiebaString);
	let returnObject = [];
	$(".tl_shadow>a").each((index, element) => {
		let $element = $(element);
		let ret = {};
		ret.url = $element.attr("href").split("?")[0];
		ret.title = $element.find(".ti_title>span").text().trim();
		ret.author = $element.find(".ti_author").text().trim();
		returnObject.push(ret);
	}); 
	return returnObject; 
}

async function readDetail(object) {
	log.log("Getting: " + object.url);
	return new Promise((resolve, reject) => {
		request.get({
			url: TIEBA_POST_URL.replace("%s", object.url),
			encoding: null
		}, (err, resp, body) => {
			if (!err && resp.statusCode == 200) {
				let str = iconv.decode(body, 'utf-8');
				log.log("Got: " + object.url);
				resolve(str);
			} else {
				log.error("Got " + object.url + " Failed");
				reject(err);
			}
		});
	});
}

function checkIsIllegal(config, detailString) {
	let $ = cheerio.load(detailString);
	let text = $("body").text();
	return (new RegExp(config.illegalRegex, "ig").test(text));
}

async function deletePost(detailString) {
	return new Promise((resolve, reject) => {
		TIEBA_POST_REGEX.lastIndex = 0;
		let execObject = TIEBA_POST_REGEX.exec(detailString);
		if (execObject === null) {
			reject('Delete keyword not found');
			return; 
		}
		let deleteUrl = (TIEBA_PREFIX + execObject[1]).replace(/\\\//g, "/");
		log.log("Delete: " + deleteUrl);
		request.get(deleteUrl, {}, (err, resp, body) => {
			if (!err && resp.statusCode == 200) {
				resolve(body);
			} else {
				reject(err);
			}
		});
	});
}

function startTask(config) {
	log.log("Scanning tieba.");
	config.scanTieba.forEach(async function(tiebaName) {
		let listArray = [];
		try {
			let tiebaString = await scanTieba(tiebaName);
			listArray = getPostList(tiebaString);
		} catch (e) {
			log.error("Error when getting tieba post list.");
			log.object(e);
			return;
		}
		await listArray.forEach(async function (post) {
			if (savedData.white.author.indexOf(post.author) > -1) return;
			if (savedData.white.url.indexOf(post.url) > -1) return;
			if (savedData.scanned.indexOf(post.url) > -1) return;
			log.log("Found new post: " + JSON.stringify(post));
			let detailString;
			try {
				detailString = await readDetail(post);
			} catch (e) {
				log.error('Error when reading detail');
				log.object(e);
				return;
			} 
			savedData.scanned.push(post.url);
			storage.set('tieba', savedData);

			if (!checkIsIllegal(config, detailString)) return;
			try {
				let resp = await deletePost(detailString);
				log.log(resp);
			} catch (e) {
				log.error('Error when deleting post');
				log.object(e);
			}
		});
		
	});
}

var Tieba = {
	namespace: 'tieba',
	hook: async function (config) {
		storage = storageClass.storage;
		savedData = await storage.get("tieba");
		if (savedData === null) {
			savedData = {
				"white": {
					"author": [],
					"url": []
				}, 
				"scanned": []
			};
			storage.set('tieba', savedData);
		} 
		request = originalRequest.defaults({
			headers: config.headers
		});
		job = new cron.CronJob({
			cronTime: config.cronTime,
			onTick: startTask.bind(startTask, config),
			onComplete: () => {

			},
			start: true
		});
		return true;
	}, 
	unhook: async function () {
		
		if (job) job.cancel();
		return true;
	}
};
module.exports = Tieba;