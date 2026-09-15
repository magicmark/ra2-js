import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssetManager } from './AssetManager';
import { CATALOG, theaterNames, wantedFiles } from './catalog';
import { TestCanvas, testShape } from './asset-test-fixtures';
import { buildingLoops } from './buildingAnimations';
import { NATIVE_THEATERS } from '../game/maps/theater';

afterEach(() => vi.unstubAllGlobals());

// Each SHP layer paints a different column. Two body frames plus two empty
// shadow frames exercise both standing composites and animated/sale artwork.
function shape(color: number, column = 0): Uint8Array {
  const bytes = testShape(4), data = new DataView(bytes.buffer);
  data.setUint16(2, 5, true);
  for (let frame = 0; frame < 4; frame++) {
    data.setUint16(8 + frame * 24, column, true);
    bytes[8 + 4 * 24 + frame] = frame < 2 ? color + frame : 0;
  }
  return bytes;
}

function manager(files: [string, Uint8Array][]): AssetManager {
  vi.stubGlobal('document', { createElement: () => new TestCanvas() });
  const palette = new Uint8Array(768);
  for (let index = 0; index < 256; index++) palette.set([index % 64, 0, 0], index * 3);
  const assets = new AssetManager(); assets.ready = true;
  Object.assign(assets, { files: new Map([...files, ...['unittem.pal', 'unitsno.pal', 'uniturb.pal'].map(name => [name, palette] as [string, Uint8Array])]) });
  // Initialize the real decoded palette without invoking archive loading.
  assets.setTheater('SNOW'); assets.setTheater('TEMPERATE');
  return assets;
}

function colors(sprite: ReturnType<AssetManager['getSprite']>): number[] {
  expect(sprite).not.toBeNull();
  const pixels = (sprite!.source as unknown as TestCanvas).pixels;
  return Array.from(pixels).filter((_, index) => index % 4 === 0);
}

describe('map theater artwork', () => {
  it('splits both factories into original under-door and foreground art with one stable theater-specific anchor', () => {
    for (const id of ['warfactory', 'warfactory_soviet']) {
      const spec = CATALOG[id], files: [string, Uint8Array][] = [];
      for (const [letter, color] of [['g', 10], ['a', 20]] as const)
        for (const [column, name] of [spec.sprite, spec.bib!, ...spec.overlays!].entries())
          {
            const bytes = shape(color + column, column);
            new DataView(bytes.buffer).setUint16(2, 6, true);
            files.push([name[0] + letter + name.slice(2) + '.shp', bytes]);
          }
      const assets = manager(files);
      for (const [theater, color] of [['TEMPERATE', 10], ['SNOW', 20]] as const) {
        assets.setTheater(theater);
        const back = assets.getFactoryExitSprite(id, 'back', 0, -1)!;
        const front = assets.getFactoryExitSprite(id, 'front', 0, -1)!;
        const complete = assets.getBuildingSprite(id, 0, -1)!;
        expect(colors(back)).toEqual([(color + 1) * 4, (color + 2) * 4]);
        expect(colors(front)).toEqual(Array.from({ length: spec.overlays!.length - 1 }, (_, n) => (color + 3 + n) * 4));
        expect(back.anchorY).toBe(complete.anchorY); expect(front.anchorY).toBe(complete.anchorY);
        // Trimming removes different columns but preserves their world placement.
        expect(back.anchorX! + 1).toBe(complete.anchorX);
        expect(front.anchorX! + 3).toBe(complete.anchorX);
        expect(assets.getFactoryExitSprite(id, 'back', 20, -1)).toBe(back);
      }
    }
  });
  it('extracts every supported theater for building bodies, bibs, animations and buildup', () => {
    const wanted = wantedFiles();
    for (const spec of Object.values(CATALOG).filter(spec => spec.kind === 'building')) {
      for (const name of [spec.sprite, spec.sprite + 'mk', ...(spec.overlays ?? []), ...(spec.bib ? [spec.bib] : [])]) {
        for (const letter of ['t', 'a', 'u', 'g']) expect(wanted.has(name[0] + letter + name.slice(2) + '.shp')).toBe(true);
      }
    }
    expect(theaterNames('GAPOWR', 'SNOW')).toEqual(['gapowr', 'ggpowr']);
  });

  for (const [id, spec] of Object.entries(CATALOG).filter(([, spec]) => spec.kind === 'building')) {
    it(`${id}: uses generic dry art and Arctic snow art without leaking cached sprites`, () => {
      const assets = manager([[spec.sprite + '.shp', shape(30)], [spec.sprite[0] + 'g' + spec.sprite.slice(2) + '.shp', shape(10)]]);
      expect(colors(assets.getSprite(id, 0, -1))).toEqual([40]);
      const dry = assets.getSprite(id, 0, -1);
      assets.setTheater('TEMPERATE');
      expect(assets.getSprite(id, 0, -1)).toBe(dry);
      assets.setTheater('SNOW');
      expect(colors(assets.getSprite(id, 0, -1))).toEqual([120]);
      assets.setTheater('URBAN');
      expect(colors(assets.getSprite(id, 0, -1))).toEqual([40]);
      assets.setTheater('TEMPERATE');
      expect(colors(assets.getSprite(id, 0, -1))).toEqual([40]);
    });
  }

  it('prefers explicit temperate/urban art and keeps bibs, animated layers and sales in the same theater', () => {
    const spec = CATALOG.refinery, files: [string, Uint8Array][] = [];
    for (const [letter, color] of [['g', 10], ['a', 20], ['t', 30], ['u', 40]] as const) {
      for (const [column, name] of [spec.sprite, spec.bib!, ...spec.overlays!].entries()) files.push([name[0] + letter + name.slice(2) + '.shp', shape(color + column, column)]);
      files.push([`g${letter}refnmk.shp`, shape(color + 5)]);
    }
    const assets = manager(files);
    Object.assign(assets, { buildingLoops: buildingLoops(new TextEncoder().encode(spec.overlays!.map(name => `[${name}]\nLoopCount=-1\nLoopEnd=2\nRate=900`).join('\n'))) });
    for (const [theater, color] of [['TEMPERATE', 30], ['SNOW', 20], ['URBAN', 40]] as const) {
      assets.setTheater(theater);
      expect(colors(assets.getBuildingSprite('refinery', 0, -1))).toEqual([color, color + 1, color + 2, color + 3, color + 4].map(value => value * 4));
      expect(colors(assets.getBuildingSprite('refinery', 1 / 30, -1))).toEqual([color, color + 1, color + 3, color + 4, color + 5].map(value => value * 4));
      expect(colors(assets.getBuildingSellSprite('refinery', 0, -1))).toEqual([(color + 6) * 4]);
      expect(colors(assets.getBuildingSellSprite('refinery', 1, -1))).toEqual([(color + 5) * 4]);
      expect(colors(assets.getBuildingBuildSprite('refinery', 0, -1))).toEqual([(color + 5) * 4]);
      expect(colors(assets.getBuildingBuildSprite('refinery', .5, -1))).toEqual([(color + 6) * 4]);
      expect(colors(assets.getBuildingBuildSprite('refinery', 1, -1))).toEqual([(color + 6) * 4]);
    }
  });

  it('uses Arctic rather than generic artwork for native snow structures', () => {
    const assets = manager([['caoild.shp', shape(30)], ['cgoild.shp', shape(10)]]);
    expect(colors(assets.getNativeStructure('SNOW', 'CAOILD'))).toEqual([120]);
    expect(colors(assets.getNativeStructure('TEMPERATE', 'CAOILD'))).toEqual([40]);
    expect(colors(assets.getNativeStructure('URBAN', 'CAOILD'))).toEqual([40]);
  });

  it('does not mistake the Gap Generator cameo for Arctic building artwork', () => {
    for (const theater of NATIVE_THEATERS) expect(theaterNames('GAPICON', theater)).toEqual(['gapicon']);
  });

  it('does not silently fall back to snow when dry building art is missing', () => {
    const assets = manager([['gapowr.shp', shape(30)], ['caoild.shp', shape(30)]]);
    for (const theater of ['TEMPERATE', 'URBAN'] as const) {
      assets.setTheater(theater);
      expect(assets.getSprite('power')).toBeNull();
      expect(assets.getNativeStructure(theater, 'CAOILD')).toBeNull();
    }
  });

  it('switches unit palettes along with the theater and invalidates cached pixels', () => {
    const assets = manager([['gapowr.shp', shape(10)], ['ggpowr.shp', shape(10)]]);
    for (const [index, theater] of NATIVE_THEATERS.entries()) {
      const palette = new Uint8Array(768); palette.set([index + 1, 0, 0], 30);
      (assets as any).nativePalettes.set({ TEMPERATE: 'unittem.pal', SNOW: 'unitsno.pal', URBAN: 'uniturb.pal' }[theater], palette);
    }
    for (const [theater, color] of [['SNOW', 2], ['URBAN', 3], ['TEMPERATE', 1]] as const) {
      assets.setTheater(theater);
      expect(colors(assets.getSprite('power', 0, -1))).toEqual([color]);
    }
  });
});
