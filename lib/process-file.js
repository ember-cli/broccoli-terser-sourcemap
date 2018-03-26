'use strict';

var debug = require('debug')('broccoli-uglify-sourcemap');
var defaults = require('lodash.defaultsdeep');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var srcURL = require('source-map-url');

var Promise = require('rsvp').Promise;
var UglifyJS = require('uglify-es');


module.exports = function processFile(inFile, outFile, relativePath, outDir, silent, _options) {
  var src = fs.readFileSync(inFile, 'utf-8');
  var mapName = path.basename(outFile).replace(/\.js$/,'') + '.map';

  var mapDir;
  if (_options.sourceMapDir) {
    mapDir = path.join(outDir, _options.sourceMapDir);
  } else {
    mapDir = path.dirname(path.join(outDir, relativePath));
  }

  let options = defaults({}, _options.uglify);
  if (options.sourceMap) {
    let filename = path.basename(inFile);
    let url = _options.sourceMapDir ? '/' + path.join(_options.sourceMapDir, mapName) : mapName;

    let sourceMap = { filename, url };

    if (srcURL.existsIn(src)) {
      let url = srcURL.getFrom(src);
      let sourceMapPath = path.join(path.dirname(inFile), url);
      if (fs.existsSync(sourceMapPath)) {
        sourceMap.content = JSON.parse(fs.readFileSync(sourceMapPath));
      } else if (!silent) {
        console.warn(`[WARN] (broccoli-uglify-sourcemap) "${url}" referenced in "${relativePath}" could not be found`);
      }
    }

    options = defaults(options, { sourceMap });
  }

  var start = new Date();
  debug('[starting]: %s %dKB', relativePath, (src.length / 1000));
  var result = UglifyJS.minify(src, options);
  var end = new Date();
  var total = end - start;
  if (total > 20000 && !silent) {
    console.warn('[WARN] (broccoli-uglify-sourcemap) Minifying: `' + relativePath + '` took: ' + total + 'ms (more than 20,000ms)');
  }

  if (result.error) {
    result.error.filename = relativePath;
    throw result.error;
  }

  debug('[finished]: %s %dKB in %dms', relativePath, (result.code.length / 1000), total);

  if (options.sourceMap) {
    var newSourceMap = JSON.parse(result.map);

    newSourceMap.sources = newSourceMap.sources.map(function(path){
      // If out output file has the same name as one of our original
      // sources, they will shadow eachother in Dev Tools. So instead we
      // alter the reference to the upstream file.
      if (path === relativePath) {
        path = path.replace(/\.js$/, '-orig.js');
      }
      return path;
    });
    mkdirp.sync(mapDir);
    fs.writeFileSync(path.join(mapDir, mapName), JSON.stringify(newSourceMap));
  }
  fs.writeFileSync(outFile, result.code);
};
