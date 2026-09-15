/** The original Options controls use ZSoft 8-bit, single-plane PCX images. */
export interface PcxImage {
  width: number;
  height: number;
  pixels: Uint8Array;
  palette: Uint8Array;
}

export function decodePcx(bytes: Uint8Array): PcxImage {
  if (bytes.length < 128 + 769) throw new Error('Truncated PCX header or palette');
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (bytes[0] !== 10 || bytes[1] !== 5 || bytes[2] !== 1 || bytes[3] !== 8 || bytes[65] !== 1) {
    throw new Error('Expected 8-bit single-plane RLE PCX');
  }

  const width = data.getUint16(8, true) - data.getUint16(4, true) + 1;
  const height = data.getUint16(10, true) - data.getUint16(6, true) + 1;

  const stride = data.getUint16(66, true),
    paletteStart = bytes.length - 769;

  if (width <= 0 || height <= 0 || width > 4096 || height > 4096 || stride < width || stride > 8192)
    throw new Error('Invalid PCX dimensions');

  if (bytes[paletteStart] !== 12) throw new Error('Missing PCX 256-color palette');
  const pixels = new Uint8Array(width * height);
  let offset = 128;

  for (let y = 0; y < height; y++) {
    let x = 0;

    while (x < stride) {
      if (offset >= paletteStart) throw new Error('Truncated PCX row');

      const code = bytes[offset++],
        count = (code & 0xc0) === 0xc0 ? code & 0x3f : 1;

      if (!count || x + count > stride) throw new Error('PCX run exceeds scanline');

      if ((code & 0xc0) === 0xc0 && offset >= paletteStart) throw new Error('Truncated PCX run');
      const value = (code & 0xc0) === 0xc0 ? bytes[offset++] : code;
      pixels.fill(value, y * width + Math.min(x, width), y * width + Math.min(x + count, width));
      x += count;
    }
  }

  // PCX palette channels are already 8-bit, unlike Westwood .pal files.
  return { width, height, pixels, palette: bytes.slice(paletteStart + 1) };
}
