import { IFV_TURRET_FILES } from './IFVArtwork';
import { selectAudioFiles } from './AudioBank';
import { selectMusicFiles } from './MusicBank';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetManager, DIALOG_ASSET_FRAMES, HUD_ASSET_FRAMES } from './AssetManager';
import {
  CATALOG,
  DIALOG_PCX_FILES,
  DIALOG_SPRITE_FILES,
  EFFECT_ANIMATIONS,
  NESTED_MIXES,
  UI_FILES,
  UI_HASH_FILES,
  theaterNames,
  wantedFiles,
} from './catalog';
import { MixArchive, ShpFile, decodePalette } from './formats';
import { assetCache, archiveStageKey, type SavedArchive } from './AssetDownload';
import { TestCanvas, testCanvas } from './asset-test-fixtures';

interface AssetFile {
  name: string;
  bytes: Uint8Array;
}

// Existing artwork/audio plus all twelve retail paved road ends.
const CURRENT_SELECTED_FILE_COUNT = 1013;

// Fixed historical membership: deriving the old cache by subtracting only the
// previous update's additions accidentally left hundreds of future map files in it.
const PRE_NATIVE_NAMES = new Set(
  readFileSync(new URL('./fixtures/selected-art-pre-native.txt', import.meta.url), 'utf8')
    .split('\n')
    .filter((name) => name && !name.startsWith('#')),
);

let originals: AssetFile[];

let extracted: AssetFile[];

let worker: ReturnType<typeof vi.fn>;

let network: ReturnType<typeof vi.fn>;

// The real installer bytes stay external; only already-extracted local MIXes
// are read. Archive extraction itself is covered by the browser end-to-end test.
describe.skipIf(!process.env.RA2_ASSET_DIR && !process.env.RA2_SELECTED_ART)(
  'strict loader with actual original artwork',
  () => {
    beforeAll(() => {
      if (process.env.RA2_SELECTED_ART) {
        const files: unknown = JSON.parse(readFileSync(process.env.RA2_SELECTED_ART, 'utf8'));

        if (!isSelectedArtwork(files)) throw new Error('Invalid selected artwork fixture');
        originals = files.map((file) => ({
          name: file.name,
          bytes: new Uint8Array(Buffer.from(file.base64, 'base64')),
        }));

        return;
      }

      const archives: MixArchive[] = [];

      const visit = (name: string, bytes: Uint8Array) => {
        const archive = new MixArchive(bytes, name);
        archives.push(archive);

        for (const nested of NESTED_MIXES) {
          const content = archive.get(nested);

          if (content) visit(`${name}/${nested}`, content);
        }
      };

      for (const name of ['ra2.mix', 'language.mix', 'theme.mix'])
        visit(name, readFileSync(join(process.env.RA2_ASSET_DIR!, name)));
      originals = [];

      for (const name of wantedFiles()) {
        const bytes = [...archives]
          .reverse()
          .map((archive) => archive.get(name))
          .find(Boolean);

        if (bytes) originals.push({ name, bytes: bytes.slice() });
      }

      originals.push(...selectAudioFiles(archives), ...selectMusicFiles(archives));

      for (const side of [0, 1]) {
        const archive = archives.find((archive) => archive.name.endsWith(`sidec0${side + 1}.mix`))!;

        for (const name of UI_FILES) {
          const bytes = archive.get(name);

          if (bytes) originals.push({ name: `side${side}/${name}`, bytes: bytes.slice() });
        }

        for (const [name, hash] of Object.entries(UI_HASH_FILES)) {
          const entry = archive.entries.get(hash)!;
          originals.push({
            name: `side${side}/${name}`,
            bytes: archive.bytes.slice(entry.offset, entry.offset + entry.size),
          });
        }
      }
    });
    beforeEach(() => {
      extracted = originals;
      vi.stubGlobal('indexedDB', new IDBFactory());
      vi.stubGlobal('document', { createElement: () => new TestCanvas() });
      network = vi.fn(() =>
        Promise.reject(new Error('No network is authorized by this fixture test')),
      );
      vi.stubGlobal('fetch', network);
      worker = vi.fn(function () {
        const fixture: ArtworkWorker = {
          onmessage: null,
          terminate() {},
          postMessage() {
            queueMicrotask(() =>
              this.onmessage?.({
                data: { kind: 'complete', files: structuredClone(extracted), archives: [] },
              }),
            );
          },
        };

        return fixture;
      });
      vi.stubGlobal('Worker', worker);
    });
    afterEach(() => vi.unstubAllGlobals());

    it('validates every required original and reopens its cache without network or extraction', async () => {
      expect(originals).toHaveLength(CURRENT_SELECTED_FILE_COUNT);
      const manager = new AssetManager();
      await manager.importFiles([new File(['local MIX fixture'], 'ra2.mix')]);
      expect(manager.error).toBeNull();
      expect(manager.status.phase).toBe('ready');

      for (const name of Object.keys(CATALOG)) {
        expect(manager.getSprite(name), name).not.toBeNull();
        expect(manager.getCameo(name), name).not.toBeNull();
      }

      for (const [name, frames] of Object.entries(HUD_ASSET_FRAMES))
        for (const frame of frames)
          expect(manager.getUIAsset(name, frame), `${name} ${frame}`).not.toBeNull();
      expect(manager.getInfantryFrame('gi', 292)).not.toBeNull();
      expect(manager.getInfantryFrame('gi', 362)).not.toBeNull();
      expect(manager.getInfantryFrame('gi', 292)).not.toBe(manager.getInfantryFrame('gi', 348));
      expect(manager.getInfantryFrame('gi', 10000)).toBeNull();
      expect(manager.getVehicleSprite('grizzly', 0, 8)).not.toBeNull();
      expect(manager.getVehicleSprite('grizzly', 32, 40)).toBe(
        manager.getVehicleSprite('grizzly', 0, 8),
      );
      expect(manager.getSprite('miner', -4)).toBe(manager.getSprite('miner', 28));
      expect(manager.getSprite('sentry', -36)).toBe(manager.getSprite('sentry', 28));
      const reopened = new AssetManager();
      expect(await reopened.initialize()).toBe('ready');
      expect(reopened.cacheWarning).toBeNull();
      expect(network).not.toHaveBeenCalled();
      expect(worker).toHaveBeenCalledTimes(1);
    }, 60_000);

    it('renders the authored infantry phases, every impact frame, and native dialog pixels', async () => {
      const manager = new AssetManager();
      await manager.importFiles([new File(['fixture'], 'ra2.mix')]);
      expect(manager.ready, manager.error ?? '').toBe(true);
      expect(manager.getInfantrySequence('gi', 'Deploy', 7, 14 / 30)).toBe(
        manager.getInfantryFrame('gi', 314),
      );
      expect(manager.getInfantrySequence('gi', 'FireUp', 3, 1 / 30)).toBe(
        manager.getInfantryFrame('gi', 183),
      );
      expect(manager.getInfantrySequence('rock', 'Hover', 0, 2 / 30, 0, 2)).toBe(
        manager.getInfantryFrame('rock', 292),
      );
      expect(manager.getInfantrySequence('rock', 'Hover', 0, 2 / 30, 0, 6)).toBe(
        manager.getInfantryFrame('rock', 294),
      );
      const definitions = manager.getAnimationDefinitions();
      const palette = decodePalette(originals.find((file) => file.name === 'anim.pal')!.bytes);

      for (const name of EFFECT_ANIMATIONS) {
        const shp = new ShpFile(originals.find((file) => file.name === `${name}.shp`)!.bytes);
        expect(definitions[name].frames, name).toBe(shp.frameCount);

        for (let index = 0; index < shp.frameCount; index++) {
          const art = manager.getAnimationSprite(name, index / 30, 1)!,
            frame = shp.frame(index);

          expect(art, `${name} frame ${index}`).not.toBeNull();
          const colorIndex = frame.pixels.findIndex((pixel) => pixel > 0);

          if (colorIndex >= 0) {
            const rgb = palette.subarray(
              frame.pixels[colorIndex] * 3,
              frame.pixels[colorIndex] * 3 + 3,
            );

            expect(
              Array.from(
                testCanvas(art.source).pixels.subarray(colorIndex * 4, colorIndex * 4 + 4),
              ),
            ).toEqual([...rgb, 255]);
          }
        }
      }

      expect(manager.getAnimationOpacity('htrkpuff')).toBe(0.5);

      for (const [name, frames] of Object.entries(DIALOG_ASSET_FRAMES))
        for (const frame of frames)
          expect(manager.getDialogAsset(name, frame), `${name} ${frame}`).not.toBeNull();
      const background = manager.getDialogAsset('options-medium')!;
      expect([background.width, background.height]).toEqual([632, 568]);
      const check = manager.getDialogAsset('options-checkbox-on')!;
      expect([check.width, check.height]).toEqual([18, 18]);
      expect(Array.from(testCanvas(check.source).pixels.subarray(0, 4))).toEqual([255, 0, 0, 255]);
    }, 60_000);

    it.each([
      { cache: 'pre-dialog', expectedFiles: 242, nativeMaps: false },
      { cache: 'pre-native maps', expectedFiles: 265, nativeMaps: true },
    ])(
      'upgrades the $cache cache locally without discarding archive generations',
      async ({ expectedFiles, nativeMaps }) => {
        await new AssetManager().importFiles([new File(['fixture'], 'ra2.mix')]);

        const source = '/asset-source',
          previous = await assetCache<any>(source);

        const added = new Set([
          'anim.pal',
          ...EFFECT_ANIMATIONS.map((name) => `${name}.shp`),
          ...Object.values(DIALOG_PCX_FILES),
          ...[0, 1].flatMap((side) => [
            `side${side}/uibkgd.pal`,
            ...DIALOG_SPRITE_FILES.map((name) => `side${side}/${name}.shp`),
          ]),
        ]);

        expect(PRE_NATIVE_NAMES.size).toBe(265);

        const oldFiles = previous.files.filter(
          (file: AssetFile) =>
            PRE_NATIVE_NAMES.has(file.name) && (nativeMaps || !added.has(file.name)),
        );

        expect(oldFiles).toHaveLength(expectedFiles);
        expect(oldFiles.some((file: AssetFile) => file.name === 'snow.pal')).toBe(false);
        expect(oldFiles.some((file: AssetFile) => /oild|airp/.test(file.name))).toBe(false);
        await assetCache(source, { ...previous, files: oldFiles });
        const key = archiveStageKey(source, 'mix');

        const saved: SavedArchive = {
          version: 1,
          id: 'existing-original-MIX-generation',
          saved: 123,
          files: [
            { name: 'ra2.mix', blob: new Blob(['actual-original-selection-worker-fixture']) },
          ],
        };

        await assetCache(key, saved);
        worker.mockClear();
        network.mockClear();

        // Old gameplay remains usable. A saved MIX can now supply optional
        // indicators/idle art and the new theaters in one local selection.
        if (nativeMaps) {
          expect(await new AssetManager().initialize()).toBe('ready');
          expect(worker).toHaveBeenCalledOnce();
        }

        const recovered = new AssetManager();
        expect(await recovered.initialize({ nativeMaps })).toBe('ready');
        expect(network).not.toHaveBeenCalled();
        expect(worker).toHaveBeenCalledOnce();
        const retained = (await assetCache<SavedArchive>(key))!;
        expect({
          id: retained.id,
          version: retained.version,
          saved: retained.saved,
          rejected: retained.rejected,
        }).toEqual({
          id: saved.id,
          version: saved.version,
          saved: saved.saved,
          rejected: undefined,
        });
        expect(retained.files.map((file) => file.name)).toEqual(
          saved.files.map((file) => file.name),
        );
        expect(await retained.files[0].blob.text()).toBe(await saved.files[0].blob.text());
        const upgraded = (await assetCache<{ files: AssetFile[] }>(source))!.files;
        expect(upgraded).toHaveLength(CURRENT_SELECTED_FILE_COUNT);
        expect(upgraded.map((file) => file.name).sort()).toEqual(
          originals.map((file) => file.name).sort(),
        );

        if (nativeMaps) {
          for (const theater of ['TEMPERATE', 'SNOW', 'URBAN'] as const) {
            expect(recovered.getNativeTerrain(theater, 0, 0), theater).not.toBeNull();
            expect(recovered.getNativeStructure(theater, 'CAOILD'), theater).not.toBeNull();
            expect(recovered.getNativeStructure(theater, 'CAAIRP'), theater).not.toBeNull();
          }
        }

        expect(await new AssetManager().initialize({ nativeMaps })).toBe('ready');
        expect(network).not.toHaveBeenCalled();
        expect(worker).toHaveBeenCalledOnce();
      },
      60_000,
    );

    it('upgrades missing IFV passenger turrets from saved MIX files and reuses the upgraded cache', async () => {
      await new AssetManager().importFiles([new File(['fixture'], 'ra2.mix')]);

      const source = '/asset-source',
        previous = await assetCache<any>(source);

      await assetCache(source, {
        ...previous,
        files: previous.files.filter((file: AssetFile) => !IFV_TURRET_FILES.includes(file.name)),
      });
      await assetCache(archiveStageKey(source, 'mix'), {
        version: 1,
        id: 'saved-mixes',
        saved: 123,
        files: [{ name: 'ra2.mix', blob: new Blob(['local fixture']) }],
      } satisfies SavedArchive);
      worker.mockClear();
      network.mockClear();
      const manager = new AssetManager();
      expect(await manager.initialize()).toBe('ready');
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
      expect(
        new Set([0, 1, 2, 3].map((variant) => manager.getVehicleSprite('ifv', 0, 0, 0, variant)))
          .size,
      ).toBe(4);
      expect((await assetCache<{ files: AssetFile[] }>(source))!.files).toHaveLength(
        CURRENT_SELECTED_FILE_COUNT,
      );
      expect(await new AssetManager().initialize()).toBe('ready');
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
    }, 60_000);

    it('upgrades road ends from saved MIXes and renders every original theater subtile', async () => {
      await new AssetManager().importFiles([new File(['fixture'], 'ra2.mix')]);

      const source = '/asset-source',
        previous = await assetCache<any>(source);

      await assetCache(source, {
        ...previous,
        files: previous.files.filter((file: AssetFile) => !file.name.startsWith('p_end')),
      });
      await assetCache(archiveStageKey(source, 'mix'), {
        version: 1,
        id: 'saved-mixes',
        saved: 123,
        files: [{ name: 'ra2.mix', blob: new Blob(['local fixture']) }],
      } satisfies SavedArchive);
      worker.mockClear();
      network.mockClear();
      const manager = new AssetManager();
      expect(await manager.initialize()).toBe('ready');

      for (const theater of ['TEMPERATE', 'SNOW', 'URBAN'] as const)
        for (let end = 0; end < 4; end++) {
          const tileIndex = (theater === 'SNOW' ? 430 : 445) + end;

          for (let subTile = 0; subTile < 3; subTile++) {
            const sprite = manager.getNativeTerrain(theater, tileIndex, subTile)!;
            expect(sprite).not.toBeNull();
            expect(testCanvas(sprite.source).pixels.some((v, i) => i % 4 === 3 && v > 0)).toBe(
              true,
            );

            if (theater === 'TEMPERATE') {
              const training = manager.getTerrain(`p_end0${end + 1}`, subTile)!;
              expect(testCanvas(training.source).pixels).toEqual(testCanvas(sprite.source).pixels);
            }
          }

          expect(() => manager.getNativeTerrain(theater, tileIndex, 3)).toThrow(
            /Invalid native subtile/,
          );
        }

      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
      expect(await new AssetManager().initialize()).toBe('ready');
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
    }, 60_000);

    it('restores original miner warp effects from saved MIX files without downloading again', async () => {
      await new AssetManager().importFiles([new File(['fixture'], 'ra2.mix')]);

      const source = '/asset-source',
        previous = await assetCache<any>(source);

      await assetCache(source, {
        ...previous,
        files: previous.files.filter(
          (file: AssetFile) => !['warpin.shp', 'warpout.shp'].includes(file.name),
        ),
      });
      await assetCache(archiveStageKey(source, 'mix'), {
        version: 1,
        id: 'saved-mixes',
        saved: 123,
        files: [{ name: 'ra2.mix', blob: new Blob(['local fixture']) }],
      } satisfies SavedArchive);
      worker.mockClear();
      network.mockClear();
      const manager = new AssetManager();
      expect(await manager.initialize()).toBe('ready');
      expect(manager.getAnimationDefinitions()).toMatchObject({
        warpin: { frames: 10, ticksPerFrame: 7 },
        warpout: { frames: 21, ticksPerFrame: 7 },
      });
      expect(manager.getAnimationSprite('WARPIN', 0)).not.toBeNull();
      expect(manager.getAnimationSprite('WARPOUT', 0)).not.toBeNull();
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
      expect(await new AssetManager().initialize()).toBe('ready');
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
    }, 60_000);

    it('upgrades missing Sniper selection voices from saved MIX files and reuses the upgraded cache', async () => {
      await new AssetManager().importFiles([new File(['fixture'], 'ra2.mix')]);

      const source = '/asset-source',
        previous = await assetCache<any>(source);

      const files = previous.files.filter(
        (file: AssetFile) => !/^audio\/isnise[a-d]\.wav$/.test(file.name),
      );

      expect(files).toHaveLength(CURRENT_SELECTED_FILE_COUNT - 4);
      await assetCache(source, { ...previous, files });
      await assetCache(archiveStageKey(source, 'mix'), {
        version: 1,
        id: 'saved-mixes',
        saved: 123,
        files: [{ name: 'ra2.mix', blob: new Blob(['local fixture']) }],
      } satisfies SavedArchive);
      worker.mockClear();
      network.mockClear();
      const manager = new AssetManager();
      expect(await manager.initialize()).toBe('ready');
      expect(manager.getSounds()?.get('SniperSelect')?.samples).toHaveLength(4);
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
      expect((await assetCache<SavedArchive>(archiveStageKey(source, 'mix')))?.id).toBe(
        'saved-mixes',
      );
      expect((await assetCache<{ files: AssetFile[] }>(source))!.files).toHaveLength(
        CURRENT_SELECTED_FILE_COUNT,
      );
      expect(await new AssetManager().initialize()).toBe('ready');
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
    }, 60_000);

    it('adds missing urban sale sprites from the saved archive without another download', async () => {
      await new AssetManager().importFiles([new File(['fixture'], 'ra2.mix')]);

      const source = '/asset-source',
        previous = await assetCache<any>(source);

      const files = previous.files.filter((file: AssetFile) => !/^[gn]u.*mk\.shp$/.test(file.name));
      expect(files.length).toBeLessThan(CURRENT_SELECTED_FILE_COUNT);
      await assetCache(source, { ...previous, files });
      await assetCache(archiveStageKey(source, 'mix'), {
        version: 1,
        id: 'saved-mixes',
        saved: 123,
        files: [{ name: 'ra2.mix', blob: new Blob(['local fixture']) }],
      } satisfies SavedArchive);
      worker.mockClear();
      network.mockClear();
      const manager = new AssetManager();
      expect(await manager.initialize({ nativeMaps: true })).toBe('ready');
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
      expect((await assetCache<{ files: AssetFile[] }>(source))!.files).toHaveLength(
        CURRENT_SELECTED_FILE_COUNT,
      );
      manager.setTheater('URBAN');

      for (const [name, spec] of Object.entries(CATALOG).filter(
        ([, spec]) => spec.kind === 'building',
      )) {
        expect(
          manager.getBuildingSellSprite(name, 0.5, spec.sprite.startsWith('n') ? 1 : 0),
          name,
        ).not.toBeNull();
      }

      expect(await new AssetManager().initialize({ nativeMaps: true })).toBe('ready');
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
    }, 60_000);

    it('upgrades an earlier tech roster from saved MIX files without a network request', async () => {
      await new AssetManager().importFiles([new File(['fixture'], 'ra2.mix')]);

      const source = '/asset-source',
        previous = await assetCache<any>(source);

      await assetCache(source, {
        ...previous,
        files: previous.files.filter(
          (file: AssetFile) => file.name !== 'ggtech.shp' && file.name !== 'snipe.shp',
        ),
      });
      await assetCache(archiveStageKey(source, 'mix'), {
        version: 1,
        id: 'saved-mixes',
        saved: 123,
        files: [{ name: 'ra2.mix', blob: new Blob(['local fixture']) }],
      } satisfies SavedArchive);
      worker.mockClear();
      network.mockClear();
      const manager = new AssetManager();
      expect(await manager.initialize()).toBe('ready');
      expect(manager.getBuildingSprite('battlelab')).not.toBeNull();
      expect(manager.getInfantrySequence('sniper', 'Walk', 0, 0.3)).not.toBeNull();
      expect(worker).toHaveBeenCalledOnce();
      expect(network).not.toHaveBeenCalled();
    }, 60_000);

    it.each(['foundation', 'turret', 'animation'] as const)(
      'rejects missing authored %s files even though the base models exist',
      async (kind) => {
        const name =
          kind === 'foundation'
            ? CATALOG.warfactory.bib!
            : kind === 'turret'
              ? CATALOG.sentry.turret!
              : CATALOG.power_soviet.overlays![0];

        const candidates =
          kind === 'turret'
            ? [`${name}.vxl`]
            : theaterNames(name).flatMap((alias) => [`${alias}.shp`, `${alias}.tem`]);

        extracted = originals.filter((file) => !candidates.includes(file.name));
        expect(extracted.length).toBeLessThan(originals.length);
        const manager = new AssetManager();
        await manager.importFiles([new File(['fixture'], 'ra2.mix')]);
        expect(manager.ready).toBe(false);
        expect(manager.error).toContain(name);
        // Keep imported archive bytes available for a corrected catalog;
        // incomplete selected artwork stays invalid and cannot start the game.
        const reopened = new AssetManager();
        expect(await reopened.initialize()).toBe('invalid');
        expect(reopened.ready).toBe(false);
        expect(reopened.status.phase).toBe('awaiting-source');
        expect(network).not.toHaveBeenCalled();
      },
      60_000,
    );
  },
);

interface ArtworkWorker {
  onmessage:
    | ((event: { data: { kind: 'complete'; files: AssetFile[]; archives: [] } }) => void)
    | null;
  terminate(): void;
  postMessage(): void;
}

interface SelectedArtwork {
  name: string;
  base64: string;
}

function isSelectedFile(value: unknown): value is SelectedArtwork {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof value.name === 'string' &&
    'base64' in value &&
    typeof value.base64 === 'string'
  );
}

function isSelectedArtwork(value: unknown): value is SelectedArtwork[] {
  return Array.isArray(value) && value.every(isSelectedFile);
}
