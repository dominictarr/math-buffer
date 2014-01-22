
var u = require('./util')
var data = require('./fixtures/div.json')
var big = require('../')

u.createTestMethod('divide', data, big.divide, function (t, actual, expected, name, i) {
  u.equal(t, actual.remainder, expected.remainder, 'divide - remainder - ' + i)
  u.equal(t, actual.quotient, expected.quotient, 'divide - quotient - ' + i)
})
