/* global describe, afterEach, it, expect */

var uglify = require('..');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var helpers = require('broccoli-test-helper');

var fixtures = path.join(__dirname, 'fixtures');

var createTempDir = helpers.createTempDir;
var createBuilder = helpers.createBuilder;

describe('broccoli-uglify-sourcemap', function() {
  var input, builder;

  beforeEach(function() {
    return createTempDir().then(_input => (input = _input));
  });

  it('generates expected output', function() {
    var tree = new uglify(fixtures);
    builder = createBuilder(tree);
    return builder.build().then(function() {
      var result = builder.read();
      expect(result).toMatchSnapshot();
    });
  });

  it('can handle ES6 code', function() {
    input.write({
      'es6.js': `class Foo {
  bar() {
    console.log(this.baz);
  }
}

let { bar } = Foo.prototype;`,
    });

    var tree = new uglify(input.path());
    builder = createBuilder(tree);
    return builder.build().then(function() {
      var result = builder.read();
      expect(result).toMatchSnapshot();
    });
  });

  it('can disable sourcemaps', function() {
    var tree = new uglify(fixtures, { uglify: { sourceMap: false } });
    builder = createBuilder(tree);
    return builder.build().then(function() {
      var result = builder.read();
      expect(result).toMatchSnapshot();
    });
  });

  it('can exclude files from getting uglified', function() {
    var tree = new uglify(fixtures, {
      exclude: ['inside/with-up*']
    });

    builder = createBuilder(tree);
    return builder.build().then(function() {
      var result = builder.read();
      expect(result).toMatchSnapshot();
    });
  });


  it('supports alternate sourcemap location', function() {
    var tree = new uglify(fixtures, { sourceMapDir: 'maps' });
    builder = createBuilder(tree);
    return builder.build().then(function() {
      var result = builder.read();
      expect(result).toMatchSnapshot();
    });
  });

  afterEach(function() {
    var p = input ? input.dispose() : Promise.resolve();
    if (builder) {
      p = p.then(() => builder.dispose());
    }
    return p;
  });
});
