

//add two buffers,
//putting least significant at left will be simplest.
//iterate over buffers from lsb to msb
//and add each byte & 0xff, carrying overflow.

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
//basically the reverse of add.
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

//mulitply.
//multiply each pair of places and accumulate results in a new buffer.
exports.mul =
exports.multiply = function (a, b, c) {
  var l = Math.max(a.length, b.length)
  if(!c) c = new Buffer(l)
  c.fill()
  //for each place in A, multiply each place in B,
  //and add it to the running total.
  for(var i = 0; i < b.length; i++) {
    for(var j = 0; j < a.length; j++) {
      var value = b[i] * a[j]
      var current = (c[i + j]||0) + ((c[i + j + 1]<<8) || 0)
      var v = current + value
      c[i + j]     = v & 0xff
      c[1 + i + j] = v >> 8
    }
  }
  return c
}

function readInt(b, n) {
  return b[n] | (b[n + 1]||0)<<8 | (b[n + 2]||0)<<16 | (b[n + 2]||0)<<24
}

// a % n (where n is < 2^31)
// this uses Buffer#readInt32LE
// so, buffers length must be multiple of 4.
exports.modInt = function (a, n, c) {
  var l = a.length
  if(!c) c = new Buffer(l)
  a.copy(c)
  l = l - 4
  do {
    c.writeInt32LE(c.readInt32LE(l) % n, l)
  } while(l--)
  return c
}

//return -1, 0, or 1 if a < b, a == b, a > b
exports.compare = function (a, b) {
  var l = Math.max(a.length, b.length)
  while(l--) {
    if((a[l] || 0) !== (b[l] || 0))
      return a[l] < b[l] ? -1 : 1
  }
  return 0
}

exports.shift = function (a, n, c) {
  //if the shift is larger than a byte, iterate.
  if(!c) c = new Buffer(a.length)
  if(Math.abs(n) > 8) throw new Error('not implemented yet')
  var carry = 0
  if(n > 0) {
    for(var i = 0; i < a.length; i++) {
      var v = a[i] << n
      c[i] = v & 0xff | carry
      carry = v >> 8
    }
    c[a.length] = carry
  } else {
    var m = -1*n
    for(var i = a.length; i >= 0; i--) {
      // shift into the second byte,
      // so that we have a chance to grab the carry.
      var v = (a[i] << 8) >> m
      c[i] = v>>8 & 0xff | carry
      carry = v & 0xff
    }
    c[a.length] = carry
  }
  return c
}

function msb (x) {
  return (
    x & 0xF0
    ? x & 0xC0 ? x & 0x80 ? 8 : 7 : x & 0x20 ? 6 : 5
    : x & 0x0C ? x & 0x08 ? 4 : 3 : x & 0x02 ? 2 : x
  )
}

exports.msb =
exports.mostSignificantBit = function (a) {
  var l = a.length
  while(l--)
    if(a[l]) return ((l)*8)+msb(a[l])
  return 0
}

exports.divide = function (a, b, q, r) {

}
