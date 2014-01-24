
var u = require('./util')
var data = require('./fixtures/pow.json')
var big = require('../')

//skip this test on browserify,
//because it just takes too long, and makes the test fail.
if(process.title !== 'browser')
  u.createTestMethod('power', data, big.power)

