

//add two buffers,
//putting least significant at left will be simplest.
exports.add = function (a, b, c) {
  var l = Math.max(a.length, b.length)
  if(!c) c = new Buffer(l);
  c.fill()
  var carry = 0
  for(var i = 0; i < l; i++) {
    var v = (a[i] || 0) + (b[i] || 0) + carry
    c[i] = v & 0xff
    carry = v >> 8
  }
  if(carry) {//check if last item is a carry.
//    var _c = c
//    if(c.length === l) {
//      c = new Buffer(l + 1)
//      _c.copy(c)
//    }
    c[l] = carry
  }
  return c
}

//there are no negatives, so make sure A is larger.
exports.sub =
exports.subtract = function (a, b, c) {
  var l = Math.max(a.length, b.length)
  if(!c) c = new Buffer(l)
  c.fill()
  console.log(a, b, c)
  var carry = 0
  for(var i = 0; i < l; i++) {
    var A = (a[i] || 0), B = (b[i] || 0) + carry
    if(A < B) {
      A += 256
      carry = 1
    } else
      carry = 0
    c[i] = A - B
  }
  return c
}
