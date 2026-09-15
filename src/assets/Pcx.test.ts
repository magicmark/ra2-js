import { expect, it } from 'vitest';
import { decodePcx } from './Pcx';

function fixture(body = [0xc2, 7, 99, 99, 8, 9, 99, 99]): Uint8Array {
  const bytes = new Uint8Array(128 + body.length + 769),
    data = new DataView(bytes.buffer);

  bytes.set([10, 5, 1, 8]);
  data.setUint16(8, 1, true);
  data.setUint16(10, 1, true);
  bytes[65] = 1;
  data.setUint16(66, 4, true);
  bytes.set(body, 128);
  bytes[bytes.length - 769] = 12;
  bytes.set([255, 0, 255], bytes.length - 768);
  bytes.set([240, 110, 12], bytes.length - 768 + 7 * 3);

  return bytes;
}

it('decodes padded PCX rows and preserves embedded 8-bit palette channels', () => {
  const image = decodePcx(fixture());
  expect([image.width, image.height]).toEqual([2, 2]);
  expect([...image.pixels]).toEqual([7, 7, 8, 9]);
  expect(Array.from(image.palette.slice(21, 24))).toEqual([240, 110, 12]);
  expect(Array.from(image.palette.slice(0, 3))).toEqual([255, 0, 255]);
});

it('rejects corrupt PCX row, format, and palette data before drawing', () => {
  expect(() => decodePcx(fixture([0xc5, 7]))).toThrow(/scanline/);
  expect(() => decodePcx(fixture([0xc2]))).toThrow(/Truncated/);
  const palette = fixture();
  palette[palette.length - 769] = 0;
  expect(() => decodePcx(palette)).toThrow(/palette/);
  const format = fixture();
  format[65] = 3;
  expect(() => decodePcx(format)).toThrow(/single-plane/);
});
