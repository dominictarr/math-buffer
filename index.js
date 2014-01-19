

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
exports.modInt = function (a, n, c) {
  var l = a.length
  if(!c) c = new Buffer(l)
  a.copy(c)
  l = l - 4
  do {
    
//    var v = readInt(c, l) % n
    console.log(l)
    var v
    c.writeInt32LE(v = c.readInt32LE(l) % n, l)
    console.log(v, v.toString(16))
  } while(l--)
  return c
}
