'use strict';

// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

// Create a new object, that prototypically inherits from the Error constructor
function ClarifyCodyError (message, content) {
  this.name = 'ClarifyCodyError';
  this.message = message || 'Clarify Cody Error';
  this.content = content;
  this.stack = (new Error()).stack;
}

ClarifyCodyError.prototype = Object.create(Error.prototype);
ClarifyCodyError.prototype.constructor = ClarifyCodyError;

module.exports = ClarifyCodyError;
