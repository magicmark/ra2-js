import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { AssetManager } from './AssetManager';
import { IFV_TURRETS, IFV_TURRET_FILES } from './IFVArtwork';
import { NESTED_MIXES, wantedFiles } from './catalog';
import { MixArchive, decodePalette, decodeVpl } from './formats';
import { readArtSections } from './NativeAnimation';
import { TestCanvas, testCanvas } from './asset-test-fixtures';

afterEach(() => vi.unstubAllGlobals());

it('selects all original passenger turret models and transforms for extraction', () => {
  for (const file of IFV_TURRET_FILES) expect(wantedFiles().has(file), file).toBe(true);
});

it.skipIf(!process.env.RA2_ASSET_DIR)(
  'matches native passenger rules and renders distinct, independently aimed and remapped IFV variants',
  () => {
    const archives: MixArchive[] = [];

    const visit = (bytes: Uint8Array) => {
      const archive = new MixArchive(bytes);
      archives.push(archive);

      for (const name of NESTED_MIXES) {
        const content = archive.get(name);

        if (content) visit(content);
      }
    };

    visit(readFileSync(join(process.env.RA2_ASSET_DIR!, 'ra2.mix')));
    const get = (name: string) => archives.map((archive) => archive.get(name)).find(Boolean)!;

    const rules = readArtSections(get('rules.ini')),
      fv = rules.get('fv')!;

    for (const [type, native] of Object.entries({
      gi: 'e1',
      conscript: 'e2',
      spy: 'spy',
      sniper: 'snipe',
      tanya: 'tany',
      engineer: 'engineer',
      chrono_legionnaire: 'cleg',
      rocketeer: 'jumpjet',
      attack_dog: 'adog',
    })) {
      const mode = rules.get(native)!.ifvmode ?? '0';

      const weapon = Object.keys(fv).find(
        (key) => key.endsWith('turretweapon') && fv[key] === mode,
      )!;

      expect(weapon, type).toBeDefined();
      expect(IFV_TURRETS[type] ?? 0, type).toBe(Number(fv[weapon.replace('weapon', 'index')]));
    }

    vi.stubGlobal('document', { createElement: () => new TestCanvas() });
    const assets = new AssetManager();
    assets.ready = true;

    const files = new Map(
      ['fv.vxl', 'fv.hva', 'fvtur.vxl', 'fvtur.hva', ...IFV_TURRET_FILES].map((name) => [
        name,
        get(name),
      ]),
    );

    Object.assign(assets, {
      files,
      unitPalette: decodePalette(get('unittem.pal')),
      voxelLighting: decodeVpl(get('voxels.vpl')),
    });

    const pixels = (sprite: ReturnType<typeof assets.getVehicleSprite>) => {
      expect(sprite).not.toBeNull();
      const data = testCanvas(sprite!.source).pixels;
      expect(data.some((value) => value > 0)).toBe(true);

      return Buffer.from(data).toString('base64');
    };

    for (const facing of [0, 8, 16, 24]) {
      const variants = [0, 1, 2, 3].map((variant) =>
        assets.getVehicleSprite('ifv', facing, facing, 0, variant),
      );

      expect(new Set(variants.map(pixels)).size).toBe(4);

      for (let variant = 0; variant < 4; variant++) {
        expect(assets.getVehicleSprite('fv', facing + 32, facing + 32, 0, variant)).toBe(
          variants[variant],
        );
        expect(pixels(assets.getVehicleSprite('ifv', facing, facing + 8, 0, variant))).not.toBe(
          pixels(variants[variant]),
        );
        expect(pixels(assets.getVehicleSprite('ifv', facing, facing, 1, variant))).not.toBe(
          pixels(variants[variant]),
        );
      }

      expect(assets.getVehicleSprite('ifv', facing, facing)).toBe(variants[0]);
    }
  },
);
