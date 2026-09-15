import { EFFECT_SOUNDS, EVA_SOUNDS } from './AudioBank';
import { audioBagWave } from './AudioSample';

/** Minimal pixel surface for exercising original decoders without a browser. */
export class TestCanvas {
  width = 1;
  height = 1;
  pixels: Uint8ClampedArray = new Uint8ClampedArray();
  private ensure(): void {
    if (this.pixels.length !== this.width * this.height * 4)
      this.pixels = new Uint8ClampedArray(this.width * this.height * 4);
  }
  getContext() {
    return {
      createImageData: (width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
      }),
      putImageData: (image: { data: Uint8ClampedArray }) => {
        this.pixels = image.data;
      },
      getImageData: () => {
        this.ensure();

        return { data: this.pixels };
      },
      drawImage: (source: TestCanvas, dx: number, dy: number) => {
        this.ensure();
        source.ensure();

        for (let y = 0; y < source.height; y++)
          for (let x = 0; x < source.width; x++) {
            const xx = Math.round(x + dx),
              yy = Math.round(y + dy);

            if (xx < 0 || yy < 0 || xx >= this.width || yy >= this.height) continue;

            const from = (y * source.width + x) * 4,
              to = (yy * this.width + xx) * 4;

            if (source.pixels[from + 3])
              this.pixels.set(source.pixels.subarray(from, from + 4), to);
          }
      },
    };
  }
}

export function testFont(): Uint8Array {
  const bytes = new Uint8Array(0x2001c + 3),
    data = new DataView(bytes.buffer);

  bytes.set([0x66, 0x6f, 0x6e, 0x54]);
  [3, 1, 2, 3, 1, 3].forEach((value, index) => data.setUint32(4 + index * 4, value, true));

  for (let code = 32; code < 127; code++) data.setUint16(28 + code * 2, 1, true);
  bytes.set([3, 0xa0, 0x40], 0x2001c);

  return bytes;
}

export function testShp(frameCount = 1): Uint8Array {
  const bytes = new Uint8Array(8 + frameCount * 25),
    data = new DataView(bytes.buffer);

  data.setUint16(2, 1, true);
  data.setUint16(4, 1, true);
  data.setUint16(6, frameCount, true);

  for (let frame = 0; frame < frameCount; frame++) {
    const header = 8 + frame * 24,
      offset = 8 + frameCount * 24 + frame;

    data.setUint16(header + 4, 1, true);
    data.setUint16(header + 6, 1, true);
    data.setUint32(header + 20, offset, true);
    bytes[offset] = 10;
  }

  return bytes;
}

export function testPcx(): Uint8Array {
  const bytes = new Uint8Array(128 + 2 + 769),
    data = new DataView(bytes.buffer);

  bytes.set([10, 5, 1, 8]);
  bytes[65] = 1;
  data.setUint16(66, 2, true);
  bytes[128] = 10;
  bytes[129] = 0;
  bytes[130] = 12;
  bytes.set([255, 0, 255], 131);
  bytes.set([252, 124, 28], 131 + 30);

  return bytes;
}

export function testCursorShp(frameCount = 450): Uint8Array {
  const bytes = testShp(frameCount),
    data = new DataView(bytes.buffer);

  data.setUint16(2, 55, true);
  data.setUint16(4, 43, true);

  for (let frame = 0; frame < frameCount; frame++) {
    data.setUint16(8 + frame * 24, 11, true);
    data.setUint16(10 + frame * 24, 9, true);
  }

  return bytes;
}

/** Small original-format fixture shared by strict cache/loader tests. */
export function testAudioFiles() {
  const bytes = new Uint8Array([0, 0, 0, 64, 0, 192, 0, 0]);

  const wave = audioBagWave(
    { name: 'fixture', offset: 0, size: bytes.length, sampleRate: 22050, flags: 6, chunkSize: 0 },
    bytes,
  );

  return [
    {
      name: 'sound.ini',
      bytes: new TextEncoder().encode(
        EFFECT_SOUNDS.map((name) => `[${name}]\nSounds=fixture\nVolume=60`).join('\n'),
      ),
    },
    {
      name: 'eva.ini',
      bytes: new TextEncoder().encode(
        EVA_SOUNDS.map((name) => `[${name}]\nAllied=fixture`).join('\n'),
      ),
    },
    { name: 'audio/fixture.wav', bytes: wave },
    {
      name: 'theme.ini',
      bytes: new TextEncoder().encode('[Themes]\n1=Fixture\n[Fixture]\nSound=fixture\nNormal=yes'),
    },
    { name: 'music/fixture.wav', bytes: wave.slice() },
  ];
}

/** Verify a rendered sprite came from the installed pixel-surface fixture. */
export function testCanvas(source: HTMLCanvasElement): TestCanvas {
  if (!(source instanceof TestCanvas)) throw new Error('Expected a fixture canvas');

  return source;
}
