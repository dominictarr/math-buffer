var big = require('../')
var input = require('./inputs.json')
var tape = require('tape')

function clone (a) {
  return JSON.parse(JSON.stringify(a))
}
function equal(t, a, b, message) {
  var actual = clone(a)
  //trim 0's off end
  while(actual[actual.length - 1] === 0) actual.pop()
  t.deepEqual(actual, clone(b), message)
}

function wrap(a) {
  var a = a.toJSON(a)
  var s = '    ', lines = []
  a.forEach(function (n, i) {
    if(/\d/.test(s)) s += ', '
    s += n
    if(s.length > 70)
      lines.push(s), s = '    '
  })
  return '[\n' + lines.join(',\n') + '\n  ]'
  
}

Object.keys(input).forEach(function (method) {
  tape(method, function (t) {
    input[method].forEach(function (args, i) {
      args = args.map(function (b64) {
        return new Buffer(b64, 'base64')
      })
      var expected = args.shift()
      if(big[method]) {
        var actual = big[method].apply(null, args)
      console.log(
'equal(t,\n  big.'+method+'('+
  args.map(wrap).join(', ')+'), '+
  wrap(expected)+'\n)')
//        console.error(method, actual, expected)
        equal(t, actual, expected, method + '-' + i)
      }
    })
    t.end()
  })
})
