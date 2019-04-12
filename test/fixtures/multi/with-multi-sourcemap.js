/* This is my header. */
function meaningOfLife() {
  var thisIsALongLocal = 42;
  throw new Error(thisIsALongLocal);
}

function boom() {
  throw new Error('boom');
}
function somethingElse() {
  throw new Error("somethign else");
}

//# sourceMappingURL=missing-sourcemap.map

function fourth(){
  throw new Error('fourth');
}
function third(){
  throw new Error("oh no");
}
//# sourceMappingURL=with-multi-sourcemap.map