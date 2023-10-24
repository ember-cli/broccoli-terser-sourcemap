'use strict';

const fs = require('fs');
const path = require('path');
const srcURL = require('./source-map-url');

module.exports = function getSourceMapContent(src, inFileDirname, relativePath, silent) {
  let urls = [];
  let matchedUrl;
  srcURL.reset();
  while ((matchedUrl = srcURL.getFrom(src)) !== null) {
    urls.push(matchedUrl);
  }
  if (urls.length) {
    for (let i = urls.length - 1; i >= 0; --i) {
      let sourceMapPath = path.join(inFileDirname, urls[i]);
      if (fs.existsSync(sourceMapPath)) {
        try {
          return JSON.parse(fs.readFileSync(sourceMapPath));
        } catch (e) {
          console.error('[ERROR] (broccoli-terser-sourcemap) failed to parse sourcemap file', sourceMapPath, e);
        }
      }
    }
    if (!silent) {
      console.warn(
        `[WARN] (broccoli-terser-sourcemap) ${urls
          .map(u => `"${u}"`)
          .join(', ')} referenced in "${relativePath}" could not be found`
      );
    }
  }
};
