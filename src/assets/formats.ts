import { Blowfish } from 'egoroof-blowfish';

// Westwood's MIX/SHP/VXL/HVA/TMP formats. References are recorded in README.md.
const view = (bytes: Uint8Array) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

function check(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}

const crcTable = Uint32Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;

  return n >>> 0;
});

export function mixHash(name: string, classic = false): number {
  const text = new TextEncoder().encode(name.toUpperCase());
  const padded = new Uint8Array((text.length + 3) & ~3);
  padded.set(text);

  if (classic) {
    const data = view(padded);
    let hash = 0;

    for (let i = 0; i < padded.length; i += 4)
      hash = (((hash << 1) | (hash >>> 31)) + data.getUint32(i, true)) >>> 0;

    return hash;
  }

  if (text.length % 4) {
    padded[text.length] = text.length % 4;
    padded.fill(text[text.length & ~3], text.length + 1);
  }

  let crc = 0xffffffff;

  for (const b of padded) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8);

  return (crc ^ 0xffffffff) >>> 0;
}

function powerMod(base: bigint, exponent: bigint, modulus: bigint): bigint {
  let result = 1n;

  while (exponent) {
    if (exponent & 1n) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent >>= 1n;
  }

  return result;
}

export function unwrapMixKey(source: Uint8Array): Uint8Array {
  check(source.length === 80, 'Truncated MIX encryption key');
  // Public RSA modulus stored as an ASN.1 INTEGER by Westwood. This unwraps
  // the archive index key; it is not an application secret or authentication.
  const encoded = atob('AihRvNoIbTn85FZRYNZRcT+i6KpU+maCsEqr3Q5q+LDB5tH7Tz2qQ38V');
  let modulus = 0n;

  for (let i = 2; i < encoded.length; i++)
    modulus = (modulus << 8n) | BigInt(encoded.charCodeAt(i));
  const result = new Uint8Array(78);

  for (let block = 0; block < 2; block++) {
    let value = 0n;

    for (let i = 39; i >= 0; i--) value = (value << 8n) | BigInt(source[block * 40 + i]);
    value = powerMod(value, 65537n, modulus);

    for (let i = 0; i < 39; i++) {
      result[block * 39 + i] = Number(value & 255n);
      value >>= 8n;
    }
  }

  return result.slice(0, 56);
}

export class MixArchive {
  readonly entries = new Map<number, { offset: number; size: number }>();
  readonly encrypted: boolean;
  constructor(
    readonly bytes: Uint8Array,
    readonly name = 'archive.mix',
  ) {
    check(bytes.length >= 6, `${name}: truncated MIX header`);

    let data = view(bytes),
      start = data.getUint16(0, true) ? 0 : 4;

    this.encrypted = start === 4 && !!(data.getUint16(2, true) & 2);
    let body: number;

    if (this.encrypted) {
      check(bytes.length >= 92, `${name}: truncated encrypted MIX header`);

      const cipher = new Blowfish(
        unwrapMixKey(bytes.subarray(4, 84)),
        Blowfish.MODE.ECB,
        Blowfish.PADDING.NULL,
      );

      const decrypt = (size: number) => {
        const out = new Uint8Array(size);
        out.set(cipher.decode(bytes.subarray(84, 84 + size), Blowfish.TYPE.UINT8_ARRAY));

        return out;
      };

      const count = view(decrypt(8)).getUint16(0, true);
      const size = (6 + count * 12 + 7) & ~7;
      check(84 + size <= bytes.length, `${name}: encrypted index out of bounds`);
      data = view(decrypt(size));
      start = 0;
      body = 84 + size;
    } else {
      body = start + 6 + data.getUint16(start, true) * 12;
    }

    const count = data.getUint16(start, true);
    check(
      count > 0 && start + 6 + count * 12 <= data.byteLength && body <= bytes.length,
      `${name}: invalid MIX index`,
    );
    const bodySize = data.getUint32(start + 2, true);
    check(body + bodySize <= bytes.length, `${name}: truncated MIX body`);

    for (let i = 0; i < count; i++) {
      const p = start + 6 + i * 12,
        offset = data.getUint32(p + 4, true),
        size = data.getUint32(p + 8, true);

      check(offset + size <= bodySize, `${name}: file outside MIX body`);
      this.entries.set(data.getUint32(p, true), { offset: body + offset, size });
    }
  }
  get(name: string): Uint8Array | undefined {
    const entry = this.entries.get(mixHash(name)) ?? this.entries.get(mixHash(name, true));

    return entry && this.bytes.subarray(entry.offset, entry.offset + entry.size);
  }
}

export interface IndexedFrame {
  width: number;
  height: number;
  x: number;
  y: number;
  canvasWidth: number;
  canvasHeight: number;
  pixels: Uint8Array;
}

export class ShpFile {
  readonly width: number;
  readonly height: number;
  readonly frameCount: number;
  constructor(readonly bytes: Uint8Array) {
    const d = view(bytes);
    check(bytes.length >= 8 && d.getUint16(0, true) === 0, 'Invalid TS SHP header');
    this.width = d.getUint16(2, true);
    this.height = d.getUint16(4, true);
    this.frameCount = d.getUint16(6, true);
    check(
      this.width <= 4096 &&
        this.height <= 4096 &&
        this.frameCount > 0 &&
        8 + this.frameCount * 24 <= bytes.length,
      'Invalid SHP dimensions or frame table',
    );
  }
  frame(index = 0): IndexedFrame {
    const d = view(this.bytes),
      h = 8 + (((index % this.frameCount) + this.frameCount) % this.frameCount) * 24;

    const x = d.getUint16(h, true),
      y = d.getUint16(h + 2, true),
      width = d.getUint16(h + 4, true),
      height = d.getUint16(h + 6, true),
      format = this.bytes[h + 8];

    check(width <= 4096 && height <= 4096 && format < 4, 'Invalid SHP frame');
    const pixels = new Uint8Array(width * height);
    let p = d.getUint32(h + 20, true);

    if (p && width && height) {
      check(p < this.bytes.length, 'SHP frame offset out of bounds');

      if (format === 3) {
        for (let row = 0; row < height; row++) {
          check(p + 2 <= this.bytes.length, 'Truncated SHP scanline');
          const end = p + d.getUint16(p, true);
          p += 2;
          check(end >= p && end <= this.bytes.length, 'Invalid SHP scanline length');
          let col = 0;

          while (p < end) {
            const value = this.bytes[p++];

            if (value) {
              check(col < width, 'SHP row overflow');
              pixels[row * width + col++] = value;
            } else {
              check(p < end, 'Truncated SHP zero run');
              col += this.bytes[p++];
              check(col <= width || p === end, 'SHP zero run overflow');
            }
          }
        }
      } else {
        let stride = width;

        if (format === 2) {
          stride = d.getUint16(p, true) - 2;
          p += 2;
        }

        check(
          stride >= 0 && stride <= width && p + stride * height <= this.bytes.length,
          'Truncated SHP raw frame',
        );

        for (let row = 0; row < height; row++) {
          pixels.set(this.bytes.subarray(p, p + stride), row * width);
          p += stride;
        }
      }
    }

    return { x, y, width, height, pixels, canvasWidth: this.width, canvasHeight: this.height };
  }
}

export function decodePalette(bytes: Uint8Array): Uint8Array {
  check(bytes.length >= 768, 'Truncated palette');

  return Uint8Array.from(bytes.subarray(0, 768), (value) => Math.min(255, value * 4));
}

/** Original 32-level voxel material lookup (the embedded palette is unused). */
export function decodeVpl(bytes: Uint8Array): Uint8Array {
  check(bytes.length >= 784, 'Truncated VPL header');

  const d = view(bytes),
    sections = d.getUint32(8, true);

  check(
    sections > 0 && sections <= 32 && bytes.length >= 784 + sections * 256,
    'Invalid VPL lighting table',
  );

  return bytes.slice(784, 784 + sections * 256);
}

export interface Voxel {
  x: number;
  y: number;
  z: number;
  color: number;
  normal: number;
}

export interface VoxelLimb {
  name: string;
  voxels: Voxel[];
  scale: number;
  bounds: number[];
  size: number[];
  normalType: number;
}

export function decodeVxl(bytes: Uint8Array): VoxelLimb[] {
  const d = view(bytes),
    text = new TextDecoder();

  check(
    bytes.length >= 802 && text.decode(bytes.subarray(0, 15)) === 'Voxel Animation',
    'Invalid VXL signature',
  );

  const count = d.getUint32(20, true),
    bodySize = d.getUint32(28, true),
    body = 802 + count * 28,
    tail = body + bodySize;

  check(count > 0 && count < 256 && tail + count * 92 <= bytes.length, 'Invalid VXL limb table');

  return Array.from({ length: count }, (_, i) => {
    const footer = tail + i * 92,
      start = body + d.getUint32(footer, true),
      spanData = body + d.getUint32(footer + 8, true);

    const size = [...bytes.subarray(footer + 88, footer + 91)],
      bounds = Array.from({ length: 6 }, (_, j) => d.getFloat32(footer + 64 + j * 4, true));

    const limb: VoxelLimb = {
      name: text.decode(bytes.subarray(802 + i * 28, 818 + i * 28)).replace(/\0.*$/, ''),
      size,
      bounds,
      normalType: bytes[footer + 91],
      scale: d.getFloat32(footer + 12, true),
      voxels: [],
    };

    check(
      size.every((x) => x > 0) && start + size[0] * size[1] * 4 <= tail && spanData < tail,
      'Invalid VXL span table',
    );

    for (let c = 0; c < size[0] * size[1]; c++) {
      const offset = d.getInt32(start + c * 4, true);

      if (offset < 0) continue;

      let p = spanData + offset,
        z = 0;

      while (z < size[2]) {
        check(p + 2 <= tail, 'Truncated VXL span');
        z += bytes[p++];
        const length = bytes[p++];
        check(z + length <= size[2] && p + length * 2 + 1 <= tail, 'Invalid VXL span length');

        for (let k = 0; k < length; k++)
          limb.voxels.push({
            x: c % size[0],
            y: Math.floor(c / size[0]),
            z: z++,
            color: bytes[p++],
            normal: bytes[p++],
          });
        p++;
        check(length > 0 || z >= size[2], 'Empty VXL span');
      }
    }

    return limb;
  });
}

export function decodeHva(bytes: Uint8Array): Map<string, number[]> {
  check(bytes.length >= 24, 'Truncated HVA');

  const d = view(bytes),
    count = d.getUint32(20, true),
    frames = d.getUint32(16, true),
    result = new Map<string, number[]>();

  check(
    count > 0 && frames > 0 && 24 + count * 16 + frames * count * 48 <= bytes.length,
    'Invalid HVA frame table',
  );

  for (let i = 0; i < count; i++) {
    const name = new TextDecoder()
      .decode(bytes.subarray(24 + i * 16, 40 + i * 16))
      .replace(/\0.*$/, '');

    result.set(
      name,
      Array.from({ length: 12 }, (_, k) => d.getFloat32(24 + count * 16 + i * 48 + k * 4, true)),
    );
  }

  return result;
}

export function decodeTmp(bytes: Uint8Array, frame = 0): IndexedFrame {
  check(bytes.length >= 20, 'Truncated TMP');

  const d = view(bytes),
    columns = d.getUint32(0, true),
    rows = d.getUint32(4, true),
    width = d.getUint32(8, true),
    height = d.getUint32(12, true);

  check(
    columns * rows > 0 &&
      columns * rows <= 4096 &&
      width === 60 &&
      height === 30 &&
      16 + columns * rows * 4 <= bytes.length,
    'Invalid RA2 TMP dimensions',
  );

  const offset = d.getUint32(16 + (frame % (columns * rows)) * 4, true),
    pixels = new Uint8Array(width * height);

  check(offset && offset + 52 + (width * height) / 2 <= bytes.length, 'Missing TMP tile');

  let p = offset + 52,
    span = 4;

  for (let y = 0; y < height; y++) {
    const start = y * width + (width - span) / 2;
    pixels.set(bytes.subarray(p, p + span), start);
    p += span;
    span += y < height / 2 - 1 ? 4 : -4;
  }

  return { width, height, canvasWidth: width, canvasHeight: height, x: 0, y: 0, pixels };
}
