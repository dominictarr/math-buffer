
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
  div: []
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
  b = b.shiftRight(Math.floor(Math.random()*b.bitLength()))
  return [
    {remainder: b64(Bignum.mod(a, b)), quotient: b64(Bignum.div(a, b))},
    b64(a),
    b64(b)
  ]
})

var method = process.argv[2]; //m[method] = methods[method]

console.log(JSON.stringify(methods[method], null, 2))

