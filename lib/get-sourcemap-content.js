'use strict';

const fs = require('fs');
const path = require('path');
const srcURL = require('source-map-url');
const srcRegExpg = new RegExp(srcURL.regex, 'g');

module.exports = function getSourceMapContent(src, inFile, relativePath, silent) {
  let urls = [];
  let match;
  // eslint-disable-next-line no-cond-assign
  while (match = srcRegExpg.exec(src)) {
    urls.push(match[1] || match[2] || '');
  }
  if (urls.length) {
    for (let i = urls.length - 1; i >= 0; --i) {
      let sourceMapPath = path.join(path.dirname(inFile), urls[i]);
      if (fs.existsSync(sourceMapPath)) {
        return JSON.parse(fs.readFileSync(sourceMapPath));
      }
    }
    if (!silent) {
      console.warn(`[WARN] (broccoli-uglify-sourcemap) ${urls.map(u => `"${u}"`).join(', ')} referenced in "${relativePath}" could not be found`);
    }
  }
};
