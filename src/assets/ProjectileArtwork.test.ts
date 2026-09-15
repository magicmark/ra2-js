import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { AssetManager } from './AssetManager';
import { NESTED_MIXES, wantedFiles } from './catalog';
import { MixArchive, ShpFile, decodePalette } from './formats';
import { TestCanvas, testCanvas, testShp } from './asset-test-fixtures';
import { readArtSections } from './NativeAnimation';
import { IFV_MISSILE_SPEED, IFV_MISSILE_FLH } from '../game/ifvWeapons';

afterEach(() => vi.unstubAllGlobals());

function manager(bytes: Uint8Array = testShp(32), palette: Uint8Array = new Uint8Array(768)) {
  vi.stubGlobal('document', { createElement: () => new TestCanvas() });
  const assets = new AssetManager();
  assets.ready = true;
  Object.assign(assets, {
    files: new Map([
      ['dragon.shp', bytes],
      ['unittem.pal', palette],
      ['unitsno.pal', palette],
      ['uniturb.pal', palette],
    ]),
  });

  return assets;
}

it('selects original rocket art and bounds the directional cache to 32 frames per theater', () => {
  expect(wantedFiles().has('dragon.shp')).toBe(true);

  const assets = manager(),
    sources = new Set();

  for (let turn = -64; turn < 64; turn++)
    sources.add(assets.getProjectileSprite('DRAGON', (turn / 32) * Math.PI * 2));
  expect(sources.size).toBe(32);
  expect(assets.getProjectileSprite('DRAGON', 0)).toBe(
    assets.getProjectileSprite('dragon', 2 * Math.PI),
  );
  assets.setTheater('SNOW');
  expect(sources.has(assets.getProjectileSprite('dragon', 0))).toBe(false);
});

it.skipIf(!process.env.RA2_ASSET_DIR)(
  'renders all 32 supplied DRAGON frames with original unit-palette pixels and anchors',
  () => {
    const archives: MixArchive[] = [];

    const visit = (name: string, bytes: Uint8Array) => {
      const archive = new MixArchive(bytes, name);
      archives.push(archive);

      for (const nested of NESTED_MIXES) {
        const content = archive.get(nested);

        if (content) visit(nested, content);
      }
    };

    visit('ra2.mix', readFileSync(join(process.env.RA2_ASSET_DIR!, 'ra2.mix')));
    const get = (name: string) => archives.map((archive) => archive.get(name)).find(Boolean)!;

    const bytes = get('dragon.shp'),
      shp = new ShpFile(bytes),
      assets = manager(bytes, get('unittem.pal'));

    const palette = decodePalette(get('unittem.pal'));
    expect([shp.width, shp.height, shp.frameCount]).toEqual([24, 16, 32]);

    for (let index = 0; index < 32; index++) {
      const frame = shp.frame(index),
        sprite = assets.getProjectileSprite('DRAGON', ((20 - index) / 32) * Math.PI * 2)!;

      expect([sprite.anchorX, sprite.anchorY]).toEqual([12 - frame.x, 8 - frame.y]);

      const pixels = Array.from(frame.pixels).flatMap((p) =>
        p ? [...palette.slice(p * 3, p * 3 + 3), 255] : [0, 0, 0, 0],
      );

      expect(Array.from(testCanvas(sprite.source).pixels)).toEqual(pixels);
    }

    const rules = readArtSections(get('rules.ini')),
      art = readArtSections(get('art.ini'));

    expect(rules.get('fv')!.primary).toBe('HoverMissile');
    expect(rules.get('hovermissile')!.projectile).toBe('AAHeatSeeker2');
    expect(rules.get('aaheatseeker2')!.image).toBe('DRAGON');
    expect(IFV_MISSILE_SPEED).toBe((Number(rules.get('hovermissile')!.speed) * 30) / 256);
    expect(art.get('fv')!.weapon1flh.split(',').map(Number)).toEqual([
      IFV_MISSILE_FLH.forward * 256,
      IFV_MISSILE_FLH.lateral * 256,
      (IFV_MISSILE_FLH.height * 256) / 30,
    ]);
    expect(art.get('dragon')).toMatchObject({
      rotates: 'yes',
      uselinetrail: 'yes',
      linetrailcolor: '216,216,255',
      linetrailcolordecrement: '16',
    });
  },
);
