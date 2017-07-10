class Foo {
  bar() {
    console.log(this.baz);
  }
}

let { bar } = Foo.prototype;
