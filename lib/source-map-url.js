'use strict';

// Forked from https://github.com/lydell/source-map-url/blob/master/source-map-url.js
// We use a slightly adjusted regex here
const convertSourceMap = require('convert-source-map');

module.exports = {
  regex: convertSourceMap.mapFileCommentRegex,

  reset() {
    this.regex = convertSourceMap.mapFileCommentRegex;
  },

  getFrom(code) {
    const m = this.regex.exec(code);
    return m ? m[1] || m[2] : null;
  },
};
