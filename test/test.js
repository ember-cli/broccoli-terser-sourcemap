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

  beforeEach(async function() {
    input = await createTempDir();
  });

  it('generates expected output', async function() {
    var tree = new uglify(fixtures);
    builder = createBuilder(tree);

    await builder.build();

    var result = builder.read();
    expect(result).toMatchSnapshot();
  });

  it('can handle ES6 code', async function() {
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

    await builder.build();

    var result = builder.read();
    expect(result).toMatchSnapshot();
  });

  it('can disable sourcemaps', async function() {
    var tree = new uglify(fixtures, { uglify: { sourceMap: false } });
    builder = createBuilder(tree);

    await builder.build();

    var result = builder.read();
    expect(result).toMatchSnapshot();
  });

  it('can exclude files from getting uglified', async function() {
    var tree = new uglify(fixtures, {
      exclude: ['inside/with-up*']
    });

    builder = createBuilder(tree);

    await builder.build();

    var result = builder.read();
    expect(result).toMatchSnapshot();
  });


  it('supports alternate sourcemap location', async function() {
    var tree = new uglify(fixtures, { sourceMapDir: 'maps' });
    builder = createBuilder(tree);

    await builder.build();

    var result = builder.read();
    expect(result).toMatchSnapshot();
  });

  afterEach(async function() {
    if (input) {
      await input.dispose();
    }
    if (builder) {
      await builder.dispose();
    }
  });
});
