var big = require('../')
var tape = require('tape')
var u = require('./util')

var add = require('./fixtures/add.json')
var sub = require('./fixtures/sub.json')
var mul = require('./fixtures/mul.json')

u.createTestMethod('add', add, big.add)
u.createTestMethod('sub', sub, big.sub)
u.createTestMethod('mul', mul, big.multiply)

