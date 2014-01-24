exports.clone = clone
exports.equal = equal
exports.wrap = wrap
exports.createTestMethod = createTestMethod

var DEBUG = process.env && process.env.DEBUG

function clone (a) {
  var b = JSON.parse(JSON.stringify(a))
  //handle node@11 style Buffer.toJSON
  if(b.type == 'Buffer') return b.data
  return b
}

function trim (a) {
  a = [].slice.call(a)
//  a = clone(a)
  if(!Array.isArray(a)) return a
  //trim 0's off end
  while(a[a.length - 1] === 0) a.pop()
  return a
}
function hydrate (obj) {
  for(var k in obj) {
    if('string' === typeof obj[k])
      obj[k] = new Buffer(obj[k], 'base64')
    if('object' === typeof obj[k])
      obj[k] = hydrate(obj[k], true)
  }
  return obj
}

function equal(t, a, b, message) {
  t.deepEqual(trim(a), trim(b), message)
}

function wrap(a) {
  if(!a.toJSON)
    return JSON.stringify(a)
  var a = a.toJSON(a)
  var s = '    ', lines = []
  a.forEach(function (n, i) {
    if(/\d/.test(s)) s += ', '
    s += n
    if(s.length > 70)
      lines.push(s), s = '    '
  })
  if(/\d/.test(s)) lines.push(s)
  return '[\n' + lines.join(',\n') + '\n  ]'
}

function createTestMethod(name, inputs, method, applyTest) {

  applyTest = applyTest || function (t, actual, expected, name, i) {
    equal(t, actual, expected, name + '-' + i)
  }

  var tape = require('tape')
  tape(name, function (t) {
    inputs.forEach(function (args, i) {
      args = hydrate(args)

      var expected = args.shift()
      var actual = method.apply(null, args)

      applyTest(t, actual, expected, name, i)
      //output the test that is executing,
      //so that it's easy to c/p to more focused test.
     
      if(DEBUG) {
        console.log(
          'equal(t,\n  big.'+name+'('+
          args.map(wrap).join(', ')+'), '+
          wrap(expected)+'\n)'
        )
      }

    })
    t.end()
  })
}

