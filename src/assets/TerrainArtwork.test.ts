import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssetManager } from './AssetManager';
import { MixArchive, ShpFile, decodePalette } from './formats';
import { NESTED_MIXES, wantedFiles } from './catalog';
import { TestCanvas, testShape } from './asset-test-fixtures';

afterEach(() => vi.unstubAllGlobals());
it('requests authentic temperate palms, pavement transitions and theater ore drills', () => {
  const wanted = wantedFiles();
  for (const name of ['tree20.tem', 'tree21.tem', 'tree22.tem', 'tree23.tem', 'plat02.tem', 'tibtre01.tem', 'tibtre01.sno', 'tibtre01.urb']) expect(wanted.has(name)).toBe(true);
});
it('keeps missing optional ore drill art safe in a legacy cache', () => {
  const assets = new AssetManager(); assets.ready = true;
  expect(assets.getNativeDecoration('TEMPERATE', 'TIBTRE01')).toBeNull();
});
it('paints ore drill foreground in unit colors at full opacity', () => {
  vi.stubGlobal('document', { createElement: () => new TestCanvas() });
  const assets = new AssetManager(); assets.ready = true;
  const unit = new Uint8Array(768), iso = new Uint8Array(768); unit.set([12, 21, 31], 30); iso.set([60, 2, 61], 30);
  Object.assign(assets, { files: new Map([['tibtre01.tem', testShape(22)], ['unittem.pal', unit], ['isotem.pal', iso]]) });
  const art = assets.getNativeDecoration('TEMPERATE', 'TIBTRE01')!;
  expect(Array.from((art.source as unknown as TestCanvas).pixels)).toEqual([48, 84, 124, 255]);
});
describe.skipIf(!process.env.RA2_ASSET_DIR)('original ore drill foreground and shadows', () => {
  it('retains each opaque original unit-palette pixel throughout the eleven-frame cycle', () => {
    vi.stubGlobal('document', { createElement: () => new TestCanvas() });
    const archives: MixArchive[] = [];
    const visit = (name: string, bytes: Uint8Array) => {
      const archive = new MixArchive(bytes, name); archives.push(archive);
      for (const nested of NESTED_MIXES) { const data = archive.get(nested); if (data) visit(nested, data); }
    };
    visit('ra2.mix', readFileSync(join(process.env.RA2_ASSET_DIR!, 'ra2.mix')));
    const get = (name: string) => archives.map(a => a.get(name)).find(Boolean)!;
    const assets = new AssetManager(); assets.ready = true;
    Object.assign(assets, { files: new Map(['tibtre01.tem', 'unittem.pal'].map(name => [name, get(name)])) });
    const shape = new ShpFile(get('tibtre01.tem')), palette = decodePalette(get('unittem.pal'));
    expect(shape.frameCount).toBe(22);
    for (let n = 0; n < 11; n++) {
      const art = assets.getNativeDecoration('TEMPERATE', 'TIBTRE01', n)!, pixels = (art.source as unknown as TestCanvas).pixels, frame = shape.frame(n);
      const left = shape.width / 2 - art.anchorX, top = shape.height / 2 - art.anchorY;
      for (let y = 0; y < frame.height; y++) for (let x = 0; x < frame.width; x++) {
        const color = frame.pixels[y * frame.width + x]; if (!color) continue;
        const p = ((y + frame.y - top) * art.width + x + frame.x - left) * 4;
        expect(Array.from(pixels.slice(p, p + 4))).toEqual([...palette.slice(color * 3, color * 3 + 3), 255]);
      }
      expect(pixels.some((v, i) => i % 4 === 3 && v === 105), 'separate translucent ground shadow').toBe(true);
    }
  });
});
