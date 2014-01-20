var big = require('../')
var tape = require('tape')

function B () {
  return new Buffer([].slice.call(arguments))
}

function equal(t, a, b) {
  t.deepEqual(a.toJSON(), b.toJSON())
}

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
  equal(t, big.mul(a, b, new Buffer(4)), c)
  t.end()
})

tape('multiply - carry3', function (t) {
  var a = new Buffer([0x10, 0x10])
  var b = new Buffer([0x10, 0x10])
  var c = new Buffer([0x00, 0x01, 0x02, 0x01])
  equal(t, big.mul(a, b, new Buffer(4)), c)
  t.end()
})

tape('multiply - carry3', function (t) {
  var a = new Buffer([0x12, 0x34])
  var b = new Buffer([0x56, 0x78])
  var c = new Buffer([0x0c, 0xee, 0x79, 0x18])
  equal(t, big.mul(a, b, new Buffer(4)), c)
  t.end()
})


tape('modInt', function (t) {
  var a = new Buffer([0, 0, 0x12, 0x34])
  equal(t, big.modInt(a, 0x13), new Buffer([0x11, 0, 0, 0]))
  t.end()
})

tape('modInt2', function (t) {
  var a = new Buffer([0, 0, 0, 0, 0x12, 0x34])
  equal(t, big.modInt(a, 0x130000), new Buffer([0, 0, 0x11, 0, 0, 0]))
  t.end()
})

tape('modInt3', function (t) {
  var a = new Buffer([0x12, 0x34, 0x56, 0x78, 0x9a, 0, 0, 0])
  equal(t, big.modInt(a, 0x123456), new Buffer([0xea, 0x47, 0x08, 0, 0, 0, 0, 0]))
  t.end()
})

tape('modInt4', function (t) {
  var a = B(0xab, 0x33, 0, 0)
  equal(t, big.modInt(a, 28), new Buffer([11, 0, 0, 0]))
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

tape('shift', function (t) {
  equal(t, big.shift(B(0, 1), 1), B(0, 2))
  equal(t, big.shift(B(0, 1), 2), B(0, 4))
  equal(t, big.shift(B(0, 1), 3), B(0, 8))
  equal(t, big.shift(B(1, 0), 3), B(8, 0))
  equal(t, big.shift(B(0x80, 0), 1), B(0, 1))

  equal(t, big.shift(B(0, 2), -1), B(0, 1))
  equal(t, big.shift(B(0, 4), -2), B(0, 1))
  equal(t, big.shift(B(0, 8), -3), B(0, 1))
  equal(t, big.shift(B(8, 0), -3), B(1, 0))
  equal(t, big.shift(B(0, 1), -1), B(0x80, 0))
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
