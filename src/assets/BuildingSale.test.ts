import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssetManager } from './AssetManager';
import { MixArchive, ShpFile, decodePalette } from './formats';
import { CATALOG, NESTED_MIXES, theaterNames, wantedFiles } from './catalog';
import { TestCanvas } from './asset-test-fixtures';

afterEach(() => vi.unstubAllGlobals());
it('selects original MK artwork as optional enhancements for all retail buildings', () => {
  const wanted = wantedFiles();
  for (const spec of Object.values(CATALOG).filter(s => s.kind === 'building')) expect(wanted.has(spec.sprite + 'mk.shp')).toBe(true);
});
describe.skipIf(!process.env.RA2_ASSET_DIR)('retail building sell artwork', () => {
  it('loads and reverses original buildup frames for all fourteen supported structures', () => {
    vi.stubGlobal('document', { createElement: () => new TestCanvas() });
    const archives: MixArchive[] = [];
    const visit = (name: string, bytes: Uint8Array) => {
      const archive = new MixArchive(bytes, name); archives.push(archive);
      for (const nested of NESTED_MIXES) { const data = archive.get(nested); if (data) visit(nested, data); }
    };
    visit('ra2.mix', readFileSync(join(process.env.RA2_ASSET_DIR!, 'ra2.mix')));
    const get = (name: string) => archives.map(a => a.get(name)).find(Boolean);
    const files = new Map([...wantedFiles()].flatMap(name => { const bytes = get(name); return bytes ? [[name, bytes] as const] : []; }));
    const assets = new AssetManager(); assets.ready = true;
    Object.assign(assets, { files, unitPalette: decodePalette(get('unittem.pal')!) });
    const expectedFrames: Record<string, number> = { gacnst: 29, nacnst: 31, gapowr: 25, napowr: 26, gapile: 25, nahand: 25, garefn: 25, narefn: 26, gaweap: 25, naweap: 25, gaairc: 25, naradr: 30, gapill: 8, nalasr: 12 };
    for (const spec of Object.values(CATALOG).filter(s => s.kind === 'building')) {
      const name = theaterNames(spec.sprite + 'mk').map(n => n + '.shp').find(n => files.has(n))!, shape = new ShpFile(files.get(name)!);
      expect(shape.frameCount / 2).toBe(expectedFrames[spec.sprite]);
      const first = assets.getBuildingSellSprite(spec.sprite, 0, -1)!, middle = assets.getBuildingSellSprite(spec.sprite, .5, -1)!, last = assets.getBuildingSellSprite(spec.sprite, 1, -1)!;
      expect(first).not.toBeNull(); expect(middle).not.toBe(first); expect(last).not.toBe(middle);
      expect(assets.getBuildingSellSprite(spec.sprite, 0, -1)).toBe(first);
      expect([first, middle, last].every(s => Number.isFinite(s.anchorX) && Number.isFinite(s.anchorY))).toBe(true);
      expect((first.source as unknown as TestCanvas).pixels.some((v, i) => i % 4 === 3 && v === 255)).toBe(true);
    }
  });
});
