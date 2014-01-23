var bignum = require('bignum')

function b(s) {
  return bignum.fromBuffer(new Buffer(new Buffer(s.replace(/ /g, ''), 'hex').toJSON().reverse()))
}
var u = b("7f 20 de 12 54 51 01")
var v = b("e4 4f 7a fc 1f a0 02")
u = b('7f 20 de 12 54 51 01')
v = b('3d 7a b6 0e 00 51')

u = b('76 76 e5 68 50 e7 05'); v = b('3d 7a b6 0e 00 51')
u = b('ec ec ca d1 a0 ce 0b'); v = b('7a f4 6c 1d 00 a2')
console.error(
  u, v,
  bignum.gcd(u.div(2), v.div(2)).mul(2)

  .toBuffer().toJSON().reverse()
)
