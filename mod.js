

// calculate A % B
function mod(A, B) {
  var C
  var _B = B
  if (B > A) return A

  //shift B right until it it's just smaller than A.
  while(B < A) {
    B<<=1
  }
  //now, shift B back, while subtracting.
  do {
    B>>=1
    console.log('%', A.toString(2), B.toString(2))
    A = B >= A ? A : A - B
    console.log('=', A.toString(2))
  } while(B > _B) 

  return A
}

console.log(mod(13227, 28), 13227 % 28)

//find the most significant bit in a byte with a ternary based binary search...
function msb (x) {
  return (
    x & 0xF0
    ? x & 0xC0 ? x & 0x80 ? 8 : 7 : x & 0x20 ? 6 : 5
    : x & 0x0C ? x & 0x08 ? 4 : 3 : x & 0x02 ? 2 : x
  )
}
var l = 255
while(l--) {
  console.log(msb(l), l.toString(2), l.toString(2).length)
}

