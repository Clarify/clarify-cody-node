'use strict';

const request = require('request');
const pack = require('../package.json');
const ClarifyCodyError = require('./error');

class Client {
  constructor (apiToken, opts) {
    if (!apiToken) throw new Error('API Token required');

    opts = opts || {};

    if (!(this instanceof Client)) {
      return new Client(apiToken, opts);
    }

    this.baseUrl = opts.baseUrl || 'https://cdapi.clarify.io';
    this.apiVersion = opts.apiVersion || 1;

    this.headers = opts.headers || {};
    this.headers.Authorization = `Bearer ${apiToken}`;

    if (!this.headers['User-Agent']) {
      this.headers['User-Agent'] = 'clarify-cody-node v' + pack.version + ' / node ' + process.version;
    }
  }

  // opt.body - json serializable object
  // opt.qs - query string
  _request (method, path, opts, callback) {
    const options = {
      baseUrl: this.baseUrl,
      url: path[0] !== '/' ? `/v${this.apiVersion}/${path}` : path,
      json: true,
      method,
      headers: this.headers,
      body: opts.body,
      qs: opts.qs,
      useQuerystring: true
    };

    request(options, (err, resp, body) => {
      if (!err && resp.statusCode >= 400) {
        err = new ClarifyCodyError(body.message, body);
      }
      callback(err, body);
    });
  }

  get (path, qs, callback) {
    if (typeof qs === 'function') {
      callback = qs;
      qs = undefined;
    }

    this._request('GET', path, {qs: qs}, callback);
  }

  post (path, data, callback) {
    this._request('POST', path, {body: data}, callback);
  }

  put (path, data, callback) {
    this._request('PUT', path, {body: data}, callback);
  }

  delete (path, callback) {
    this._request('DELETE', path, {}, callback);
  }

  getConversations (qs, callback) {
    this.get('conversations', qs, callback);
  }

  createConversation (data, callback) {
    this.post('conversations', data, callback);
  }

  getConversation (href, qs, callback) {
    this.get(href, qs, callback);
  }

  deleteConversation (href, callback) {
    this.delete(href, callback);
  }

  getLink (result, linkRel, qs, callback) {
    var href = Client.getLinkHref(result, linkRel);
    if (href) {
      this.get(href, qs, callback);
    } else {
      if (typeof qs === 'function') {
        callback = qs;
        qs = undefined;
      }
      process.nextTick(function () { callback(new ClarifyCodyError('No link relation ' + linkRel)); });
    }
  }

  getItemLink (result, itemIndex, qs, callback) {
    var href = Client.getItemLinkHref(result, itemIndex);
    if (href) {
      this.get(href, qs, callback);
    } else {
      if (typeof qs === 'function') {
        callback = qs;
        qs = undefined;
      }
      process.nextTick(function () { callback(new ClarifyCodyError('No item link ' + itemIndex)); });
    }
  }
};

Client.getLinkHref = function (result, linkRel) {
  if (result._links && result._links[linkRel]) {
    return result._links[linkRel].href;
  }
  return undefined;
};

Client.getItemLinkHref = function (result, itemIndex) {
  if (result._links && result._links.items && result._links.items.length > itemIndex) {
    return result._links.items[itemIndex].href;
  }
  return undefined;
};

module.exports = Client;
