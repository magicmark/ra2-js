import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetManager, HUD_ASSET_FRAMES } from './AssetManager';
import { CATALOG, NESTED_MIXES, UI_FILES, UI_HASH_FILES, theaterNames, wantedFiles } from './catalog';
import { MixArchive } from './formats';
import { TestCanvas } from './asset-test-fixtures';

interface AssetFile { name: string; bytes: Uint8Array }
let originals: AssetFile[];
let extracted: AssetFile[];
let worker: ReturnType<typeof vi.fn>;
let network: ReturnType<typeof vi.fn>;

// The real installer bytes stay external; only already-extracted local MIXes
// are read. Archive extraction itself is covered by the browser end-to-end test.
describe.skipIf(!process.env.RA2_ASSET_DIR)('strict loader with actual original artwork', () => {
  beforeAll(() => {
    const archives: MixArchive[] = [];
    const visit = (name: string, bytes: Uint8Array) => {
      const archive = new MixArchive(bytes, name); archives.push(archive);
      for (const nested of NESTED_MIXES) { const content = archive.get(nested); if (content) visit(`${name}/${nested}`, content); }
    };
    for (const name of ['ra2.mix', 'language.mix']) visit(name, readFileSync(join(process.env.RA2_ASSET_DIR!, name)));
    originals = [];
    for (const name of wantedFiles()) {
      const bytes = [...archives].reverse().map(archive => archive.get(name)).find(Boolean);
      if (bytes) originals.push({ name, bytes: bytes.slice() });
    }
    for (const side of [0, 1]) {
      const archive = archives.find(archive => archive.name.endsWith(`sidec0${side + 1}.mix`))!;
      for (const name of UI_FILES) { const bytes = archive.get(name); if (bytes) originals.push({ name: `side${side}/${name}`, bytes: bytes.slice() }); }
      for (const [name, hash] of Object.entries(UI_HASH_FILES)) {
        const entry = archive.entries.get(hash)!;
        originals.push({ name: `side${side}/${name}`, bytes: archive.bytes.slice(entry.offset, entry.offset + entry.size) });
      }
    }
  });
  beforeEach(() => {
    extracted = originals;
    vi.stubGlobal('indexedDB', new IDBFactory());
    vi.stubGlobal('document', { createElement: () => new TestCanvas() });
    network = vi.fn(() => Promise.reject(new Error('No network is authorized by this fixture test')));
    vi.stubGlobal('fetch', network);
    worker = vi.fn(function () {
      return {
        onmessage: null as ((event: { data: unknown }) => void) | null,
        terminate() {},
        postMessage() { queueMicrotask(() => this.onmessage?.({ data: { kind: 'complete', files: structuredClone(extracted), archives: [] } })); },
      };
    });
    vi.stubGlobal('Worker', worker);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('validates every required original and reopens its cache without network or extraction', async () => {
    expect(originals.length).toBeGreaterThanOrEqual(240);
    const manager = new AssetManager();
    await manager.importFiles([new File(['local MIX fixture'], 'ra2.mix')]);
    expect(manager.error).toBeNull(); expect(manager.status.phase).toBe('ready');
    for (const name of Object.keys(CATALOG)) { expect(manager.getSprite(name), name).not.toBeNull(); expect(manager.getCameo(name), name).not.toBeNull(); }
    for (const [name, frames] of Object.entries(HUD_ASSET_FRAMES)) for (const frame of frames) expect(manager.getUIAsset(name, frame), `${name} ${frame}`).not.toBeNull();
    expect(manager.getInfantryFrame('gi', 292)).not.toBeNull();
    expect(manager.getInfantryFrame('gi', 362)).not.toBeNull();
    expect(manager.getInfantryFrame('gi', 292)).not.toBe(manager.getInfantryFrame('gi', 348));
    expect(manager.getInfantryFrame('gi', 10000)).toBeNull();
    expect(manager.getVehicleSprite('grizzly', 0, 8)).not.toBeNull();
    expect(manager.getVehicleSprite('grizzly', 32, 40)).toBe(manager.getVehicleSprite('grizzly', 0, 8));
    expect(manager.getSprite('miner', -4)).toBe(manager.getSprite('miner', 28));
    expect(manager.getSprite('sentry', -36)).toBe(manager.getSprite('sentry', 28));
    const reopened = new AssetManager();
    expect(await reopened.initialize()).toBe('ready'); expect(reopened.cacheWarning).toBeNull();
    expect(network).not.toHaveBeenCalled(); expect(worker).toHaveBeenCalledTimes(1);
  }, 60_000);

  it.each(['foundation', 'turret', 'animation'] as const)('rejects missing authored %s files even though the base models exist', async kind => {
    const name = kind === 'foundation' ? CATALOG.warfactory.bib! : kind === 'turret' ? CATALOG.sentry.turret! : CATALOG.power_soviet.overlays![0];
    const candidates = kind === 'turret' ? [`${name}.vxl`] : theaterNames(name).flatMap(alias => [`${alias}.shp`, `${alias}.tem`]);
    extracted = originals.filter(file => !candidates.includes(file.name));
    expect(extracted.length).toBeLessThan(originals.length);
    const manager = new AssetManager(); await manager.importFiles([new File(['fixture'], 'ra2.mix')]);
    expect(manager.ready).toBe(false); expect(manager.error).toContain(name);
    // Keep imported archive bytes available for a corrected catalog;
    // incomplete selected artwork stays invalid and cannot start the game.
    const reopened = new AssetManager();
    expect(await reopened.initialize()).toBe('invalid'); expect(reopened.ready).toBe(false);
    expect(reopened.status.phase).toBe('awaiting-source'); expect(network).not.toHaveBeenCalled();
  }, 60_000);
});
