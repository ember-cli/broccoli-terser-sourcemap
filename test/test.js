/* global describe, afterEach, it, expect */

var expect = require('chai').expect;  // jshint ignore:line
var uglify = require('..');
var fs = require('fs');
var path = require('path');
var broccoli = require('broccoli');
var mkdirp = require('mkdirp');

var fixtures = path.join(__dirname, 'fixtures');
var builder;

describe('broccoli-uglify-sourcemap', function() {
  it('generates expected output', function() {
    var tree = new uglify(fixtures);
    builder = new broccoli.Builder(tree);
    return builder.build().then(function(result) {
      expectFile('with-upstream-sourcemap.js').in(result);
      expectFile('with-upstream-sourcemap.map').in(result);
      expectFile('no-upstream-sourcemap.js').in(result);
      expectFile('no-upstream-sourcemap.map').in(result);
      expectFile('something.css').in(result);
    });
  });

  afterEach(function() {
    if (builder) {
      return builder.cleanup();
    }
  });
});



function expectFile(filename) {
  function inner(result) {
    var actualContent = fs.readFileSync(path.join(result.directory, filename), 'utf-8');
    mkdirp.sync(path.dirname(path.join(__dirname, 'actual', filename)));
    fs.writeFileSync(path.join(__dirname, 'actual', filename), actualContent);

    var expectedContent;
    try {
      expectedContent = fs.readFileSync(path.join(__dirname, 'expected', filename), 'utf-8');
    } catch (err) {
      console.warn("Missing expcted file: " + path.join(__dirname, 'expected', filename));
    }

    expect(actualContent).to.equal(expectedContent, "discrepancy in " + filename);
  }
  return { in: inner };
}
