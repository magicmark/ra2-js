/** Original RA2 `game.fnt`: Unicode index table and MSB-first bitmap glyphs. */
export class NativeFont {
  readonly lineHeight: number;
  readonly rows: number;
  private readonly stride: number;
  private readonly glyphSize: number;
  private readonly view: DataView;
  private readonly bytes: Uint8Array;
  private static readonly glyphStart = 0x2001c;

  constructor(bytes: Uint8Array) {
    if (bytes.length < NativeFont.glyphStart) throw new Error('Truncated Unicode font index');
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (this.view.getUint32(0, false) !== 0x666f6e54) throw new Error('Invalid Unicode font signature');
    this.stride = this.view.getUint32(8, true);
    this.rows = this.view.getUint32(12, true);
    this.lineHeight = this.view.getUint32(16, true);
    const count = this.view.getUint32(20, true);
    this.glyphSize = this.view.getUint32(24, true);
    if (!this.stride || this.stride > 32 || !this.rows || this.rows > 256 || this.lineHeight < this.rows || this.lineHeight > 512 || !count || count > 65535 || this.glyphSize !== 1 + this.stride * this.rows) throw new Error('Invalid Unicode font geometry');
    if (NativeFont.glyphStart + count * this.glyphSize > bytes.length) throw new Error('Truncated Unicode font glyphs');
    for (let code = 0; code < 65536; code++) if (this.view.getUint16(28 + code * 2, true) > count) throw new Error('Unicode font index exceeds glyph count');
    for (let index = 0; index < count; index++) if (bytes[NativeFont.glyphStart + index * this.glyphSize] > this.stride * 8) throw new Error('Unicode font glyph exceeds row width');
  }

  rasterize(text: string, color: readonly number[] = [255, 255, 0], shadow = true) {
    const glyphs = [...text].map(character => {
      const code = character.codePointAt(0)!;
      const index = code <= 0xffff ? this.view.getUint16(28 + code * 2, true) : 0;
      if (!index) throw new Error(`Original game font is missing character ${JSON.stringify(character)}`);
      const offset = NativeFont.glyphStart + (index - 1) * this.glyphSize;
      return { offset, width: this.bytes[offset] };
    });
    const width = Math.max(1, glyphs.reduce((sum, glyph) => sum + glyph.width + 1, 0) - 1 + Number(shadow));
    const height = this.rows + Number(shadow), pixels = new Uint8ClampedArray(width * height * 4);
    let left = 0;
    for (const glyph of glyphs) {
      for (let y = 0; y < this.rows; y++) for (let x = 0; x < glyph.width; x++) {
        if (!(this.bytes[glyph.offset + 1 + y * this.stride + (x >> 3)] & (0x80 >> (x & 7)))) continue;
        if (shadow) pixels[((y + 1) * width + left + x + 1) * 4 + 3] = 255;
        const target = (y * width + left + x) * 4;
        pixels[target] = color[0]; pixels[target + 1] = color[1]; pixels[target + 2] = color[2]; pixels[target + 3] = 255;
      }
      left += glyph.width + 1;
    }
    return { width, height, pixels };
  }

  draw(canvas: HTMLCanvasElement, text: string, color?: readonly number[]) {
    const raster = this.rasterize(text, color);
    canvas.width = raster.width; canvas.height = raster.height;
    const context = canvas.getContext('2d')!;
    const image = context.createImageData(raster.width, raster.height);
    image.data.set(raster.pixels); context.putImageData(image, 0, 0);
  }
}
