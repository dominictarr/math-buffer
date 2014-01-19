
var big = require('../')

var tape = require('tape')

function equal(t, a, b) {
  t.deepEqual(a.toJSON(), b.toJSON())
}

tape('ADD - add two buffers', function (t) {
  var a = new Buffer([0x01, 0x02, 0x03])
  var b = new Buffer([0x04, 0x04, 0x06])
  var c = new Buffer([0x05, 0x06, 0x09])
  equal(t, c, big.add(a, b))
  equal(t, a, big.subtract(c, b))
  equal(t, b, big.subtract(c, a))
  t.end()
})

tape('ADD - add with with carry', function (t) {
  var a = new Buffer([0xf0, 0x00, 0x00])
  var b = new Buffer([0x13, 0x07, 0x00])
  var c = new Buffer([0x03, 0x08, 0x00])
  equal(t, c, big.add(a, b))
  equal(t, a, big.subtract(c, b))
//  equal(t, b, big.subtract(c, a))
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


tape('ADD - pass in mutant buffer', function (t) {
  var a = new Buffer([0x01, 0x02, 0x03])
  var b = new Buffer([0x04, 0x04, 0x06])
  var c = big.add(a, b)
  equal(t, c, new Buffer([0x05, 0x06, 0x09]))
  t.end()
})

tape('SUB - subtract one buffer from another', function (t) {
  var a = new Buffer([0x01, 0x02, 0x03])
  var b = new Buffer([0x04, 0x04, 0x06])
  var c = new Buffer([0x05, 0x06, 0x09])
  equal(t, b, big.sub(c, a))
  t.end()
})
