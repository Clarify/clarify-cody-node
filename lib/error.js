'use strict';

class ClarifyCodyError extends Error {
  constructor (message, content) {
    super(message);
    this.name = 'ClarifyCodyError';
    this.content = content;
    Error.captureStackTrace(this, ClarifyCodyError);
  }
}

module.exports = ClarifyCodyError;
