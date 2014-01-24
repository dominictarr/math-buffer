
var u = require('./util')
var data = require('./fixtures/pow.json')
var big = require('../')

//have made significant improvements power() perf
//by truncating remainder buffer
//(which means that now there arn't a bunch of zeros to iterate over)

u.createTestMethod('power', data, big.power)

