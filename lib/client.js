'use strict';

const request = require('request');
const pack = require('../package.json');
const ClarifyCodyError = require('./error');
const Utils = require('./utils');
const Async = require('async');

class Client {
  constructor (apiToken, opts) {
    if (!apiToken) throw new Error('API Token required');

    opts = opts || {};

    this.baseUrl = opts.baseUrl || 'https://cdapi.clarify.io';
    this.apiVersion = opts.apiVersion || 1;

    this.headers = opts.headers ? Utils.objectPropertiesToLowerCase(opts.headers) : {};
    this.headers.authorization = `Bearer ${apiToken}`;

    let uagent = 'clarify-cody/' + pack.version + ' (node:' + process.version + ')';
    if (this.headers['user-agent']) {
      this.headers['user-agent'] += ' ' + uagent;
    } else {
      this.headers['user-agent'] = uagent;
    }
  }

  // opt.body - json serializable object
  // opt.qs - query string. can be object or string
  _request (method, path, opts, callback) {
    var qsString = typeof opts.qs === 'string';

    const options = {
      baseUrl: this.baseUrl,
      url: (path[0] !== '/' ? `/v${this.apiVersion}/${path}` : path) + (qsString ? '?' + opts.qs : ''),
      json: true,
      method,
      headers: this.headers,
      body: opts.body,
      qs: qsString ? undefined : opts.qs,
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

  // put (path, data, callback) {
  //  this._request('PUT', path, {body: data}, callback);
  // }

  delete (path, callback) {
    this._request('DELETE', path, {}, callback);
  }

  getConversations (qs, callback) {
    this.get('conversations', qs, callback);
  }

  conversationMap (conversationCollection, iterFunc, callback) {
    /*
     * Execute iterFunc on every conversation in a collection.
     *
     * iterFunc will be called as iterFunc(conversation_href, next).
     *
     * If conversationCollection is null/undefined, all conversations will be
     * iterated.
     * Otherwise, conversationCollection can be the result returned from
     * a call to getConversation().
     *
     *  callback(err, number_of_conversations_iterated)
     */
    let self = this;
    let hasNext = true;
    let nextHref = null; // if null, retrieves first page
    let total = 0;

    Async.whilst(
      function () { return hasNext; },

      function (cb) {
        Async.waterfall([
          function (next) {
            // Get a page and perform the requested function.
            if (nextHref) {
              self.get(nextHref, next);
            } else if (conversationCollection) {
              next(null, conversationCollection);
            } else {
              self.getConversations(next);
            }
          },
          function (convCollection, next) {
            Async.eachSeries(convCollection._links.items, function (item, nextItem) {
              total++;
              iterFunc(item.href, nextItem);
            }, function (err) {
              if (err) {
                return next(err);
              }
              // Check for following page.
              nextHref = null;
              if (convCollection._links.next) {
                nextHref = convCollection._links.next.href;
              }
              hasNext = !!nextHref;
              return next();
            });
          }
        ], cb);
      }, function (err) {
        callback(err, total);
      });
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
    var href = Utils.getLinkHref(result, linkRel);
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

  getLinkItem (result, itemIndex, qs, callback) {
    var href = Utils.getLinkItemHref(result, itemIndex);
    if (href) {
      this.get(href, qs, callback);
    } else {
      if (typeof qs === 'function') {
        callback = qs;
        qs = undefined;
      }
      process.nextTick(function () { callback(new ClarifyCodyError('No link item ' + itemIndex)); });
    }
  }

  adminConversationsPrune (callback) {
    this.post('admin/conversations/prune', {}, callback);
  }

  adminConversationsNotify (notifyStatus, callback) {
    this.post('admin/conversations/notify', {notify_status: notifyStatus}, callback);
  }
};

module.exports = Client;
