/* global describe, afterEach, it, expect */

var uglify = require('..');
var fs = require('fs');
var path = require('path');
var helpers = require('broccoli-test-helper');

var fixtures = path.join(__dirname, 'fixtures');
var fixturesError = path.join(__dirname, 'fixtures-error');

var createTempDir = helpers.createTempDir;
var createBuilder = helpers.createBuilder;

describe('broccoli-uglify-sourcemap', function() {
  var input, builder;

  beforeEach(async function() {
    input = await createTempDir();
  });

  it('generates expected output', async function() {
    builder = createBuilder(new uglify(fixtures));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });

  it('generates expected output async', async function() {
    builder = createBuilder(new uglify(fixtures, { async: true }));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
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

    builder = createBuilder(new uglify(input.path()));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });

  it('can disable sourcemaps', async function() {
    builder = createBuilder(new uglify(fixtures, { uglify: { sourceMap: false } }));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });

  it('can exclude files from getting uglified', async function() {
    builder = createBuilder(new uglify(fixtures, {
      exclude: ['inside/with-up*']
    }));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });


  it('supports alternate sourcemap location', async function() {
    builder = createBuilder(new uglify(fixtures, { sourceMapDir: 'maps' }));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });

  it('shuts down the workerpool', async function() {
    var testUglify = new uglify(fixtures, { async: true });
    builder = createBuilder(testUglify);

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
    expect(testUglify.pool.stats().totalWorkers).toEqual(0);
  });

  describe('on error', function() {
    it('rejects with BuildError', async function() {
      builder = createBuilder(new uglify(fixturesError, {}));

      var shouldError;
      await builder.build()
        .catch(err => {
          shouldError = err;
        });
      expect(shouldError.name).toEqual('BuildError');

      expect(builder.read()).toMatchSnapshot();
    });

    it('rejects with BuildError async', async function() {
      builder = createBuilder(new uglify(fixturesError, { async: true }));

      var shouldError;
      await builder.build()
        .catch(err => {
          shouldError = err;
        });
      expect(shouldError.name).toEqual('BuildError');

      expect(builder.read()).toMatchSnapshot();
    });

    it('shuts down the workerpool', async function() {
      var testUglify = new uglify(fixturesError, { async: true });
      builder = createBuilder(testUglify);

      await builder.build().catch(err => {});

      expect(builder.read()).toMatchSnapshot();
      expect(testUglify.pool.stats().totalWorkers).toEqual(0);
    });
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
