//add two buffers,
//putting least significant at left will be simplest.
//iterate over buffers from lsb to msb
//and add each byte & 0xff, carrying overflow.


//okay, need addShift(a, b, n)
//a + (b<<n)
var add = exports.add = function (a, b, c) {
  var l = Math.max(a.length, b.length)
  if(!c) { c = new Buffer(l); c.fill() }
  var carry = 0
  for(var i = 0; i < l; i++) {
    var v = (a[i] || 0) + (b[i] || 0) + carry
    c[i] = v & 0xff
    carry = v >> 8
  }
  if(carry)//check if last item is a carry.
    c[l] = carry
  return c
}

//there are no negatives, so make sure A is larger.
//basically the reverse of add.
var subtract = exports.sub =
exports.subtract = function (a, b, c) {
  var l = Math.max(a.length, b.length)
  if(!c) { c = new Buffer(l); c.fill() }
  var carry = 0
  for(var i = 0; i < l; i++) {
    var A = (a[i] || 0), B = (b[i] || 0) + carry
    if(A < B) {
      A += 256; carry = 1
    } else
      carry = 0
    c[i] = A - B
  }
  return c
}

//mulitply.
//multiply each pair of places and accumulate results in a new buffer.
var multiply = exports.mul =

exports.multiply = function (a, b, c) {
  var l = Math.max(a.length, b.length)
  if(!c) c = new Buffer(l)
  c.fill()
  if(c === a || c === b) throw new Error('multiply cannot mutate')

  //for each place in A, multiply each place in B,
  //and add it to the running total.
  for(var i = 0; i < b.length; i++) {
    for(var j = 0; j < a.length; j++) {
      var value = b[i] * a[j]
      var current = (c[i + j]||0) | ((c[i + j + 1]<<8) || 0)
      var v = current + value
      c[i + j]     = v & 0xff
      c[1 + i + j] = v >>> 8
    }
  }
  return c
}

// a % n (where n is < 2^31)
// this uses Buffer#readInt32LE
// so, buffers length must be multiple of 4.
// should also be able to adapt this to divide by int,
// which would be useful for converting to different bases (like base 10, or 58)

exports.modInt = function (a, n) {
  var l = a.length, w = 0
  while(l--) w = (w << 8 | a[l]) % n
  return w
}

//return -1, 0, or 1 if a < b, a == b, a > b

var compare = exports.compare = function (a, b) {
  var l = Math.max(a.length, b.length)
  while(l--) {
    if((a[l] || 0) !== (b[l] || 0))
      return a[l] < b[l] ? -1 : 1
  }
  return 0
}

var shift = exports.shift = function (a, n, c) {
  //if the shift is larger than a byte, iterate.
  //aha! just shift n%8, and then shift (n - (n%8))/8 bytes.

  var bits  = n%8
  var bytes =  (n - bits)/8
  if(!c) { c = new Buffer(a.length); c.fill() }

  var carry = 0
  if(n > 0) {
    for(var i = a.length - 1; i >= -bytes; i--) {
      var v = a[i] << bits
      c[i + bytes + 1] = carry | v >> 8
      carry = c[i + bytes] = v & 0xff
    }
  } else {
    var bits = -1*bits
    for(var i = bytes; i <= a.length; i++) {
      // shift into the second byte,
      // so that we have a chance to grab the carry.
      var v = (a[i] << 8) >> bits
      c[i + bytes - 1] = v & 0xff | carry
      carry = c[i + bytes] = v >> 8
    }
  }
  return c
}

//multiply, using shift + add
multiply =
exports.mul =
exports.multiply = function (a, b, m) {
  var w = new Buffer(b)
  var l = a.length * 8, prev = 0
  if(!m) m = new Buffer(a.length)

  m.fill() //m must be zeros, or it will affect stuff.

  for(var i = 0; i < l; i++) {
    var byte = i >> 3, bit = i % 8

    //if this bit is 1
    if(a[byte] & (1 << bit)) {
      shift(w, i - prev, w)
      prev = i
      m = add(m, w)
    }
  }
  return m
}

function _msb (x) {
  return (
    x & 0xF0
    ? x & 0xC0 ? x & 0x80 ? 8 : 7 : x & 0x20 ? 6 : 5
    : x & 0x0C ? x & 0x08 ? 4 : 3 : x & 0x02 ? 2 : x
  )
}

var msb =
exports.msb =
exports.mostSignificantBit = function (a) {
  var l = a.length
  while(l--)
    if(a[l]) return ((l)*8)+_msb(a[l])
  return 0
}

exports.divide = function (a, b, q, r) {
  if(!q) q = new Buffer(a.length)
  if(!r) r = new Buffer(a.length)
  q.fill(); r.fill()
  //if b is larger, then a is the remainder
  if(compare(b, a) > 1) {
    q.fill()
    r.copy(a) //remainder is the same
    return {quotient: q, remainder: r}
  }
  var mA = msb(a), mB = msb(b)

  var _b  = new Buffer(a.length)
  var _b2 = new Buffer(a.length)
  var _r  = new Buffer(a.length)
  _b.fill()
  a.copy(r)

  //shift b to line up with a.
  shift(b, mA - mB, _b)

  // instead of shifting this along 1 bit at a time
  // it would probably be more performant to find the
  // next most significant bit and move that far.
  // at least in sparse numbers.
  var bit = mA - mB
  while(bit >= 0) {
    if(compare(_b, r) <= 0) {
      subtract(r, _b, _r)
      var t = r; r = _r; _r = t
      //set 1 bit of quotent!
      q[bit>>3] |= 1<<(bit%8)
    }

    shift(_b, -1, _b)
    bit--
  }
  return {remainder: r, quotient: q}
}

// to base:
// b.unshift(_a = (a % 10)); a = (a - _a) / 10; b

exports.square = function (a, m) {
  return multiply(a, a, m)
}
