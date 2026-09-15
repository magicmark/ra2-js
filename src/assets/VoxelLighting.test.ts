import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { AssetManager } from './AssetManager';
import { TestCanvas, testCanvas } from './asset-test-fixtures';
import { NESTED_MIXES } from './catalog';
import { decodeVxl, MixArchive } from './formats';
import { RA2_NORMALS, TS_NORMALS } from './voxelNormals';

afterEach(() => vi.unstubAllGlobals());

// A single original-format voxel, spaced away from other parts for pixel assertions.
function voxel(normalType: number, normal: number, x: number): Uint8Array {
  const bytes = new Uint8Array(935),
    d = new DataView(bytes.buffer),
    footer = 843;

  bytes.set(new TextEncoder().encode('Voxel Animation'));
  d.setUint32(20, 1, true);
  d.setUint32(24, 1, true);
  d.setUint32(28, 13, true);
  bytes.set(new TextEncoder().encode('hull'), 802);
  bytes.set([0, 1, 80, normal, 1], 838);
  d.setUint32(footer + 4, 4, true);
  d.setUint32(footer + 8, 8, true);
  d.setFloat32(footer + 12, 1, true);
  [x, 0, 0, x + 1, 1, 1].forEach((value, i) => d.setFloat32(footer + 64 + i * 4, value, true));
  bytes.set([1, 1, 1, normalType], footer + 88);

  return bytes;
}

function transform(): Uint8Array {
  const bytes = new Uint8Array(88),
    d = new DataView(bytes.buffer);

  d.setUint32(16, 1, true);
  d.setUint32(20, 1, true);
  bytes.set(new TextEncoder().encode('hull'), 24);
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0].forEach((value, i) => d.setFloat32(40 + i * 4, value, true));

  return bytes;
}

it('shades mixed TS/RA2 vehicle parts using each limb header, including normal 244', () => {
  vi.stubGlobal('document', { createElement: () => new TestCanvas() });
  const assets = new AssetManager();
  assets.ready = true;
  const files = new Map<string, Uint8Array>();

  for (const [name, type, normal, x] of [
    ['htnk', 2, 32, -20],
    ['htnktur', 4, 232, 0],
    ['htnkbarl', 4, 244, 20],
  ] as const) {
    files.set(name + '.vxl', voxel(type, normal, x));
    files.set(name + '.hva', transform());
  }

  // Encode the selected VPL level as a red channel, avoiding remap indices.
  const unitPalette = new Uint8Array(768),
    voxelLighting = new Uint8Array(8192);

  for (let level = 0; level < 32; level++) {
    voxelLighting.fill(100 + level, level * 256, (level + 1) * 256);
    unitPalette[(100 + level) * 3] = level;
  }

  Object.assign(assets, { files, unitPalette, voxelLighting });

  for (const [facing, expected] of [
    [0, [2, 3, 4]],
    [8, [1, 4, 5]],
    [16, [4, 5, 6]],
    [24, [4, 5, 8]],
  ] as const) {
    const sprite = assets.getVehicleSprite('rhino', facing, facing)!;

    const data = testCanvas(sprite.source).pixels,
      levels: number[] = [];

    for (let i = 0; i < data.length; i += 4) if (data[i + 3] === 255) levels.push(data[i]);
    expect(
      levels.sort((a, b) => a - b),
      `facing ${facing}`,
    ).toEqual(expected);
    expect(assets.getVehicleSprite('rhino', facing + 32, facing + 32)).toBe(sprite);
  }

  expect(assets.diagnostics).toEqual([]);
});

it.skipIf(!process.env.RA2_ASSET_DIR)(
  'resolves the original Rhino, Carrier and Hornet normal formats without missing directions',
  () => {
    const archives: MixArchive[] = [];

    const visit = (bytes: Uint8Array) => {
      const archive = new MixArchive(bytes);
      archives.push(archive);

      for (const name of NESTED_MIXES) {
        const nested = archive.get(name);

        if (nested) visit(nested);
      }
    };

    visit(readFileSync(join(process.env.RA2_ASSET_DIR!, 'ra2.mix')));
    const get = (name: string) => archives.map((a) => a.get(name)).find(Boolean)!;

    for (const [name, type, count] of [
      ['htnk', 2, 4816],
      ['htnktur', 2, 1501],
      ['htnkbarl', 4, 155],
      ['carrier', 4, 19247],
      ['hornet', 2, 583],
    ] as const) {
      const [limb] = decodeVxl(get(name + '.vxl'));
      expect(limb.normalType, name).toBe(type);
      expect(limb.voxels, name).toHaveLength(count);
      const normals = type === 2 ? TS_NORMALS : RA2_NORMALS;
      expect(
        limb.voxels.every((v) => (v.normal + 1) * 3 <= normals.length),
        name,
      ).toBe(true);

      if (name === 'carrier') expect(limb.voxels.filter((v) => v.normal === 244)).toHaveLength(74);
    }

    expect(TS_NORMALS).toHaveLength(36 * 3);
    expect(RA2_NORMALS).toHaveLength(245 * 3);
  },
);
