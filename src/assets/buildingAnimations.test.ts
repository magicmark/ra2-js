import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildingLoopFrame, buildingLoops } from './buildingAnimations';
import { AssetManager } from './AssetManager';
import { TestCanvas, testShape } from './asset-test-fixtures';

afterEach(() => vi.unstubAllGlobals());

describe('original building idle animation', () => {
  it('keeps the Soviet construction yard beacon visible above the full-building crane layer', () => {
    vi.stubGlobal('document', { createElement: () => new TestCanvas() });
    const assets = new AssetManager(), light = testShape(4), palette = new Uint8Array(768);
    light[8 + 4 * 24 + 1] = 11;
    palette[30] = 120; palette[33] = 240;
    assets.ready = true;
    Object.assign(assets, {
      files: new Map([['ngcnst.shp', testShape()], ['ngcnst_a.shp', light], ['ngcnst_b.shp', testShape()], ['ngcnst_c.shp', testShape()]]),
      unitPalette: palette,
      buildingLoops: buildingLoops(new TextEncoder().encode('[NACNST_A]\nLoopEnd=2\nLoopCount=-1\nRate=900')),
    });
    const first = assets.getBuildingSprite('conyard_soviet', 0, 1)!;
    const second = assets.getBuildingSprite('conyard_soviet', 1 / 30, 1)!;
    expect(Array.from((first.source as unknown as TestCanvas).pixels)).toEqual([120, 0, 0, 255]);
    expect(Array.from((second.source as unknown as TestCanvas).pixels)).toEqual([240, 0, 0, 255]);
    expect(assets.getBuildingSprite('conyard_soviet', 2 / 30, 1)).toBe(first);
  });

  const art = new TextEncoder().encode(`; [NOT_A_SECTION]
[GAPILE_A]
LoopStart=0
LoopEnd=15 ; exclusive; damaged art starts at16
LoopCount=-1
Rate=300
Normalized=yes
[GAPILE_AD]
LoopStart=16
LoopEnd=31
LoopCount=-1
Rate=300
[GACNST_B]
LoopStart=0
LoopEnd=20
LoopCount=1
Rate=200
[STOPPED]
LoopStart=0
LoopEnd=8
LoopCount=-1
Rate=0
`);
  it('reads the authored healthy loop without playing production or stopped animations', () => {
    const loops = buildingLoops(art);
    expect(loops.get('gapile_a')).toEqual({ start: 0, end: 15, ticksPerFrame: 3, normalized: true });
    expect(loops.get('gapile_ad')?.ticksPerFrame).toBe(3);
    expect(loops.has('gacnst_b')).toBe(false);
    expect(loops.has('stopped')).toBe(false);
    expect(buildingLoops(undefined).size).toBe(0);
  });
  it('advances discrete frames, repeats exactly, and never visits damaged or shadow frames', () => {
    const loop = buildingLoops(art).get('gapile_a');
    expect(buildingLoopFrame(loop, 0, 32)).toBe(0);
    expect(buildingLoopFrame(loop, 3 / 30, 32)).toBe(0);
    expect(buildingLoopFrame(loop, 4 / 30, 32)).toBe(1);
    expect(buildingLoopFrame(loop, 56 / 30, 32)).toBe(14);
    expect(buildingLoopFrame(loop, 2, 32)).toBe(0);
    expect(buildingLoopFrame(loop, 20 + 4 / 30, 32)).toBe(1);
    expect(buildingLoopFrame(loop, 4 / 30, 2)).toBe(1);
    expect(buildingLoopFrame(loop, 2 / 30, 32, 6)).toBe(1);
    expect(buildingLoopFrame(loop, 4 / 30, 32, 0)).toBe(0);
    expect(buildingLoopFrame(loop, 5 / 30, 32, 0)).toBe(1);
  });
});
