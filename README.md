[![Build Status](https://travis-ci.org/ef4/broccoli-uglify-sourcemap.svg?branch=master)](https://travis-ci.org/ef4/broccoli-uglify-sourcemap)

A broccoli filter that applies uglify-js while properly generating or
maintaining sourcemaps.

### installation

```sh
npm install --save broccoli-uglify-writer
```

### usage

```js
var uglify = require('broccoli-uglify-writer');

// basic usage
var uglified = uglify(input);

// advanced usage
var uglified = uglify(input, {
  mangle: true,   // defaults to true
  compress: true, // defaults to true
  sourceMapIncludeSources: true // defaults to true
  exclusion: [..] // array of globs, to not minify
  //...
  sourceMapConfig: {
    enabled: true, // defaults to true
    extensions: [ 'js' ] // defaults to [ 'js' ]
  }
});
```
