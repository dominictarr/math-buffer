
//use bignum (which wraps openssl) as a reference implementation.
var Bignum = require('bignum')
var randoms = []
var s = new Bignum(2)
for (var i = 0; i < 1000; i++) {
  var r = Bignum.rand(s.pow(i))
  randoms.push(r)
}

var methods = {
  add: [],
  sub: [],
  mul: [],
  div: [],
  pow: [],
  gcd: []
}

function rand () {
  return randoms[~~(Math.random()*randoms.length)]
}

function b64 (b) {
  return new Buffer(b.toBuffer().toJSON().reverse()).toString('base64')
}

function generateTests(method, n, map) {
  map = map || function (bigger, smaller) {
    var result = Bignum[method](bigger, smaller)
    return [b64(result), b64(bigger), b64(smaller)]
  }
  while(n--) {
    var bigger = rand()
    var smaller = Bignum.rand(bigger)
    var result = map(bigger, smaller)
//    console.error(method+'('+bigger.toString() + ', ' + smaller.toString()+') == ' + result)
    methods[method].push(result)
  }
}

generateTests('add', 100)
generateTests('sub', 100)
generateTests('mul', 100)
generateTests('div', 100, function (a, b) {
  b = b.shiftRight(Math.floor(Math.random()*b.bitLength()*100))
  return [
    {remainder: b64(Bignum.mod(a, b)), quotient: b64(Bignum.div(a, b))},
    b64(a),
    b64(b)
  ]
})

generateTests('pow', 5, function (a, b) {
  var e  = new Bignum(~~(1 + Math.random()*7))
  a = a.shiftRight(~~(0.95*a.bitLength()))
  b = b.shiftRight(~~(0.95*a.bitLength()))
  var v = [
    b64(Bignum.powm(e, a, b)),
    b64(e),
    b64(a),
    b64(b)
  ]
  console.error(v)
  return v
})


generateTests('gcd', 20, function (a, b) {
  a = a.shiftRight(~~(Math.random()*a.bitLength()))
  b = Bignum.rand(a)
  var c = Bignum.rand(b)
  var d = a.mul(b) //if a and c are coprime, b will be gcd of d & e
  var e = b.mul(c)
  return [
    b64(Bignum.gcd(d, e)),
    b64(d),
    b64(e)
  ]

})

var method = process.argv[2]; //m[method] = methods[method]

console.log(JSON.stringify(methods[method], null, 2))

