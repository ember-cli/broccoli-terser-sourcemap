'use strict';

const walkSync = require('walk-sync');
const Plugin = require('broccoli-plugin');
const path = require('path');
const defaults = require('lodash.defaultsdeep');
const symlinkOrCopy = require('symlink-or-copy');
const mkdirp = require('mkdirp');
const MatcherCollection = require('matcher-collection');
const debug = require('debug')('broccoli-uglify-sourcemap');
const queue = require('async-promise-queue');
const workerpool = require('workerpool');

const processFile = require('./lib/process-file');

module.exports = UglifyWriter;

UglifyWriter.prototype = Object.create(Plugin.prototype);
UglifyWriter.prototype.constructor = UglifyWriter;

const silent = process.argv.indexOf('--silent') !== -1;

const worker = queue.async.asyncify(doWork => doWork());

const MatchNothing = {
  match() {
    return false;
  },
};

function UglifyWriter(inputNodes, options) {
  if (!(this instanceof UglifyWriter)) {
    return new UglifyWriter(inputNodes, options);
  }

  inputNodes = Array.isArray(inputNodes) ? inputNodes : [inputNodes];

  Plugin.call(this, inputNodes, options);

  this.options = defaults(options, {
    uglify: {
      sourceMap: {},
    },
  });

  // async prop is deprecated since terser.minify() is async by default
  if ('async' in this.options) {
    throw new Error('\n Passing `async` property inside `options` is deprecated.');
  }

  this.concurrency = Number(process.env.JOBS) || this.options.concurrency || Math.max(require('os').cpus().length - 1, 1);

  // create a worker pool using an external worker script
  this.pool = workerpool.pool(path.join(__dirname, 'lib', 'worker.js'), {
    maxWorkers: this.concurrency,
    workerType: 'auto',
  });

  this.inputNodes = inputNodes;

  let exclude = this.options.exclude;
  if (Array.isArray(exclude)) {
    this.excludes = new MatcherCollection(exclude);
  } else {
    this.excludes = MatchNothing;
  }
}

UglifyWriter.prototype.build = async function() {
  let writer = this;

  let pendingWork = [];

  this.inputPaths.forEach(inputPath => {
    walkSync(inputPath).forEach(relativePath => {
      if (relativePath.slice(-1) === '/') {
        return;
      }
      let inFile = path.join(inputPath, relativePath);
      let outFile = path.join(writer.outputPath, relativePath);

      mkdirp.sync(path.dirname(outFile));

      if (this._isJSExt(relativePath) && !writer.excludes.match(relativePath)) {
        // wrap this in a function so it doesn't actually run yet, and can be throttled
        let uglifyOperation = function() {
          return writer.processFile(inFile, outFile, relativePath, writer.outputPath);
        };
        pendingWork.push(uglifyOperation);
      } else if (relativePath.slice(-4) === '.map') {
        if (writer.excludes.match(`${relativePath.slice(0, -4)}.{js,mjs}`)) {
          // ensure .map files for excluded JS paths are also copied forward
          symlinkOrCopy.sync(inFile, outFile);
        }
        // skip, because it will get handled when its corresponding JS does
      } else {
        symlinkOrCopy.sync(inFile, outFile);
      }
    });
  });

  try {
    await queue(worker, pendingWork, writer.concurrency);
    return writer.outputPath;
  } finally {
    // make sure to shut down the workers on both success and error case
    writer.pool.terminate();
  }
};

UglifyWriter.prototype._isJSExt = function(relativePath) {
  return relativePath.slice(-3) === '.js' || relativePath.slice(-4) === '.mjs';
};

UglifyWriter.prototype.processFile = function(inFile, outFile, relativePath, outDir) {
  // don't run this in the workerpool if concurrency is disabled (can set JOBS <= 1)
  if (this.concurrency > 1) {
    debug('running in workerpool, concurrency=%d', this.concurrency);
    // each of these arguments is a string, which can be sent to the worker process as-is
    return this.pool.exec('processFileParallel', [inFile, outFile, relativePath, outDir, silent, this.options]);
  }
  debug('not running in workerpool');
  return processFile(inFile, outFile, relativePath, outDir, silent, this.options);
};
