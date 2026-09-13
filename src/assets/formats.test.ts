import { describe, expect, it } from 'vitest';
import { Blowfish } from 'egoroof-blowfish';
import { decodeHva, decodePalette, decodeTmp, decodeVpl, decodeVxl, MixArchive, mixHash, ShpFile, unwrapMixKey } from './formats';

function shp(format: number, payload: number[], width = 4, height = 2): Uint8Array {
  const bytes = new Uint8Array(32 + payload.length), d = new DataView(bytes.buffer);
  d.setUint16(2, 10, true); d.setUint16(4, 12, true); d.setUint16(6, 1, true);
  d.setUint16(8, 2, true); d.setUint16(10, 3, true); d.setUint16(12, width, true); d.setUint16(14, height, true);
  bytes[16] = format; d.setUint32(28, 32, true); bytes.set(payload, 32); return bytes;
}
describe('Westwood asset formats', () => {
  it('decodes the authored VPL lighting lookup without treating its redundant palette as material data', () => {
    const bytes = new Uint8Array(784 + 32 * 256), data = new DataView(bytes.buffer);
    data.setUint32(0, 16, true); data.setUint32(4, 31, true); data.setUint32(8, 32, true);
    bytes.fill(77, 16, 784); bytes[784 + 25 * 256 + 88] = 15;
    const levels = decodeVpl(bytes);
    expect(levels).toHaveLength(8192); expect(levels[25 * 256 + 88]).toBe(15); expect(levels[0]).toBe(0);
    expect(() => decodeVpl(bytes.subarray(0, bytes.length - 1))).toThrow(/VPL/);
  });
  it('uses Westwood CRC padding and classic filename hashing, case insensitively', () => {
    expect(mixHash('local.mix')).toBe(0xa8548fd9);
    expect(mixHash('LOCAL.MIX')).toBe(mixHash('local.mix'));
    expect(mixHash('a', true)).toBe(65);
    expect(mixHash('abcde', true)).toBe(0x888684c7);
  });
  it('reads both legacy and flagged MIX archives without copying file bodies', () => {
    for (const offset of [0, 4]) {
      const bytes = new Uint8Array(offset + 21), d = new DataView(bytes.buffer);
      d.setUint16(offset, 1, true); d.setUint32(offset + 2, 3, true);
      d.setUint32(offset + 6, mixHash('hello.dat'), true); d.setUint32(offset + 14, 3, true); bytes.set([1, 2, 3], offset + 18);
      const archive = new MixArchive(bytes);
      expect([...archive.get('hello.dat')!]).toEqual([1, 2, 3]);
      expect(archive.get('hello.dat')!.buffer).toBe(bytes.buffer);
      expect(archive.get('missing')).toBeUndefined();
      expect(() => new MixArchive(bytes.subarray(0, bytes.length - 1))).toThrow(/truncated/);
    }
  });
  it('decrypts RSA-wrapped Blowfish MIX indexes including trailing zero padding', () => {
    const wrapped = Uint8Array.from({ length: 80 }, (_, i) => i + 1), key = unwrapMixKey(wrapped);
    expect(key).toHaveLength(56);
    const header = new Uint8Array(24), h = new DataView(header.buffer);
    h.setUint16(0, 1, true); h.setUint32(2, 3, true); h.setUint32(6, mixHash('test.shp'), true); h.setUint32(14, 3, true);
    const fish = new Blowfish(key, Blowfish.MODE.ECB, Blowfish.PADDING.NULL), bytes = new Uint8Array(111);
    bytes.set([0, 0, 2, 0]); bytes.set(wrapped, 4); bytes.set(fish.encode(header).subarray(0, 24), 84); bytes.set([7, 8, 9], 108);
    const mix = new MixArchive(bytes);
    expect(mix.encrypted).toBe(true); expect([...mix.get('test.shp')!]).toEqual([7, 8, 9]);
  });
  it('decodes raw and RLE SHP frames with transparent scanline tails', () => {
    const raw = new ShpFile(shp(0, [1, 2, 3, 4, 5, 6, 7, 8]));
    expect(raw.frame()).toMatchObject({ width: 4, height: 2, x: 2, y: 3, canvasWidth: 10, canvasHeight: 12 });
    expect([...raw.frame().pixels]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    const rle = new ShpFile(shp(3, [7, 0, 0, 2, 9, 0, 2, 6, 0, 4, 5, 6, 7]));
    expect([...rle.frame().pixels]).toEqual([0, 0, 9, 0, 4, 5, 6, 7]);
    expect(() => new ShpFile(shp(3, [4, 0, 0, 255, 4, 0, 0, 2])).frame()).not.toThrow();
    expect(() => new ShpFile(shp(3, [6, 0, 0, 8, 1, 2])).frame()).toThrow(/overflow/);
  });
  it('scales 6-bit palettes and rejects malformed palettes and models', () => {
    const bytes = new Uint8Array(768); bytes.set([63, 31, 0]);
    expect([...decodePalette(bytes).subarray(0, 3)]).toEqual([252, 124, 0]);
    expect(() => decodePalette(new Uint8Array(20))).toThrow();
    expect(() => decodeVxl(new Uint8Array(802))).toThrow(/signature/);
    expect(() => decodeHva(new Uint8Array(100))).toThrow(/table/);
  });
  it('reads VXL column spans, skips empty columns, and associates HVA limb transforms', () => {
    const bytes = new Uint8Array(946), d = new DataView(bytes.buffer), body = 830, footer = 854;
    bytes.set(new TextEncoder().encode('Voxel Animation'));
    d.setUint32(20, 1, true); d.setUint32(24, 1, true); d.setUint32(28, 24, true);
    bytes.set(new TextEncoder().encode('hull'), 802);
    d.setInt32(body, 0, true); d.setInt32(body + 4, -1, true);
    bytes.set([0, 1, 7, 4, 1, 1, 0, 0], body + 16);
    d.setUint32(footer + 4, 8, true); d.setUint32(footer + 8, 16, true); d.setFloat32(footer + 12, 1, true);
    [0, 0, 0, 2, 1, 2].forEach((v, i) => d.setFloat32(footer + 64 + i * 4, v, true));
    bytes.set([2, 1, 2, 4], footer + 88);
    const limbs = decodeVxl(bytes);
    expect(limbs[0].name).toBe('hull'); expect(limbs[0].voxels).toEqual([{ x: 0, y: 0, z: 0, color: 7, normal: 4 }]);
    const hva = new Uint8Array(88), h = new DataView(hva.buffer);
    h.setUint32(16, 1, true); h.setUint32(20, 1, true); hva.set(new TextEncoder().encode('hull'), 24);
    const transform = [1, 0, 0, 3, 0, 1, 0, 4, 0, 0, 1, 5];
    transform.forEach((v, i) => h.setFloat32(40 + i * 4, v, true));
    expect(decodeHva(hva).get('hull')).toEqual(transform);
  });
  it('unpacks RA2 diamond terrain rather than treating it as rectangular pixels', () => {
    const bytes = new Uint8Array(20 + 52 + 900), d = new DataView(bytes.buffer);
    d.setUint32(0, 1, true); d.setUint32(4, 1, true); d.setUint32(8, 60, true); d.setUint32(12, 30, true); d.setUint32(16, 20, true);
    bytes.fill(10, 72); const tile = decodeTmp(bytes);
    expect(tile.pixels.filter(x => x === 10)).toHaveLength(900);
    expect(tile.pixels[0]).toBe(0); expect(tile.pixels[28]).toBe(10); expect(tile.pixels[14 * 60]).toBe(10);
  });
});
