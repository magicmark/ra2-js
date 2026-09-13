import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NativeFont } from './NativeFont';
import { testFont } from './asset-test-fixtures';

describe('original Unicode bitmap font', () => {
  it('decodes one-based character indices, MSB pixels, native spacing and transparent pixels', () => {
    const font = new NativeFont(testFont()), image = font.rasterize('AA', [17, 34, 51], false);
    expect([font.rows, font.lineHeight, image.width, image.height]).toEqual([2, 3, 7, 2]);
    const rows = Array.from({ length: 2 }, (_, y) => Array.from({ length: 7 }, (_, x) => image.pixels[(y * 7 + x) * 4 + 3] ? '#' : '.').join(''));
    expect(rows).toEqual(['#.#.#.#', '.#...#.']);
    expect([...image.pixels.slice(0, 4)]).toEqual([17, 34, 51, 255]);
  });
  it('draws a one-pixel black shadow without replacing foreground glyph pixels', () => {
    const image = new NativeFont(testFont()).rasterize('A');
    expect([image.width, image.height]).toEqual([4, 3]);
    const at = (x: number, y: number) => [...image.pixels.slice((y * 4 + x) * 4, (y * 4 + x + 1) * 4)];
    expect(at(1, 1)).toEqual([255, 255, 0, 255]);
    expect(at(2, 2)).toEqual([0, 0, 0, 255]);
  });
  it('rejects missing characters and invalid or truncated original font files', () => {
    expect(() => new NativeFont(testFont()).rasterize('☃')).toThrow('missing character');
    expect(() => new NativeFont(new Uint8Array(20))).toThrow('Truncated');
    for (const [offset, value, expected] of [[0, 0, 'signature'], [24, 99, 'geometry'], [28 + 65 * 2, 2, 'index'], [0x2001c, 9, 'width']] as const) {
      const bytes = testFont(); bytes[offset] = value;
      expect(() => new NativeFont(bytes)).toThrow(expected);
    }
    expect(() => new NativeFont(testFont().subarray(0, 0x2001d))).toThrow('Truncated');
  });
  it.skipIf(!existsSync('/tmp/ra2-references/game.fnt'))('renders the actual original zero from its authored bitmap', () => {
    const font = new NativeFont(readFileSync('/tmp/ra2-references/game.fnt'));
    const image = font.rasterize('0', undefined, false);
    expect([font.rows, font.lineHeight, image.width]).toEqual([16, 17, 5]);
    const rows = Array.from({ length: 16 }, (_, y) => Array.from({ length: 5 }, (_, x) => image.pixels[(y * 5 + x) * 4 + 3] ? '#' : '.').join(''));
    expect(rows).toEqual(['.....', '.....', '.....', '.....', '.###.', '##.##', '##.##', '##.##', '##.##', '##.##', '##.##', '##.##', '.###.', '.....', '.....', '.....']);
  });
});
