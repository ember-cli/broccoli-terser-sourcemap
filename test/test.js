'use strict';

/* global describe, afterEach, it, expect */

const Terser = require('..');
const path = require('path');
const { createTempDir, createBuilder } = require('broccoli-test-helper');

const fixtures = path.join(__dirname, 'fixtures');
const fixturesError = path.join(__dirname, 'fixtures-error');

describe('broccoli-terser-sourcemap', function() {
  let input, builder;

  beforeEach(async function() {
    input = await createTempDir();
  });

  it('generates expected output', async function() {
    builder = createBuilder(new Terser(fixtures));

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

    builder = createBuilder(new Terser(input.path()));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });

  it('can disable sourcemaps', async function() {
    builder = createBuilder(new Terser(fixtures, { terser: { sourceMap: false } }));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });

  it('supports hidden sourcemaps', async function() {
    builder = createBuilder(new Terser(fixtures, { hiddenSourceMap: true }));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });

  it('supports public URL for sourcemaps', async function() {
    builder = createBuilder(new Terser(fixtures, { publicUrl: 'https://example.com' }));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });

  it('can exclude files from getting uglified', async function() {
    builder = createBuilder(new Terser(fixtures, {
      exclude: ['inside/with-up*'],
    }));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });


  it('supports alternate sourcemap location', async function() {
    builder = createBuilder(new Terser(fixtures, { sourceMapDir: 'maps' }));

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
  });

  it('shuts down the workerpool', async function() {
    let testTerser = new Terser(fixtures);
    builder = createBuilder(testTerser);

    await builder.build();

    expect(builder.read()).toMatchSnapshot();
    expect(testTerser.pool.stats().totalWorkers).toEqual(0);
  });

  describe('on error', function() {
    it('rejects with BuildError', async function() {
      builder = createBuilder(new Terser(fixturesError));

      let shouldError;
      await builder.build()
        .catch(err => {
          shouldError = err;
        });
      expect(shouldError.name).toEqual('BuildError');

      expect(builder.read()).toMatchSnapshot();
    });

    it('shuts down the workerpool', async function() {
      let testTerser = new Terser(fixturesError);
      builder = createBuilder(testTerser);

      await builder.build().catch(() => {});

      expect(builder.read()).toMatchSnapshot();
      expect(testTerser.pool.stats().totalWorkers).toEqual(0);
    });
  });

  describe('concurrency', function() {
    afterEach(function() {
      delete process.env.JOBS;
    });

    it('defaults to CPUs-1 workers', async function() {
      let testTerser = new Terser(fixturesError);

      expect(testTerser.concurrency).toEqual(require('os').cpus().length - 1);
    });

    it('sets concurrency using the option', async function() {
      let testTerser = new Terser(fixturesError, { concurrency: 145 });

      expect(testTerser.concurrency).toEqual(145);
    });

    it('overrides concurrency with JOBS env variable', async function() {
      process.env.JOBS = '7';
      let testTerser = new Terser(fixturesError, { concurrency: 145 });

      expect(testTerser.concurrency).toEqual(7);
    });
  });

  describe('mjs', function() {
    it('can minify .mjs files', async function() {
      builder = createBuilder(new Terser(fixtures));

      await builder.build();

      expect(builder.read()).toMatchSnapshot();
    });
  });

  describe('deprecation', function() {
    it('deprecated async option', async function() {
      let shouldError;
      try {
        builder = createBuilder(new Terser(fixtures, { async: true }));
      } catch (err) {
        shouldError = err;
      }

      expect(shouldError.name).toEqual('Error');
      expect(shouldError.message).toEqual('\n Passing `async` property inside `options` is deprecated.');
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
