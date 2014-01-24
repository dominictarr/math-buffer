var big = require('../../')

function random (length) {
  var l = length
  var b = new Buffer(length)
  while(l--)
    b[l] = ~~(Math.random()*256)
  return b
}

var M = 0x400, L = 0x80
var m = new Buffer(1000)
function bench (title, M, R, each) {
  console.log('#BENCH - '+ title)
  for(var i = 1; i < L; i++) {
    var l = ~~Math.pow(Math.pow(M, 1/L), i)
    var n = 0
//    var a = random(l), b = random(l)
    var start = Date.now(), end
    do {
      n++
      each(l)
    } while((end = Date.now()) - start < 100)
    var time = (end - start)
    console.log(i, l*8, time/n)
  }
}

//bench('Multiply 1 - 1024', 0x400, 0x80, function (l) {
//  big.multiply(random(l), random(l))
//})

//bench('divide 1 - 1024', 0x400, 0x80, function (l) {
//  big.divide(random(0x400), random(0x400 - l))
//})
//
bench('power 2 ^ 1 - 1024', 0x400, 0x80, function (l) {
  big.power(big.fromInt(2), random(l), random(l))
})


