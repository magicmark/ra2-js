/** Westwood map packs: little-endian chunk lengths, LZO1X terrain, LCW overlays.
 * LZO instruction reference: https://docs.kernel.org/staging/lzo.html
 * These are bounded readers of the native streams, not a private map encoding.
 */
function requireData(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}

export function decodeLzo1x(input: Uint8Array, expectedSize: number): Uint8Array {
  requireData(
    Number.isInteger(expectedSize) && expectedSize >= 0 && expectedSize <= 65535,
    'Invalid LZO output size',
  );
  const out = new Uint8Array(expectedSize);

  let p = 0,
    q = 0,
    state = 0;

  const byte = () => {
    requireData(p < input.length, 'Truncated LZO stream');

    return input[p++];
  };

  const word = () => byte() | (byte() << 8);

  const literals = (length: number) => {
    requireData(p + length <= input.length && q + length <= out.length, 'LZO literal overflow');
    out.set(input.subarray(p, p + length), q);
    p += length;
    q += length;
  };

  const length = (value: number, mask: number) => {
    if (value) return value;

    let total = mask,
      extra = byte();

    while (extra === 0) {
      total += 255;
      requireData(total <= expectedSize, 'LZO length overflow');
      extra = byte();
    }

    return total + extra;
  };

  if (input[0] > 17) {
    const count = byte() - 17;
    literals(count);
    state = Math.min(count, 4);
  }

  while (true) {
    const op = byte();
    let count: number, distance: number, trailing: number;

    if (op < 16 && state === 0) {
      literals(length(op, 15) + 3);
      state = 4;
      continue;
    }

    if (op < 16) {
      count = state === 4 ? 3 : 2;
      distance = (byte() << 2) + (op >> 2) + (state === 4 ? 2049 : 1);
      trailing = op & 3;
    } else if (op < 32) {
      count = length(op & 7, 7) + 2;
      const operand = word();
      distance = 16384 + ((op & 8) << 11) + (operand >> 2);
      trailing = operand & 3;

      if (distance === 16384) {
        requireData(
          count === 3 && trailing === 0 && p === input.length && q === out.length,
          'Invalid LZO terminator or output length',
        );

        return out;
      }
    } else if (op < 64) {
      count = length(op & 31, 31) + 2;
      const operand = word();
      distance = (operand >> 2) + 1;
      trailing = operand & 3;
    } else {
      count = (op >> 5) + 1;
      distance = (byte() << 3) + ((op >> 2) & 7) + 1;
      trailing = op & 3;
    }

    requireData(
      distance > 0 && distance <= q && q + count <= out.length,
      'Invalid LZO back-reference',
    );

    for (let i = 0; i < count; i++) {
      out[q] = out[q - distance];
      q++;
    }

    literals(trailing);
    state = trailing;
  }
}

export function decodeLcw(input: Uint8Array, expectedSize: number): Uint8Array {
  requireData(
    Number.isInteger(expectedSize) && expectedSize >= 0 && expectedSize <= 65535,
    'Invalid LCW output size',
  );
  const out = new Uint8Array(expectedSize);

  let p = 0,
    q = 0;

  const byte = () => {
    requireData(p < input.length, 'Truncated LCW stream');

    return input[p++];
  };

  const word = () => byte() | (byte() << 8);
  // Format80's optional zero prefix makes long references relative.
  const relative = input[0] === 0;

  if (relative) p++;

  const copy = (from: number, count: number) => {
    requireData(
      count > 0 && from >= 0 && from < q && q + count <= out.length,
      'Invalid LCW back-reference',
    );

    for (let i = 0; i < count; i++) out[q++] = out[from++];
  };

  while (true) {
    const op = byte();

    if (op === 128) {
      requireData(p === input.length && q === out.length, 'Invalid LCW output length');

      return out;
    }

    if (op < 128) {
      const distance = ((op & 15) << 8) | byte();
      copy(q - distance, (op >> 4) + 3);
    } else if (op < 192) {
      const count = op & 63;
      requireData(p + count <= input.length && q + count <= out.length, 'LCW literal overflow');
      out.set(input.subarray(p, p + count), q);
      p += count;
      q += count;
    } else if (op === 254) {
      const count = word(),
        value = byte();

      requireData(count > 0 && q + count <= out.length, 'LCW fill overflow');
      out.fill(value, q, q + count);
      q += count;
    } else {
      const count = op === 255 ? word() : (op & 63) + 3,
        source = word();

      copy(relative ? q - source : source, count);
    }
  }
}

export function unpackSection(
  base64: string,
  codec: 'lzo' | 'lcw',
  maxOutput = 4 * 1024 * 1024,
): Uint8Array {
  requireData(
    base64.length <= maxOutput * 2 &&
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64),
    'Invalid map pack base64',
  );
  const data = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const chunks: Uint8Array[] = [];

  let p = 0,
    total = 0;

  while (p < data.length) {
    requireData(p + 4 <= data.length, 'Truncated map pack chunk header');

    const compressed = data[p] | (data[p + 1] << 8),
      decompressed = data[p + 2] | (data[p + 3] << 8);

    p += 4;
    requireData(
      compressed > 0 && decompressed > 0 && decompressed <= 8192 && p + compressed <= data.length,
      'Invalid map pack chunk size',
    );
    total += decompressed;
    requireData(total <= maxOutput, 'Map pack exceeds output limit');
    chunks.push(
      (codec === 'lzo' ? decodeLzo1x : decodeLcw)(data.subarray(p, p + compressed), decompressed),
    );
    p += compressed;
  }

  const output = new Uint8Array(total);
  p = 0;

  for (const chunk of chunks) {
    output.set(chunk, p);
    p += chunk.length;
  }

  return output;
}
