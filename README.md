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

### result = add(a, b, m?)

add `a` to `b` and store the result in `m`
(if m is not provided a new buffer will be allocated, and returned)
in some cases, `a` may === `m`, in other cases, it must be a different buffer.

`m` *may* be `a, b`

### result = sub(a, b, m?)

subtract `b` from `a` and store the result in `m`
(if m is not provided a new buffer will be allocated, and returned)

only positive integers are supported (currently) so `a` must be larger than `b`.

`m` *may* be `a, b`

### result = multiply (a, b, m?)

multiply `a` by `b`.

`m` *must not* be `a, b`

### int_result = modInt(a, int_n)

get the modulus of dividing a big number with a 32 bit int.

### order = compare(a, b)

Compare whether `a` is smaller than (-1), equal (0), or greater than `b` (1)
this the same signature as is expected by `Array.sort(comparator)`

### result = shift(a, bits, m?)

move a big number across by `bits`. `bits` can be both positive or negative.
a positive number of bits is the same as `Math.pow(a, bits)`
This is an essential part of `divide`

`m` *may* be `a`

### bits = mostSignificantBit (a)

Find the position of the largest valued bit in the number.
(since the buffer may have trailing zeros, it's not necessaryily in the last byte)


### {quotient, remainder} = divide (a, b, q?, r?)

Divide `a` by `b`, updating the `q` (quotient) and `r` (remainder) buffers.

`a`,`b`,`q`, and `r` *must* all be different buffers.

### result = square (a, m?)

multiply `a` by itself.

`m` *must not* be `a`.

## License

MIT
