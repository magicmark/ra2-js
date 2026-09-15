/** Five-pixel capitals matching the native 60x48 RA2 cameo captions.
 * B/C/E/O/R/S/T follow powricon, brrkicon and reficon glyphs; G/H/U and
 * the apostrophe use the same stroke width and spacing. No browser font rasterizer.
 */
interface CaptionGlyphs {
  [character: string]: readonly string[];
}

const GLYPHS: CaptionGlyphs = {
  B: ['1110', '1001', '1110', '1001', '1110'],
  C: ['0110', '1001', '1000', '1001', '0110'],
  E: ['111', '100', '110', '100', '111'],
  G: ['0110', '1000', '1011', '1001', '0110'],
  H: ['1001', '1001', '1111', '1001', '1001'],
  O: ['0110', '1001', '1001', '1001', '0110'],
  R: ['1110', '1001', '1110', '1001', '1001'],
  S: ['0111', '1000', '0110', '0001', '1110'],
  T: ['111', '010', '010', '010', '010'],
  U: ['1001', '1001', '1001', '1001', '0110'],
  "'": ['1', '1', '0', '0', '0'],
};

// Native captions run from near-white to light gray, with a one-pixel black edge.
const INK = ['#fcfcfc', '#f4f8f4', '#d4d4d4', '#acacac', '#a4a4a4'];

/** Apply only after the illustration has been drawn at its final 60x48 size. */
export function drawCameoCaption(
  context: CanvasRenderingContext2D,
  label: "Butcher's" | 'George',
): void {
  const glyphs = [...label.toUpperCase()].map((character) => GLYPHS[character]);
  const width = glyphs.reduce((sum, glyph) => sum + glyph[0].length + 1, -1);
  let left = Math.floor((60 - width) / 2);
  context.save();
  // An opaque eight-pixel strip completely covers the generated caption.
  context.fillStyle = '#181818';
  context.fillRect(0, 40, 60, 8);

  for (const glyph of glyphs) {
    // Draw the edge first so adjacent lit pixels remain exactly one pixel wide.
    context.fillStyle = '#000000';

    for (let y = 0; y < 5; y++)
      for (let x = 0; x < glyph[y].length; x++) {
        if (glyph[y][x] === '1') context.fillRect(left + x + 1, 42 + y, 1, 1);
      }

    for (let y = 0; y < 5; y++) {
      context.fillStyle = INK[y];

      for (let x = 0; x < glyph[y].length; x++) {
        if (glyph[y][x] === '1') context.fillRect(left + x, 42 + y, 1, 1);
      }
    }

    left += glyph[0].length + 1;
  }

  context.restore();
}
