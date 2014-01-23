//add two buffers,
//putting least significant at left will be simplest.
//iterate over buffers from lsb to msb
//and add each byte & 0xff, carrying overflow.

var fromInt = exports.fromInt = function (int, length) {
  var b = new Buffer(Math.max(length || 0, 4))
  b.fill()
  b.writeInt32LE(int, 0)
  return b
}

var isZero = exports.isZero = function (v) {
  var l = v.length
  while(l--) if(v[l]) return false
  return true
}

var isOne = exports.isOne = function (v) {
  var l = v.length
  while(l--) {
    if(l === 0)   return v[0] === 1
    else if(v[l]) return false
  }
  return true
}

//okay, need addShift(a, b, n)
//a + (b<<n)

var add = exports.add = function (a, b, c) {
  var l = Math.max(a.length, b.length)

  if(a.length == b.length && (a[l-1] + b[l-1])>>1)
    l ++

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
    var x = a[l] || 0
    var y = b[l] || 0
    if(x !== y)
      return x < y ? -1 : 1
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

var multiply = exports.mul =
exports.multiply = function (a, b, m) {
  var l = a.length + b.length, prev = 0
  var w = new Buffer(l); w.fill()

  ;(Array.isArray(b) ? new Buffer(b) : b).copy(w)

  if(!m) m = new Buffer(l)
  if(a !== m) m.fill() //m must be zeros, or it will affect stuff.

  var bits = l<<3
  for(var i = 0; i < bits; i++) {
    if(getBit(a, i)) {
      shift(w, i - prev, w)
      prev = i
      add(m, w, m)
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

var mostSignificantBit
var msb = mostSignificantBit = exports.msb =
exports.mostSignificantBit = function (a) {
  var l = a.length
  while(l--)
    if(a[l]) return ((l)*8)+_msb(a[l])
  return 0
}
var getBit =
exports.getBit = function (q, bit) {
  return q[bit>>3] & 1<<(bit%8)
}

var divide = exports.divide = exports.div = function (a, b, q, r) {
  if(!q) q = new Buffer(a.length)
  if(!r) r = new Buffer(a.length)
  q.fill(); r.fill()
  //if b is larger, then a is the remainder
  if(compare(b, a) > 1) {
    q.fill()
    ;(Array.isArray(r) ? new Buffer(r) : r).copy(a) //remainder is the same
    return {quotient: q, remainder: r}
  }
  var mA = msb(a), mB = msb(b)

  var _b  = new Buffer(a.length)
  var _b2 = new Buffer(a.length)
  var _r  = new Buffer(a.length)
  _b.fill()
  ;(Array.isArray(a) ? new Buffer(a) : a ).copy(r)

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

var square = exports.square = function (a, m) {
  return multiply(a, a, m)
}

//exports.exponent
//http://en.wikipedia.org/wiki/Modular_exponentiation#Right-to-left_binary_method

var pow = exports.pow =
exports.power = function (base, exp, mod) {
  var result = new Buffer(exp.length)
  result.fill()
  result[0] = 1

  var modulus = mod ? function (v) {
    return divide(v, mod).remainder
  } : function (id) { return id }

  var msb = mostSignificantBit(exp)
  for(var i = 0; i < msb; i++) {
    if(getBit(exp, i))
      result = modulus(multiply(result, base))
    base = modulus(square(base))
  }

  return result
}

// greatest common divisor
// http://en.wikipedia.org/wiki/Binary_GCD_algorithm

exports.gcd = function (u, v, mutate) {
  if(!mutate) {
    u = new Buffer(u)
    v = new Buffer(v)
  }

  var shifts = 0;

  //GCD(0,v) == v; GCD(u,0) == u, GCD(0,0) == 0
  if (isZero(u)) return v;
  if (isZero(v)) return u;

  // if u and v are divisible by 2, then gcd must be 2*something.
  // gcd(v, u) == gcd(v/2, u/2)*2
  // shift out a factor of two, and we'll add it back at the end.
  for (shifts = 0; ((u[0] | v[0]) & 1) == 0; ++shifts) {
     shift(u, -1, u)
     shift(v, -1, v)
  }

  //NOTE:  v & 1 == isEven
  //      ~v & 1 == isOdd (~ flips the last 0 into 1, then ands it with 1)

  //while u is even, divide by two.
  while (isEven(u)) {
    shift(u, -1, u)
  }

  //From here on, u is always odd.
  do {
   //if v is even, 2 cannot be a divisor.
   while (isEven(v)) shift(v, -1, v)

   // Now u and v are both odd.
   // swap so that v is larger, so that we can safely subtract v - u
    if (compare(u, v) > 0) {
      var t = v; v = u; u = t;
    }
    v = subtract(v, u)
    //v is now even, because even = odd1 - odd2
  } while (!isZero(v))

  //multiply by the factors of 2 we removed at line 240
  return shift(u, shifts, u)
}

var isOdd = exports.isOdd = function (p) {
  return !!(p[0] & 1)
}

var isEven = exports.isEven = function (p) {
  return !(p[0] & 1)
}

exports.inverse = function (n, p) {
  var a = fromInt(1, n.length), b = fromInt(0, n.length)
  var x = new Buffer(n), y = new Buffer(p)
  var tmp, i, nz=1;
  
  if(isEven(p))
    throw new Error("inverse: p must be odd"+p);
  
  // invariant: y is odd
  do {
    if (isOdd(x)) {
      if (compare(x, y) < 0) {
        // x < y; swap everything
        tmp = x; x = y; y = tmp;
        tmp = a; a = b; b = tmp;
      }

      subtract(x, y, x)
      if(compare(a, b) < 0) add(a, p, a)
      subtract(a, b, a)
    }
    
    // cut everything in half
    shift(x, -1, x)
    if (isOdd(a)) add(a, p, a)
    shift(a, -1, a)
  } while(!isZero(x))
  
  if (!isOne(y)) throw new Error("inverseMod: p and x must be relatively prime")
  return b;
}


function _lsb (x) {
  if(x == 0) return -1
  return (
    x & 0x0F
    ? x & 0x03 ? x & 0x01 ? 0 : 1 : x & 0x04 ? 2 : 3
    : x & 0x30 ? x & 0x10 ? 4 : 5 : x & 0x20 ? 6 : 7
  )
}

var lowestSetBit = exports.lowestSetBit = function (n) {
  for(var i = 0; i < n.length; i++)
    if(n[i]) return i + _lsb(n[i])
  return -1
}

