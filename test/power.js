
var u = require('./util')
var data = require('./fixtures/pow.json')
var big = require('../')

//skip this test on browserify,
//because it just takes too long, and makes the test fail.
if(process.title === 'browser')
  return

u.createTestMethod('power', data, big.power)
//, function (t, actual, expected, name, i) {
//  u.equal(t, actual.remainder, expected.remainder, 'divide - remainder - ' + i)
//  u.equal(t, actual.quotient, expected.quotient, 'divide - quotient - ' + i)
//})
