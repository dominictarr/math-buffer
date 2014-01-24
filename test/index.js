var big = require('../')
var tape = require('tape')
var u = require('./util')
function B () {
  return new Buffer([].slice.call(arguments))
}

var clone = u.clone
var equal = u.equal

function createTest(t, forward, reverse, mutate) {
  return function (a, b, c) {
    var r, r2

    equal(t, r = big[forward](a, b), c,
      r.inspect() + ' == ' + forward + '('+a.inspect()+', ' + b.inspect()+')')

    if(reverse)
      equal(t, r2 = big[reverse](r, b), a,
        r2.inspect() + ' == ' + reverse + '('+a.inspect()+', ' + b.inspect()+')')

    if(mutate) {
      var _a = new Buffer(a)

      equal(t, r = big[forward](_a, b, _a), c,
        _a.inspect() + ' == ' + forward + '('+a.inspect()+', ' + b.inspect()+', m)')

      if(reverse)
        equal(t, big[reverse](r, b, r), a,
          _a.inspect() + ' == ' + forward + '('+r.inspect()+', ' + b.inspect()+')')
    }
  }
}

tape('add/sub with mutate', function (t) {

  var test = createTest(t, 'add', 'sub', true)

  //simple
  test(B(0, 1),    B(1, 0),    B(1, 1))

  //carry
  test(B(0x80, 0), B(0x80, 0), B(0, 1))

  //carry
  test(B(0x80, 0), B(0x80, 0), B(0, 1))

  //two carries
  test(B(0x80, 0xff, 0), B(0x80, 0, 0), B(0, 0, 1))

  //xfffff + 0xffff == 0x1fffe
  test(B(0xff, 0xff, 0), B(0xff, 0xff, 0), B(0xfe, 0xff, 0x01))
  t.end()
})

tape('ADD - add two buffers', function (t) {
  var a = new Buffer([0x01, 0x02, 0x03])
  var b = new Buffer([0x04, 0x04, 0x06])
  var c = new Buffer([0x05, 0x06, 0x09])
  equal(t, big.add(a, b),      c)
  equal(t, big.subtract(c, b), a)
  equal(t, big.subtract(c, a), b)
  t.end()
})

tape('ADD - add with with carry', function (t) {
  var a = new Buffer([0xf0, 0x00, 0x00])
  var b = new Buffer([0x13, 0x07, 0x00])
  var c = new Buffer([0x03, 0x08, 0x00])
  equal(t, big.add(a, b),      c)
  equal(t, big.subtract(c, b), a)
  equal(t, big.subtract(c, a), b)
  t.end()
})

tape('add with carry2', function (t) {
  var a = new Buffer([0xf0, 0xff, 0x00])
  var b = new Buffer([0x13, 0x00, 0x00])
  var c = big.add(a, b)
  equal(t, c, new Buffer([0x03, 0x00, 0x01]))
  t.end()
})

tape('ADD - carry over', function (t) {
  var a = new Buffer([0xff, 0xff, 0xff])
  var b = new Buffer([0x01, 0x00, 0x00])
  var c = big.add(a, b, new Buffer(4))
  equal(t, c, new Buffer([0x00, 0x00, 0x00, 0x01]))
  t.end()
})

tape('multiply', function (t) {
  var a = new Buffer([0x01, 0x02, 0x03])
  var b = new Buffer([0x02, 0x00, 0x00])
  var c = new Buffer([0x02, 0x04, 0x06])
  equal(t, big.mul(a, b), c)
  t.end()
})

tape('multiply - carry', function (t) {
  var a = new Buffer([0x10, 0x00])
  var b = new Buffer([0x10, 0x00])
  var c = new Buffer([0x00, 0x01])
  equal(t, big.mul(a, b), c)
  t.end()
})

tape('multiply - carry2', function (t) {
  var a = new Buffer([0x00, 0x10])
  var b = new Buffer([0x00, 0x10])
  var c = new Buffer([0x00, 0x00, 0x00, 0x01])
  var m = new Buffer(4); m.fill()
  equal(t, big.mul(a, b, m), c)
  t.end()
})

tape('multiply - carry3', function (t) {
  var a = new Buffer([0x10, 0x10])
  var b = new Buffer([0x10, 0x10])
  var c = new Buffer([0x00, 0x01, 0x02, 0x01])
  var m = new Buffer(4); m.fill()
  equal(t, big.mul(a, b, m), c)
  t.end()
})


tape('multiply - carry3', function (t) {
  var a = new Buffer([0x12, 0x34])
  var b = new Buffer([0x56, 0x78])
  var c = new Buffer([0x0c, 0xee, 0x79, 0x18])
  var m = new Buffer(4); m.fill()
  equal(t, big.mul(a, b, m), c)
  t.end()
})

tape('modInt', function (t) {
  var a = new Buffer([0, 0, 0x12, 0x34])
  t.equal(big.modInt(a, 0x13), 0x11)
  t.end()
})

tape('modInt2', function (t) {
  var a = new Buffer([0, 0, 0, 0, 0x12, 0x34])
  t.equal(big.modInt(a, 0x130000), 0x110000)
  t.end()
})

tape('modInt3', function (t) {
  var a = new Buffer([0x12, 0x34, 0x56, 0x78, 0x9a, 0, 0, 0])
  t.equal(big.modInt(a, 0x123456), 0x0847ea)
  t.end()
})

tape('modInt4', function (t) {
  var a = B(0xab, 0x33, 0, 0)
  t.equal(big.modInt(a, 28), 11)
  t.end()
})


tape('compare', function (t) {
  var a = B(0, 0, 0, 0, 1), b = B(0, 0, 0, 0, 2)
  t.equal(big.compare(a, b), -1)
  t.equal(big.compare(b, a), 1)
  t.equal(big.compare(a, a), 0)
  t.equal(big.compare(b, b), 0)
  var c = B(126, 99, 2, 0, 1, 2, 0x4a, 0xff), d = B(127, 99, 2, 0, 1, 2, 0x4a, 0xff)
  t.equal(big.compare(c, d), -1)
  t.equal(big.compare(d, c), 1)
  t.equal(big.compare(c, c), 0)
  t.equal(big.compare(d, d), 0)
  t.end()
})

tape('shift 1', function (t) {
  equal(t, big.shift(B(0, 1), 1), B(0, 2))
  equal(t, big.shift(B(0, 1), 2), B(0, 4))
  equal(t, big.shift(B(0, 1), 3), B(0, 8))
  equal(t, big.shift(B(1, 0), 3), B(8, 0))
  equal(t, big.shift(B(0x80, 0), 1), B(0, 1))
  t.end()
})
tape('shift 2, reverse', function (t) {
  equal(t, big.shift(B(0, 2), -1), B(0, 1))
  equal(t, big.shift(B(0, 4), -2), B(0, 1))
  equal(t, big.shift(B(0, 8), -3), B(0, 1))
  equal(t, big.shift(B(8, 0), -3), B(1, 0))
  equal(t, big.shift(B(0, 1), -1), B(0x80, 0))
  t.end()
})

tape('shift2', function (t) {
  equal(t, big.shift(B(0, 1, 0),  9), B(0, 0, 2))
  equal(t, big.shift(B(0, 1, 0), 10), B(0, 0, 4))
  equal(t, big.shift(B(0, 1, 0), 11), B(0, 0, 8))
  equal(t, big.shift(B(1, 0, 0), 11), B(0, 8, 0))
  equal(t, big.shift(B(0x80, 0, 0),  9), B(0, 0, 1))

  equal(t, big.shift(B(0, 0, 2), -17), B(1, 0, 0))
  equal(t, big.shift(B(0, 0, 4), -17), B(2, 0, 0))
  equal(t, big.shift(B(0, 0, 8), -17), B(4, 0, 0))
  equal(t, big.shift(B(0, 8, 0), -11), B(1, 0, 0))
  equal(t, big.shift(B(0, 0, 1), -9), B(0x80, 0, 0))
  t.end()
})


//it ought to be possible to do shift on the same buffer!

tape('shift - mutate', function (t) {
  function shift(a, b, n) {
    var _a = new Buffer(a), _b = new Buffer(b)
    big.shift(_a, n, _a)
    equal(t, _a, b)
    big.shift(_a, -1*n, _a)
    equal(t, _a, a)
  }
  shift(B(1), B(2), 1)
  shift(B(0x07, 0x00), B(0, 0x1c), 10)
  t.end()
})

tape('most significant bit', function (t) {
  t.equal(big.mostSignificantBit(B(1, 2, 3)), 18)
  t.equal(big.mostSignificantBit(B(1, 3)), 10)
  t.equal(big.mostSignificantBit(B(0x80)), 8)
  t.equal(big.mostSignificantBit(B(0, 0x80)), 16)
  t.equal(big.mostSignificantBit(B(0, 0, 0x80)), 24)
  t.equal(big.mostSignificantBit(B(0, 0, 0, 0x80)), 32)
  t.equal(big.mostSignificantBit(B(0, 0, 1)), 17)
  t.end()
})


tape('divide', function (t) {
  var q = new Buffer(10), r = new Buffer(10)
//  big.divide(B(0, 1, 22, 3, 4, 5), B(1, 53, 233, 234, 10), q, r)
//  var r = .r
  equal(t, big.divide(B(0x80), B(8)), {remainder: B(0), quotient: B(0x10)})
  equal(t, big.divide(B(0x80), B(7)), {remainder: B(2), quotient: B(0x12)})
  equal(t, big.divide(B(0, 0x80), B(7, 0)), {remainder: B(1, 0), quotient: B(0x49, 0x12)})

  equal(t, big.divide(B(0x34, 0x12), B(0, 7)), {remainder: B(0x34, 4), quotient: B(0x02, 0)})
  equal(t, big.divide(B(0x34, 0x12), B(7, 0)), {remainder: B(5, 0), quotient: B(0x99, 0x02)})
  t.end()
})

tape('square', function (t) {
  equal(t, big.square(B(1)),          B(1))
  equal(t, big.square(B(2)),          B(4))
  equal(t, big.square(B(0x80, 0)),       B(0, 0x40))
  equal(t, big.square(B(0xff, 0)), B(0x01, 0xfe))
  equal(t, big.square(B(0xff, 0xff, 0, 0)), B(0x01, 0, 0xfe, 0xff))
  equal(t, big.square(B(0xff, 0xff, 0xff, 0, 0, 0)), B(0x01, 0, 0, 0xfe,0xff, 0xff))

  t.end()
})

function testIntExp(t, base, exponent, mod) {
  var result = Math.pow(base, exponent)
  if(mod) result = result % mod

  //only test if we didn't overflow
  var exp = base+'^'+exponent+(mod ? '%'+mod : '')+'==='+result
  if(result > 0xffffffff)
    throw new Error('cant calculate with int:'+exp)
  var b = big.fromInt(base, 8)
  var e = big.fromInt(exponent, 8)
  var m = mod && big.fromInt(mod, 8)
  var r = big.fromInt(result, 8)
  equal(t, r, big.power(b, e, m))
}

tape('power', function (t) {
  equal(t, big.power(B(2), B(4)), B(0x10))
  equal(t, big.power(B(0x3, 0, 0, 0, 0), B(0x17, 0, 0, 0, 0)), B(0x4b, 0xe8, 0x5e, 0xeb, 0x15))

  //test with some random numbers
  testIntExp(t, 2, 27)
  testIntExp(t, 3, 17)
  testIntExp(t, 5, 13)
  testIntExp(t, 5, 11)
  testIntExp(t, 7, 7)

  testIntExp(t, 2, 27, 5234)
  testIntExp(t, 3, 27, 79234)
  testIntExp(t, 5, 13, 3412)
  testIntExp(t, 5, 11, 333453)
  testIntExp(t, 7, 7, 13131)

  t.end()
})

tape('power modulus', function (t) {
  equal(t, big.power(B(0x3, 0, 0), B(0x17, 0, 0), B(0x19)), B(2, 0, 0))
  t.end()
})

tape('gcd', function (t) {
  equal(t, big.gcd(B(45, 0), B(95, 0)), B(5, 0))
  equal(t, big.gcd(B(46, 200), B(193, 200)), B(3, 0))
  equal(t, big.gcd(B(0x9f, 0xf4, 0xb8, 0x57, 0x37, 0xdf, 0x02),
                   B(0x89, 0x41, 0xe5, 0x1b, 0xda, 0x9a, 0x01)),
           B(0x39, 0xbe, 0x23, 0, 0, 0, 0))
  t.end()
})

tape('inverse', function (t) {

  equal(t, big.inverse(big.fromInt(23), big.fromInt(7)), big.fromInt(4))
  equal(t, big.inverse(big.fromInt(23), big.fromInt(17)), big.fromInt(3)) 
  equal(t, big.inverse(big.fromInt(235), big.fromInt(171)), big.fromInt(163)) 
  equal(t, big.inverse(big.fromInt(235123), big.fromInt(112341347)), big.fromInt(11542649))
  t.end()

})
