
var u = require('./util')
var data = require('./fixtures/pow.json')
var big = require('../')

u.createTestMethod('power', data, big.power)
//, function (t, actual, expected, name, i) {
//  u.equal(t, actual.remainder, expected.remainder, 'divide - remainder - ' + i)
//  u.equal(t, actual.quotient, expected.quotient, 'divide - quotient - ' + i)
//})
