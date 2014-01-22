
var u = require('./util')
var data = require('./fixtures/gcd.json')
var big = require('../')

u.createTestMethod('gcd', data, big.gcd, function (t, actual, expected, name, i) {
  u.equal(t, actual, expected, 'gcd - remainder - ' + i)
})

