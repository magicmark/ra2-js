/** Minimal pixel surface for exercising original decoders without a browser. */
export class TestCanvas {
  width = 1;
  height = 1;
  pixels: Uint8ClampedArray = new Uint8ClampedArray();
  private ensure(): void { if (this.pixels.length !== this.width * this.height * 4) this.pixels = new Uint8ClampedArray(this.width * this.height * 4); }
  getContext() {
    return {
      createImageData: (width: number, height: number) => ({ data: new Uint8ClampedArray(width * height * 4) }),
      putImageData: (image: { data: Uint8ClampedArray }) => { this.pixels = image.data; },
      getImageData: () => { this.ensure(); return { data: this.pixels }; },
      drawImage: (source: TestCanvas, dx: number, dy: number) => {
        this.ensure(); source.ensure();
        for (let y = 0; y < source.height; y++) for (let x = 0; x < source.width; x++) {
          const xx = Math.round(x + dx), yy = Math.round(y + dy);
          if (xx < 0 || yy < 0 || xx >= this.width || yy >= this.height) continue;
          const from = (y * source.width + x) * 4, to = (yy * this.width + xx) * 4;
          if (source.pixels[from + 3]) this.pixels.set(source.pixels.subarray(from, from + 4), to);
        }
      },
    };
  }
}

export function testFont(): Uint8Array {
  const bytes = new Uint8Array(0x2001c + 3), data = new DataView(bytes.buffer);
  bytes.set([0x66, 0x6f, 0x6e, 0x54]);
  [3, 1, 2, 3, 1, 3].forEach((value, index) => data.setUint32(4 + index * 4, value, true));
  for (let code = 32; code < 127; code++) data.setUint16(28 + code * 2, 1, true);
  bytes.set([3, 0xa0, 0x40], 0x2001c);
  return bytes;
}

export function testShape(frameCount = 1): Uint8Array {
  const bytes = new Uint8Array(8 + frameCount * 25), data = new DataView(bytes.buffer);
  data.setUint16(2, 1, true); data.setUint16(4, 1, true); data.setUint16(6, frameCount, true);
  for (let frame = 0; frame < frameCount; frame++) {
    const header = 8 + frame * 24, offset = 8 + frameCount * 24 + frame;
    data.setUint16(header + 4, 1, true); data.setUint16(header + 6, 1, true);
    data.setUint32(header + 20, offset, true); bytes[offset] = 10;
  }
  return bytes;
}

export function testCursorShape(frameCount = 450): Uint8Array {
  const bytes = testShape(frameCount), data = new DataView(bytes.buffer);
  data.setUint16(2, 55, true); data.setUint16(4, 43, true);
  for (let frame = 0; frame < frameCount; frame++) {
    data.setUint16(8 + frame * 24, 11, true);
    data.setUint16(10 + frame * 24, 9, true);
  }
  return bytes;
}
