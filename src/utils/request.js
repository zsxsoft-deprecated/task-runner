import * as originalRequest from 'request';
let requestQueue = [];
let queueRunning = false;

function runQueue() {
    if (requestQueue.length == 0) {
        queueRunning = false; 
        return;
    }
    queueRunning = true;
    let queueObject = requestQueue.shift();
    return queueObject.requestObject[queueObject.method](queueObject.param, (err, resp, body) => {
        if (!err && resp.statusCode == 200) {
			queueObject.succeed(body);
		} else {
			queueObject.fail(err);
		}
        runQueue();
    });
}

export class Request {
    _request = null;
    constructor (param) {
        this._request = originalRequest.defaults(param);
        return this;
    }
    async send (method, param) {
        return new Promise((resolve, reject) => {
            requestQueue.push({
                requestObject: this._request,
                method: method, 
                param: param, 
                succeed: resolve,
                fail: reject
            });
            if (!queueRunning) {
                runQueue();
            }
        });
    }
    async get (param) {
        return this.send('get', param);
    }
    async post (param) {
        return this.send('post', param);
    }
}
