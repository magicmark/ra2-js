import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AssetManager } from './AssetManager';
import { MixArchive, ShpFile, decodePalette } from './formats';
import { NESTED_MIXES, wantedFiles } from './catalog';
import { TestCanvas, testShape } from './asset-test-fixtures';
import { buildingLoops } from './buildingAnimations';
import { readArtSections } from './NativeAnimation';

afterEach(() => vi.unstubAllGlobals());
function manager() {
  vi.stubGlobal('document', { createElement: () => new TestCanvas() });
  const assets = new AssetManager(); assets.ready = true;
  const palette = new Uint8Array(768); palette.set([71, 82, 93], 30);
  Object.assign(assets, { files: new Map([['pips.shp', testShape(19)], ['pips2.shp', testShape(18)], ['oregath.shp', testShape(120)]]), pipPalette: palette, animationPalette: palette });
  return assets;
}
describe('original unit indicator and harvesting artwork', () => {
  it('extracts the original pip palette, both pip shapes, and directional ore gathering effect', () => {
    const wanted = wantedFiles();
    for (const file of ['palette.pal', 'pips.shp', 'pips2.shp', 'oregath.shp']) expect(wanted.has(file)).toBe(true);
  });
  it('loops exactly fifteen ticks per facing and caches only authored frame combinations', () => {
    const assets = manager(), first = assets.getHarvestSprite(0, 0)!;
    expect(first).not.toBeNull(); expect(assets.getHarvestSprite(0, 1 / 30)).not.toBe(first);
    expect(assets.getHarvestSprite(0, .5)).toBe(first);
    expect(assets.getHarvestSprite(1, 0)).not.toBe(first);
    const sources = new Set();
    for (let direction = 0; direction < 8; direction++) for (let tick = 0; tick < 120; tick++) sources.add(assets.getHarvestSprite(direction, tick / 30));
    expect(sources.size).toBe(120);
  });
  it('keeps original palette colors without applying player remap to yellow pips', () => {
    const assets = manager();
    for (const kind of ['veteran', 'elite', 'cargo-empty', 'cargo-ore'] as const) {
      const sprite = assets.getPipSprite(kind)!;
      expect(Array.from((sprite.source as unknown as TestCanvas).pixels)).toEqual([71, 82, 93, 255]);
      expect(assets.getPipSprite(kind)).toBe(sprite);
    }
  });
});

describe.skipIf(!process.env.RA2_ASSET_DIR)('real installer unit visual assets', () => {
  it('uses the exact retail veterancy/cargo pixels and all 120 gathering frames', () => {
    const archives: MixArchive[] = [];
    const visit = (name: string, bytes: Uint8Array) => {
      const archive = new MixArchive(bytes, name); archives.push(archive);
      for (const name of NESTED_MIXES) { const nested = archive.get(name); if (nested) visit(name, nested); }
    };
    for (const file of ['ra2.mix', 'language.mix']) visit(file, readFileSync(join(process.env.RA2_ASSET_DIR!, file)));
    const get = (name: string) => archives.map(a => a.get(name)).find(Boolean)!;
    const assets = manager(), pipPalette = decodePalette(get('palette.pal'));
    Object.assign(assets, { files: new Map(['pips.shp', 'pips2.shp', 'oregath.shp'].map(name => [name, get(name)])), pipPalette, animationPalette: decodePalette(get('anim.pal')) });
    for (const [kind, name, index, width, height] of [['veteran', 'pips.shp', 13, 8, 5], ['elite', 'pips.shp', 14, 8, 13], ['cargo-empty', 'pips2.shp', 0, 4, 4], ['cargo-ore', 'pips2.shp', 2, 4, 4]] as const) {
      const sprite = assets.getPipSprite(kind)!, frame = new ShpFile(get(name)).frame(index);
      expect([sprite.width, sprite.height]).toEqual([width, height]);
      const expected = Array.from(frame.pixels).flatMap(i => i === 0 ? [0, 0, 0, 0] : [...pipPalette.slice(i * 3, i * 3 + 3), 255]);
      expect(Array.from((sprite.source as unknown as TestCanvas).pixels)).toEqual(expected);
    }
    const shape = new ShpFile(get('oregath.shp')); expect(shape.frameCount).toBe(120);
    const hashes = new Set();
    for (let facing = 0; facing < 8; facing++) for (let tick = 0; tick < 15; tick++) {
      const sprite = assets.getHarvestSprite(facing, tick / 30)!;
      expect(sprite.source).toBeDefined(); hashes.add(Array.from((sprite.source as unknown as TestCanvas).pixels).join(','));
    }
    expect(hashes.size).toBe(120);
    const selected = [...wantedFiles()].map(name => ({ name, bytes: get(name) })).filter(file => file.bytes);
    Object.assign(assets, { files: new Map(selected.map(file => [file.name, file.bytes])), art: readArtSections(get('art.ini')), buildingLoops: buildingLoops(get('art.ini')) });
    const oil = assets.getNativeStructure('TEMPERATE', 'CAOILD', 0, 0)!;
    expect(oil).not.toBeNull();
    expect(assets.getNativeStructure('TEMPERATE', 'CAOILD', 2 / 30, 0)).toBe(oil);
    const flag = assets.getNativeStructure('TEMPERATE', 'CAOILD', 3 / 30, 0)!;
    const pump = assets.getNativeStructure('TEMPERATE', 'CAOILD', 4 / 30, 0)!;
    expect(Array.from((flag.source as unknown as TestCanvas).pixels)).not.toEqual(Array.from((oil.source as unknown as TestCanvas).pixels));
    expect(Array.from((pump.source as unknown as TestCanvas).pixels)).not.toEqual(Array.from((flag.source as unknown as TestCanvas).pixels));
    expect(assets.getNativeStructure('TEMPERATE', 'CAOILD', 384 / 30, 0)).toBe(oil);
    expect(assets.getNativeStructure('TEMPERATE', 'CAOILD', 0, 1)).not.toBe(oil);
  });
});
