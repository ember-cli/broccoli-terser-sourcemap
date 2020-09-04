[![Build Status](https://travis-ci.org/ember-cli/broccoli-uglify-sourcemap.svg?branch=master)](https://travis-ci.org/ember-cli/broccoli-uglify-sourcemap)

A broccoli filter that applies [terser](https://github.com/terser/terser) to
uglify code while properly generating or maintaining sourcemaps.

### installation

```sh
npm install --save broccoli-uglify-sourcemap
```

### usage

```js
const Uglify = require('broccoli-uglify-sourcemap');

// basic usage
let uglified = new Uglify(input);

// advanced usage
let uglified = new Uglify(input, {
  exclude: [..], // array of globs, to not minify

  uglify: {
    mangle: false,    // defaults to true
    compress: false,  // defaults to true
    sourceMap: false, // defaults to true
    //...
  },

  publicUrl: 'https://myamazingapp.com/', // value to be prepended to sourceMappingURL, defaults to ''
  hiddenSourceMap: false, // skips adding the reference to sourcemap in the minified JS, defaults to false

  concurrency: 3 // number of parallel workers, defaults to number of CPUs - 1
});
```

To disable parallelization:

```
$ JOBS=0
$ JOBS=1
```
