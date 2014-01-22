# math-buffer

use node buffers as big integers.

## byte order & base

Buffers and interpreted as base 256 numbers,
where each place is 256 times larger than the previous one,
instead of 10 times larger. `value = Math.pow(256, i)`.

Also note that this means bytes in a buffer are interpreted in little endian order.
This means that a number such as `0x12345678` is represented in a buffer
as `new Buffer([0x78, 0x56, 0x34, 0x12])`.
This greatly simplifies the implementation because the least significant byte (digit)
also has the lowest index.

## api

in general, all methods follow this pattern:

`result = op(a, b, m?)`
where `m` is an optional buffer that the result will be stored into.
If `m` is not provided, then it will be allocated.

### bool = isZero(x)

return true if this buffer represents zero.

### fromInt: `result = fromInt(int_n, length?)`

convert `int_n` into a buffer, that is at least 4 bytes,
but if you supply a longer `length` value,
then it will be zero filled to that length.

### add: `result = add(a, b, m?)`

add `a` to `b` and store the result in `m`
(if m is not provided a new buffer will be allocated, and returned)
in some cases, `a` may === `m`, in other cases, it must be a different buffer.

`m` *may* be `a, b`

### subtract: `result = subtract(a, b, m?)`

subtract `b` from `a` and store the result in `m`
(if m is not provided a new buffer will be allocated, and returned)

only positive integers are supported (currently) so `a` must be larger than `b`.

`m` *may* be `a, b`

### multiply: `result = multiply (a, b, m?)`

multiply `a` by `b`.

`m` *must not* be `a, b`

### modInt: `int_result = modInt(a, int_n)`

get the modulus of dividing a big number with a 32 bit int.

### compare: `order = compare(a, b)`

Compare whether `a` is smaller than (-1), equal (0), or greater than `b` (1)
this the same signature as is expected by `Array.sort(comparator)`

### shift: `result = shift(a, bits, m?)`

move a big number across by `bits`. `bits` can be both positive or negative.
a positive number of bits is the same as `Math.pow(a, bits)`
This is an essential part of `divide`

`m` *may* be `a`

### mostSignificantBit: `bits = mostSignificantBit (a)`

Find the position of the largest valued bit in the number.
(since the buffer may have trailing zeros, it's not necessaryily in the last byte)


### divide: `{quotient, remainder} = divide (a, b, q?, r?)`

Divide `a` by `b`, updating the `q` (quotient) and `r` (remainder) buffers.

`a`,`b`,`q`, and `r` *must* all be different buffers.

### square: `result = square (a, m?)`

multiply `a` by itself.

`m` *must not* be `a`.

### power: `result = power (e, x, mod?)`

Raise `e` to the power of `x`,
If `mod` is provided, the result will be `e^x % mod`.

### gcd: `result = gcd(u, v, mutate=false)`

Calculate the greatest common divisor using the
[binary gcd algorithm](http://en.wikipedia.org/wiki/Binary_GCD_algorithm)

If `mutate` is true, the inputs will be mutated,
by default, new buffers will be allocated.

### gcd: `x = inverse(a, m)`

Calculate the [modular multiplicative inverse](http://en.wikipedia.org/wiki/Modular_multiplicative_inverse)
This is the inverse of `a*x % m = 1`.

My implementation is based on
[sjcl's implementation](https://github.com/bitwiseshiftleft/sjcl/blob/master/core/bn.js#L182-L226)
Unfortunately I was unable to find any reference explaining this particular algorithm,
(the benefit this algorithm is that it doesn't require negative numbers, which I havn't implemented)

## TODO

* isProbablyPrime (needed for RSA)

## License

MIT
