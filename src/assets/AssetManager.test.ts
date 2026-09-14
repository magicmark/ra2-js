import { IDBFactory, IDBObjectStore, IDBDatabase } from 'fake-indexeddb';
import { Buffer } from 'node:buffer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetManager, DEFAULT_ASSET_URL, ORIGINAL_ASSET_URL, assetCacheKey, assetSourceUrl, HUD_ASSET_FRAMES, REQUIRED_TERRAIN } from './AssetManager';

import { assetCache, archiveStageKey, LEGACY_ASSET_URL, type SavedArchive } from './AssetDownload';
import { TestCanvas, testShape, testFont, testCursorShape, testPcx } from './asset-test-fixtures';
import { DIALOG_PCX_FILES, DIALOG_SHAPE_FILES, EFFECT_ANIMATIONS } from './catalog';

// Keep the persistence tests small while exercising real palette/SHP/TMP
// decoding. The browser audit also checks the full catalog with original art.
vi.mock('./catalog', async importOriginal => ({
  ...await importOriginal<typeof import('./catalog')>(),
  CATALOG: { gi: { sprite: 'gi', cameo: 'giicon', kind: 'infantry' } },
  theaterNames: (name: string) => [name],
}));

interface AssetFile { name: string; bytes: Uint8Array }
interface Entry { version: number; files: AssetFile[]; saved: number }
function expectFiles(actual: AssetFile[] | undefined, expected: AssetFile[]) {
  expect(actual?.map(file => file.name)).toEqual(expected.map(file => file.name));
  expected.forEach((file, index) => expect(Buffer.from(actual![index].bytes).equals(Buffer.from(file.bytes)), file.name).toBe(true));
}
function expectEntry(actual: Entry | undefined, expected: Entry | undefined) {
  expect(actual).toBeDefined(); expect(expected).toBeDefined();
  expect({ version: actual!.version, saved: actual!.saved }).toEqual({ version: expected!.version, saved: expected!.saved });
  expectFiles(actual!.files, expected!.files);
}
function files(): AssetFile[] {
  const tile = new Uint8Array(972), tmp = new DataView(tile.buffer);
  [1, 1, 60, 30, 20].forEach((n, i) => tmp.setUint32(i * 4, n, true)); tile.fill(10, 72);
  const palette = new Uint8Array(768); palette.set([63, 31, 7], 30);
  const vpl = new Uint8Array(784 + 8192); new DataView(vpl.buffer).setUint32(8, 32, true);
  for (let i = 784; i < vpl.length; i++) vpl[i] = (i - 784) % 256;
  return [
    ...['palette.pal', 'unittem.pal', 'cameo.pal', 'isotem.pal', 'temperat.pal', 'anim.pal', 'side0/sidebar.pal', 'side0/uibkgd.pal'].map(name => ({ name, bytes: palette.slice() })),
    { name: 'art.ini', bytes: new TextEncoder().encode('[gi]\nCameo=giicon\nSequence=GISequence\nFireUp=2\n[GISequence]\nReady=0,1,1\nWalk=8,6,6\nFireUp=164,6,6\nDeploy=300,15,0\nDeployed=292,1,1\nDeployedFire=315,6,6\nUndeploy=276,2,2') },
    { name: 'game.fnt', bytes: testFont() },
    { name: 'oregath.shp', bytes: testShape(120) }, { name: 'pips.shp', bytes: testShape(19) }, { name: 'pips2.shp', bytes: testShape(18) },
    { name: 'tibtre01.tem', bytes: testShape(60) }, { name: 'tree20.tem', bytes: testShape(2) }, { name: 'plat02.tem', bytes: tile.slice() }, { name: 'gapowrmk.shp', bytes: testShape(20) },
    { name: 'mouse.shp', bytes: testCursorShape() }, { name: 'mousepal.pal', bytes: palette.slice() },
    { name: 'voxels.vpl', bytes: vpl }, { name: 'gi.shp', bytes: testShape(756) }, { name: 'giicon.shp', bytes: testShape() },
    ...Array.from({ length: 6 }, (_, i) => ({ name: `tib${String(i + 1).padStart(2, '0')}.tem`, bytes: testShape(9) })),
    ...Array.from({ length: 8 }, (_, i) => ({ name: `tree${String(i + 1).padStart(2, '0')}.tem`, bytes: testShape(2) })),
    ...REQUIRED_TERRAIN.map(name => ({ name: `${name}.tem`, bytes: tile.slice() })),
    ...Object.entries(HUD_ASSET_FRAMES).map(([name, frames]) => ({ name: `side0/${name}.shp`, bytes: testShape(Math.max(...frames) + 1) })),
    ...DIALOG_SHAPE_FILES.map(name => ({ name: `side0/${name}.shp`, bytes: testShape(name === 'sidebttn' ? 3 : 1) })),
    ...Object.values(DIALOG_PCX_FILES).map(name => ({ name, bytes: testPcx() })),
    ...EFFECT_ANIMATIONS.map(name => ({ name: `${name}.shp`, bytes: testShape(12) })),
  ];
}
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('red-alert-command-assets', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('assets');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function entry(key = assetCacheKey(DEFAULT_ASSET_URL), value?: Entry): Promise<Entry | undefined> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('assets', value ? 'readwrite' : 'readonly');
    const request = value ? transaction.objectStore('assets').put(value, key) : transaction.objectStore('assets').get(key);
    transaction.oncomplete = () => { db.close(); resolve(value ? value : request.result); };
    transaction.onabort = () => { db.close(); reject(transaction.error); };
  });
}
function pixels(manager: AssetManager): number[] {
  const sprite = manager.getSprite('gi');
  expect(sprite).not.toBeNull();
  return Array.from((sprite!.source as unknown as TestCanvas).pixels);
}

let extracted: AssetFile[];
let workerFailure: string | undefined;
let workerInvalid = false;
let workerMixThenFailure = false;
let workerInputs: { files: { name: string; blob: Blob }[] }[];
let download: ReturnType<typeof vi.fn>;
let makeWorker: ReturnType<typeof vi.fn>;
beforeEach(() => {
  extracted = files(); workerFailure = undefined; workerInvalid = false; workerMixThenFailure = false; workerInputs = [];
  vi.stubGlobal('indexedDB', new IDBFactory());
  vi.stubGlobal('document', { createElement: () => new TestCanvas() });
  download = vi.fn(async () => new Response(new Uint8Array([77, 90, 0, 0]), { status: 200 }));
  vi.stubGlobal('fetch', download);
  makeWorker = vi.fn(function () {
    return {
      onmessage: null as ((event: { data: unknown }) => void) | null,
      onerror: null,
      terminated: false,
      terminate() { this.terminated = true; },
      postMessage(input: { files: { name: string; blob: Blob }[]; includeMixStage?: boolean }) {
        workerInputs.push(input);
        queueMicrotask(() => {
          if (this.terminated) return;
          if ((!workerFailure || workerMixThenFailure) && input.includeMixStage !== false) this.onmessage?.({ data: { kind: 'mix', files: [{ name: 'ra2.mix', blob: new Blob(['validated MIX fixture']) }] } });
          this.onmessage?.({ data: workerFailure
            ? { kind: 'error', message: workerFailure, invalidArchive: workerInvalid }
            : { kind: 'complete', files: structuredClone(extracted), archives: [] } });
        });
      },
    };
  });
  vi.stubGlobal('Worker', makeWorker);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('durable extracted asset cache', () => {
  it('continues immediately with already validated same-source artwork without re-reading storage or decoding', async () => {
    const manager = new AssetManager(); await manager.download();
    const sprite = manager.getSprite('gi'), font = manager.getFont(), phases: string[] = [];
    download.mockClear(); makeWorker.mockClear();
    const open = vi.spyOn(indexedDB, 'open').mockImplementation(() => { throw new Error('Storage must not be read by cached Continue'); });
    await manager.download({ url: ORIGINAL_ASSET_URL, onProgress: p => phases.push(p.phase) });
    expect(phases).toEqual(['ready']); expect(manager.ready).toBe(true);
    expect(manager.getSprite('gi')).toBe(sprite); expect(manager.getFont()).toBe(font);
    expect(open).not.toHaveBeenCalled(); expect(download).not.toHaveBeenCalled(); expect(makeWorker).not.toHaveBeenCalled();
  });

  it('starts the 126-file artwork-only legacy cache without fonts or new optional art, archives, or a download', async () => {
    const optional = new Set(['game.fnt', 'mouse.shp', 'mousepal.pal', 'palette.pal', 'pips.shp', 'pips2.shp', 'oregath.shp', 'anim.pal', 'side0/uibkgd.pal',
      ...DIALOG_SHAPE_FILES.map(name => `side0/${name}.shp`), ...Object.values(DIALOG_PCX_FILES), ...EFFECT_ANIMATIONS.map(name => `${name}.shp`)]);
    const savedFiles = files().filter(file => !optional.has(file.name));
    while (savedFiles.length < 126) savedFiles.push({ name: `legacy-extra-${savedFiles.length}.bin`, bytes: new Uint8Array([1]) });
    const legacy = { version: 5, files: savedFiles, saved: 1 };
    await entry('/asset-source', legacy);
    const manager = new AssetManager(); expect(await manager.initialize()).toBe('ready');
    expect(legacy.files).toHaveLength(126);
    expect(manager.status.phase).toBe('ready'); expect(manager.ready).toBe(true);
    expect(manager.getFont()).toBeNull(); expect(manager.getCursors()).toBeNull();
    expect(manager.getPipSprite('veteran')).toBeNull(); expect(manager.getHarvestSprite(0, 0)).toBeNull();
    expect(manager.getDialogAsset('options-small')).toBeNull(); expect(manager.getAnimationSprite('piffpiff', 0)).toBeNull();
    expect(manager.getSprite('gi')).not.toBeNull(); expect(manager.getTerrain('grass')).not.toBeNull();
    expectEntry(await entry(), legacy);
    expect(download).not.toHaveBeenCalled(); expect(makeWorker).not.toHaveBeenCalled();
  });

  it('keeps usable legacy artwork when a cached-archive enhancement fails', async () => {
    await new AssetManager().download();
    const saved = (await entry())!, legacy = { ...saved, files: saved.files.filter(file => !['game.fnt', 'oregath.shp'].includes(file.name)) };
    await entry('/asset-source', legacy); workerFailure = 'Transient extraction failure';
    download.mockClear(); makeWorker.mockClear();
    const reopened = new AssetManager(); expect(await reopened.initialize()).toBe('ready');
    expect(reopened.ready).toBe(true); expect(reopened.getFont()).toBeNull(); expect(reopened.getSprite('gi')).not.toBeNull();
    expectEntry(await entry(), legacy); expect(download).not.toHaveBeenCalled(); expect(makeWorker).toHaveBeenCalledOnce();
  });

  it('does not repeatedly extract an archive that lacks the same optional artwork, but retries a newly missing enhancement', async () => {
    extracted = files().filter(file => file.name !== 'oregath.shp');
    await new AssetManager().download();
    expect(await new AssetManager().initialize()).toBe('ready');
    expect(await new AssetManager().initialize()).toBe('ready');
    expect(makeWorker).toHaveBeenCalledOnce(); expect(download).toHaveBeenCalledOnce();
    const saved = (await entry())!;
    await entry('/asset-source', { ...saved, files: saved.files.filter(file => file.name !== 'game.fnt') });
    const repaired = new AssetManager(); expect(await repaired.initialize()).toBe('ready'); expect(repaired.getFont()).not.toBeNull();
    expect(await new AssetManager().initialize()).toBe('ready');
    expect(makeWorker).toHaveBeenCalledTimes(2); expect(download).toHaveBeenCalledOnce();
  });

  it('resumes a completed download after a transient worker failure and a fresh page without another request', async () => {
    workerFailure = 'Worker could not allocate memory';
    await new AssetManager().download();
    const candidate = await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'download'));
    expect(candidate?.files[0].blob.size).toBe(4); expect(candidate?.rejected).toBeUndefined();
    expect(await entry()).toBeUndefined();
    workerFailure = undefined;
    const reopened = new AssetManager();
    expect(await reopened.initialize()).toBe('ready');
    expect(download).toHaveBeenCalledTimes(1); expect(workerInputs[1].files[0].name).toMatch(/\.exe$/);
    expect(await assetCache(archiveStageKey('/asset-source', 'installer'))).toBeDefined();
    expect(await assetCache(archiveStageKey('/asset-source', 'download'))).toBeUndefined();
  });

  it('resumes saved MIX inputs after interrupted selection without rerunning installer extraction', async () => {
    workerFailure = 'Worker stopped while selecting files'; workerMixThenFailure = true;
    await new AssetManager().download();
    expect(await assetCache(archiveStageKey('/asset-source', 'mix-pending'))).toBeDefined();
    workerFailure = undefined; workerMixThenFailure = false;
    expect(await new AssetManager().initialize()).toBe('ready');
    expect(download).toHaveBeenCalledTimes(1); expect(workerInputs[1].files[0].name).toBe('ra2.mix');
  });

  it.each(['missing', 'corrupt'])('does not poison verified archives after a %s artwork selection failure', async failure => {
    await new AssetManager().download();
    const saved = (await entry())!, mix = await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'mix'));
    const installer = await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'installer'));
    await entry('/asset-source', { ...saved, files: saved.files.filter(file => file.name !== 'gi.shp') });
    extracted = failure === 'missing' ? files().filter(file => file.name !== 'gi.shp')
      : files().map(file => file.name === 'gi.shp' ? { ...file, bytes: new Uint8Array(3) } : file);
    const failed = new AssetManager();
    expect(await failed.initialize()).toBe('invalid'); expect(failed.ready).toBe(false);
    expect(failed.status.phase).toBe('awaiting-source');
    expect((await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'mix')))?.rejected).toBeUndefined();
    expect((await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'installer')))?.rejected).toBeUndefined();
    extracted = files();
    expect(await new AssetManager().initialize()).toBe('ready');
    expect(download).toHaveBeenCalledTimes(1);
    expect(workerInputs.slice(1).every(input => input.files.every(file => /\.mix$/i.test(file.name)))).toBe(true);
    expect((await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'mix')))?.id).toBe(mix?.id);
    expect((await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'installer')))?.id).toBe(installer?.id);
  });

  it.each(['Missing original asset: game.fnt.', 'Invalid original sprite gi: Invalid TS SHP header', 'Invalid original asset voxels.vpl: invalid table', 'Cannot render original sprite: gi'])('recovers pre-existing rejected archive stages after %s without fetching again', async rejected => {
    await new AssetManager().download(); const saved = (await entry())!;
    await entry('/asset-source', { ...saved, files: saved.files.filter(file => file.name !== 'game.fnt') });
    for (const stage of ['mix', 'installer'] as const) {
      const key=archiveStageKey('/asset-source', stage), archive=(await assetCache<SavedArchive>(key))!;
      await assetCache(key, { ...archive, rejected });
    }
    vi.resetModules();
    const { AssetManager: ReopenedManager } = await import('./AssetManager');
    download.mockClear(); makeWorker.mockClear();
    const reopened = new ReopenedManager(); expect(await reopened.initialize()).toBe('ready');
    expect(download).not.toHaveBeenCalled(); expect(makeWorker).toHaveBeenCalledOnce();
    expect(workerInputs.at(-1)!.files.map(file => file.name)).toEqual(['ra2.mix']);
    expectFiles((await entry())?.files, saved.files);
    await new ReopenedManager().initialize();
    expect(download).not.toHaveBeenCalled(); expect(makeWorker).toHaveBeenCalledOnce();
  });

  it('recovers a verified installer wrongly rejected by an older MIX-parser failure without accepting the damaged MIX stage', async () => {
    await new AssetManager().download(); const saved = (await entry())!;
    await entry('/asset-source', { ...saved, files: saved.files.filter(file => file.name !== 'game.fnt') });
    for (const stage of ['mix', 'installer'] as const) {
      const key=archiveStageKey('/asset-source',stage), archive=(await assetCache<SavedArchive>(key))!;
      await assetCache(key, { ...archive, rejected:'ra2.mix: truncated MIX body' });
    }
    download.mockClear(); makeWorker.mockClear();
    expect(await new AssetManager().initialize()).toBe('ready');
    expect(download).not.toHaveBeenCalled(); expect(makeWorker).toHaveBeenCalledOnce();
    expect(workerInputs.at(-1)!.files[0].name).toMatch(/\.exe$/);
    expect((await assetCache<SavedArchive>(archiveStageKey('/asset-source','mix')))?.rejected).toBeUndefined();
    expectFiles((await entry())?.files, saved.files);
  });

  it('repairs a structurally damaged MIX stage from its saved installer in one bounded cache-only initialization', async () => {
    await new AssetManager().download(); const saved = (await entry())!;
    await entry('/asset-source', { ...saved, files: saved.files.filter(file => file.name !== 'game.fnt') });
    const ordinary = makeWorker.getMockImplementation()! as () => any;
    makeWorker.mockImplementation(function () {
      const worker = ordinary();
      const post = worker.postMessage;
      worker.postMessage = function (input: any) {
        if (input.files.every((file: any) => /\.mix$/i.test(file.name))) {
          workerInputs.push(input);
          queueMicrotask(() => this.onmessage?.({ data: { kind:'error', invalidArchive:true, message:'ra2.mix: truncated MIX body' } }));
        } else post.call(this, input);
      };
      return worker;
    });
    download.mockClear();
    expect(await new AssetManager().initialize()).toBe('ready');
    expect(download).not.toHaveBeenCalled();
    expect(workerInputs.slice(1).map(input => input.files[0].name)).toEqual(['ra2.mix','Red-Alert-2-Multiplayer.exe']);
    expectFiles((await entry())?.files, saved.files);
  });

  it('keeps completed extraction across decode cancellation and resumes on a new page', async () => {
    const manager = new AssetManager();
    await manager.download({ onProgress: progress => { if (progress.phase === 'decode') manager.cancel(); } });
    expect(manager.ready).toBe(false); expect(await entry()).toBeUndefined();
    expect(await assetCache(archiveStageKey('/asset-source', 'mix-pending'))).toBeDefined();
    expect(await new AssetManager().initialize()).toBe('ready');
    expect(download).toHaveBeenCalledTimes(1); expect(workerInputs[1].files[0].name).toBe('ra2.mix');
  });

  it('rejects a no-MIX candidate without automatic retry, then lets another explicit submission download corrected bytes', async () => {
    workerFailure = 'No game MIX files found'; workerInvalid = true;
    await new AssetManager().download();
    expect((await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'download')))?.rejected).toMatch(/No game MIX/);
    expect(await assetCache(archiveStageKey('/asset-source', 'installer'))).toBeUndefined();
    expect(await new AssetManager().initialize()).toBe('missing');
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(1);
    workerFailure = undefined; workerInvalid = false;
    const fixed = new AssetManager(); await fixed.download();
    expect(fixed.ready).toBe(true); expect(download).toHaveBeenCalledTimes(2);
  });

  it('preserves verified installer and MIX stages when a replacement contains corrupt artwork', async () => {
    const manager = new AssetManager(); await manager.download();
    const mix = await assetCache(archiveStageKey('/asset-source', 'mix'));
    const installer = await assetCache(archiveStageKey('/asset-source', 'installer'));
    extracted = files().map(file => file.name === 'gi.shp' ? { ...file, bytes: new Uint8Array(3) } : file);
    await manager.download({ forceRefresh: true });
    expect(manager.ready).toBe(false);
    expect(await assetCache(archiveStageKey('/asset-source', 'mix'))).toEqual(mix);
    expect(await assetCache(archiveStageKey('/asset-source', 'installer'))).toEqual(installer);
  });

  it('retains archive-stage quota warnings when the smaller selected-art cache saves successfully', async () => {
    const original = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, ...args: Parameters<typeof original>) {
      if (Array.isArray(args[1])) throw new DOMException('Large stages exceed quota', 'QuotaExceededError');
      return original.apply(this, args);
    });
    const manager = new AssetManager(); await manager.download();
    expect(manager.ready).toBe(true); expect(await entry()).toBeDefined();
    expect(manager.cacheWarning).toMatch(/completed installer download/); expect(manager.cacheWarning).toMatch(/extracted MIX files/);
    expect(manager.cacheWarning).not.toMatch(/selected artwork/);
    expect(await new AssetManager().initialize()).toBe('ready'); expect(download).toHaveBeenCalledTimes(1);
  });

  it('never reports partially decoded originals as ready', async () => {
    const manager = new AssetManager(), samples: { phase: string; ready: boolean }[] = [];
    await manager.download({ onProgress: progress => samples.push({ phase: progress.phase, ready: manager.ready }) });
    expect(samples.filter(sample => sample.phase !== 'ready').every(sample => !sample.ready)).toBe(true);
    expect(samples.at(-1)).toEqual({ phase: 'ready', ready: true });
  });

  it.each(['cameo.pal', 'isotem.pal', 'temperat.pal', 'voxels.vpl', 'side0/sidebar.pal', 'side0/radar.shp', 'proad03.tem', 'glat15.tem', 'tree08.tem', 'tib06.tem'])('repairs selected artwork missing %s from durable MIX inputs without downloading or unpacking the EXE', async name => {
    await new AssetManager().download(); const saved = (await entry())!;
    await entry('/asset-source', { ...saved, files: saved.files.filter(file => file.name !== name), version: 5 });
    const manager = new AssetManager();
    const phases: string[] = [];
    expect(await manager.initialize({ onProgress:p=>phases.push(p.phase) })).toBe('ready');
    expect(phases).not.toContain('download'); expect(phases).not.toContain('extract');
    expect(manager.ready).toBe(true); expect(manager.status.phase).toBe('ready');
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(2);
    expect(workerInputs[1].files.map(file => file.name)).toEqual(['ra2.mix']);
    expectFiles((await entry())?.files, saved.files);
    await new AssetManager().initialize();
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(2);
  });

  it.each(['cameo.pal', 'voxels.vpl', 'side0/radar.shp', 'proad03.tem', 'tree08.tem', 'giicon.shp'])('rejects corrupt consumed payload %s instead of loading substitute artwork', async name => {
    extracted = files().map(file => file.name === name ? { ...file, bytes: new Uint8Array(3) } : file);
    const manager = new AssetManager(); await manager.download();
    expect(manager.ready).toBe(false); expect(manager.status.phase).toBe('error');
    expect(manager.error).toContain(name.replace(/\.(tem|shp)$/, ''));
    expect(await entry()).toBeUndefined();
    expect(await manager.initialize()).toBe('invalid'); expect(download).toHaveBeenCalledTimes(1);
  });

  it('rejects a short radar frame table and incomplete authored material levels', async () => {
    extracted = files().map(file => file.name === 'side0/radar.shp' ? { ...file, bytes: testShape(1) } : file);
    const manager = new AssetManager(); await manager.download();
    expect(manager.error).toMatch(/radar.*frame 32/); expect(manager.ready).toBe(false);
    extracted = files();
    new DataView(extracted.find(file => file.name === 'voxels.vpl')!.bytes.buffer).setUint32(8, 1, true);
    await manager.download();
    expect(manager.error).toMatch(/voxels.vpl.*32/); expect(manager.ready).toBe(false); expect(await entry()).toBeUndefined();
  });

  it('refreshes usable artwork only on an explicit forceRefresh and preserves it if the update fails', async () => {
    const manager = new AssetManager(); await manager.download();
    const saved = await entry();
    await manager.download(); expect(download).toHaveBeenCalledTimes(1);
    download.mockResolvedValueOnce(new Response(null, { status: 503 }));
    await manager.download({ forceRefresh: true });
    expect(download).toHaveBeenCalledTimes(2); expect(manager.error).toMatch(/503/); expectEntry(await entry(), saved);
    await manager.initialize(); expect(manager.ready).toBe(true); expect(download).toHaveBeenCalledTimes(2);
    await manager.download({ forceRefresh: true });
    expect(download).toHaveBeenCalledTimes(3); expect(manager.ready).toBe(true);
  });
  it('never downloads or extracts on an empty-cache page open, including repeated initialization', async () => {
    const manager = new AssetManager();
    const first = manager.initialize(), duplicate = manager.initialize();
    expect(first).toBe(duplicate);
    expect(await first).toBe('missing'); expect(await duplicate).toBe('missing');
    expect(await manager.initialize()).toBe('missing');
    expect(manager).toMatchObject({ ready: false, error: null, cacheResult: 'missing' });
    expect(manager.status.phase).toBe('awaiting-source'); expect(manager.status.message).toMatch(/press Enter/);
    expect(download).not.toHaveBeenCalled(); expect(makeWorker).not.toHaveBeenCalled();
  });

  it('commits extracted files once; a fresh module and manager render identical pixels without download or extraction', async () => {
    const first = new AssetManager(), phases: string[] = [];
    await first.download({ onProgress: progress => phases.push(progress.phase) });
    expect(first.ready).toBe(true);
    expect(phases).toEqual(expect.arrayContaining(['download', 'extract', 'decode', 'ready']));
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(1);
    const saved = await entry();
    expectFiles(saved?.files, extracted);
    expect(saved?.saved).toBeGreaterThan(0);
    expect(pixels(first)).toEqual([252, 124, 28, 255]);

    // Lose all in-memory managers/module state, retain only browser storage.
    vi.resetModules();
    const { AssetManager: FreshAssetManager } = await import('./AssetManager');
    download.mockClear().mockRejectedValue(new Error('Network is unavailable'));
    makeWorker.mockClear().mockImplementation(() => { throw new Error('Extraction must not start'); });
    const reopened = new FreshAssetManager(), reopenPhases: string[] = [];
    await reopened.initialize({ onProgress: progress => reopenPhases.push(progress.phase) });
    expect(reopened).toMatchObject({ ready: true, error: null, cacheWarning: null });
    expect(reopened.status.message).toMatch(/loaded from this browser/);
    expect(reopenPhases).not.toContain('download'); expect(reopenPhases).not.toContain('extract');
    expect(download).not.toHaveBeenCalled(); expect(makeWorker).not.toHaveBeenCalled();
    expect(pixels(reopened)).toEqual(pixels(first));
    expectEntry(await entry(), saved); // A hit does not rewrite or expire storage.
  });

  it('reuses locally imported installer extraction on the next automatic launch', async () => {
    await new AssetManager().importFiles([new File(['fixture'], 'Red-Alert-2-Multiplayer.exe')]);
    const reopened = new AssetManager(); await reopened.initialize();
    expect(reopened.ready).toBe(true); expect(download).not.toHaveBeenCalled();
    expect(makeWorker).toHaveBeenCalledTimes(1); expect(pixels(reopened)).toEqual([252, 124, 28, 255]);
  });

  it('fetches the public URL directly while preserving one cache for public and historical proxy source aliases', async () => {
    vi.stubGlobal('location', new URL('http://omarky:5173/'));
    const manager = new AssetManager(); await manager.download({ url: ORIGINAL_ASSET_URL });
    expect(download.mock.calls[0][0]).toBe(ORIGINAL_ASSET_URL);
    expect(manager.source).toBe(ORIGINAL_ASSET_URL);
    for (const source of ['/asset-source', 'http://omarky:5173/asset-source', LEGACY_ASSET_URL, ORIGINAL_ASSET_URL]) {
      expect(assetSourceUrl(source)).toBe(ORIGINAL_ASSET_URL);
      expect(await new AssetManager().initialize({ url: source })).toBe('ready');
    }
    expect(await entry('/asset-source')).toBeDefined(); expect(await entry(ORIGINAL_ASSET_URL)).toBeUndefined();
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(1);
    expect(assetSourceUrl('https://other.example/asset-source')).toBe('https://other.example/asset-source');
    expect(assetCacheKey('http://omarky:5173/asset-source?custom=1')).toBe('http://omarky:5173/asset-source?custom=1');
  });

  it.each([LEGACY_ASSET_URL, ORIGINAL_ASSET_URL])('can read public-URL cache alias %s even if the proxy entry is invalid', async alias => {
    await new AssetManager().download(); const saved = (await entry())!;
    await entry(alias, saved);
    await entry('/asset-source', { ...saved, files: [] });
    const manager = new AssetManager();
    expect(await manager.initialize()).toBe('ready'); expect(manager.cacheWarning).toBeNull();
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(1);
    expect(pixels(manager)).toEqual([252, 124, 28, 255]);
  });

  it('clears every built-in selected cache alias while preserving unrelated sources', async () => {
    const manager = new AssetManager(); await manager.download(); const saved = (await entry())!;
    await entry(LEGACY_ASSET_URL, saved); await entry(ORIGINAL_ASSET_URL, saved); await entry('/own-copy.zip', saved);
    await manager.clearCache();
    for (const alias of ['/asset-source', LEGACY_ASSET_URL, ORIGINAL_ASSET_URL]) expect(await entry(alias)).toBeUndefined();
    expect(await entry('/own-copy.zip')).toBeDefined();
  });

  it('preserves complete original artwork across compatible cache versions without fetching again', async () => {
    await new AssetManager().download(); const saved = (await entry())!;
    for (const version of [5, 6, 7]) {
      const older = { ...saved, version, saved: 1 };
      await entry('/asset-source', older);
      const manager = new AssetManager();
      expect(await manager.initialize(), `version ${version}`).toBe('ready');
      expect(manager.getTerrain('rock')).not.toBeNull(); expect(manager.getTerrain('sand')).not.toBeNull();
      expect(manager.getUIAsset('side1')).not.toBeNull();
      expectEntry(await entry(), older);
    }
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(1);
  });

  it('coalesces rapid explicit submissions and does not cancel/restart the first download', async () => {
    let respond!: (response: Response) => void;
    download.mockImplementationOnce(() => new Promise<Response>(resolve => { respond = resolve; }));
    const manager = new AssetManager(), first = manager.download(), duplicate = manager.download({ url: '/asset-source' });
    await vi.waitFor(() => expect(download).toHaveBeenCalledTimes(1));
    const signal = download.mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    respond(new Response(new Uint8Array([77, 90, 0, 0])));
    await Promise.all([first, duplicate]);
    expect(manager.ready).toBe(true); expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(1);
  });

  it('aborts a superseded source and ignores its late response without overwriting the replacement', async () => {
    let respond!: (response: Response) => void;
    download.mockImplementationOnce(() => new Promise<Response>(resolve => { respond = resolve; }));
    const manager = new AssetManager(), first = manager.download({ url: '/old.exe' });
    await vi.waitFor(() => expect(download).toHaveBeenCalledTimes(1));
    const oldSignal = download.mock.calls[0][1].signal as AbortSignal;
    await manager.download({ url: '/replacement.exe' });
    expect(oldSignal.aborted).toBe(true);
    respond(new Response(new Uint8Array([9, 9, 9]))); await first;
    expect(manager).toMatchObject({ source: '/replacement.exe', ready: true, error: null });
    expect(makeWorker).toHaveBeenCalledTimes(1); expect(await entry('/old.exe')).toBeUndefined();
    expect(await entry('/replacement.exe')).toBeDefined();
  });

  it('allows explicit cancellation before any fetch without starting background retries', async () => {
    const manager = new AssetManager();
    await manager.download({ onProgress: progress => { if (progress.phase === 'download') manager.cancel(); } });
    expect(download).not.toHaveBeenCalled(); expect(makeWorker).not.toHaveBeenCalled();
    expect(await entry()).toBeUndefined(); expect(await manager.initialize()).toBe('missing');
    expect(manager.status.phase).toBe('awaiting-source'); expect(download).not.toHaveBeenCalled();
  });

  it('ignores cancelled worker events during a replacement import', async () => {
    const workers: { onmessage: ((event: { data: unknown }) => void) | null; onerror: ((event: { message: string }) => void) | null; terminate: ReturnType<typeof vi.fn>; postMessage: ReturnType<typeof vi.fn> }[] = [];
    makeWorker.mockImplementation(function () {
      const worker = { onmessage: null, onerror: null, terminate: vi.fn(), postMessage: vi.fn() };
      workers.push(worker); return worker;
    });
    const manager = new AssetManager();
    const first = manager.importFiles([new File(['first'], 'first.exe')], { url: '/first.exe' });
    await vi.waitFor(() => expect(workers).toHaveLength(1));
    const replacement = manager.importFiles([new File(['second'], 'second.exe')], { url: '/second.exe' });
    await vi.waitFor(() => expect(workers).toHaveLength(2));
    workers[0].onmessage?.({ data: { kind: 'error', message: 'Late failure from cancelled extraction' } });
    workers[0].onerror?.({ message: 'Late worker exception' });
    workers[1].onmessage?.({ data: { kind: 'complete', files: extracted, archives: [] } });
    await Promise.all([first, replacement]);
    expect(workers[0].terminate).toHaveBeenCalledTimes(1);
    expect(manager).toMatchObject({ source: '/second.exe', ready: true, error: null });
    expect(await entry('/first.exe')).toBeUndefined(); expect(await entry('/second.exe')).toBeDefined();
    expect(download).not.toHaveBeenCalled();
  });

  it('keeps configured source caches independent and preserves a source when another is cleared', async () => {
    const a = new AssetManager(), b = new AssetManager();
    await a.download({ url: '/source-a.exe' }); await b.download({ url: '/source-b.exe' });
    expect(download.mock.calls.map(call => call[0])).toEqual(['/source-a.exe', '/source-b.exe']);
    const savedA = await entry('/source-a.exe');
    await a.initialize({ url: '/source-a.exe' }); await b.clearCache();
    expect(download).toHaveBeenCalledTimes(2); expect(makeWorker).toHaveBeenCalledTimes(2);
    expectEntry(await entry('/source-a.exe'), savedA); expect(await entry('/source-b.exe')).toBeUndefined();
  });

  it('keeps compatible entries indefinitely and rebuilds incompatible selected formats from saved MIX inputs', async () => {
    await new AssetManager().download();
    const saved = (await entry())!;
    await entry(assetCacheKey(DEFAULT_ASSET_URL), { ...saved, saved: 1 });
    await new AssetManager().initialize();
    expect(download).toHaveBeenCalledTimes(1);
    await entry(assetCacheKey(DEFAULT_ASSET_URL), { ...saved, version: 4 });
    const manager = new AssetManager();
    expect(await manager.initialize()).toBe('ready');
    expect(download).toHaveBeenCalledTimes(1);
    await manager.download(); await new AssetManager().initialize();
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(2);
    expect((await entry())?.version).toBe(saved.version);
  });

  it('keeps a corrupt cache at the source gate until explicitly replaced, then reuses the repair', async () => {
    await new AssetManager().download();
    const saved = (await entry())!;
    await entry(assetCacheKey(DEFAULT_ASSET_URL), { ...saved, files: [{ name: 'unittem.pal', bytes: new Uint8Array(3) }] });
    for (const stage of ['download', 'installer', 'mix-pending', 'mix'] as const) await assetCache(archiveStageKey('/asset-source', stage), null);
    const recovered = new AssetManager();
    expect(await recovered.initialize()).toBe('invalid'); expect(await recovered.initialize()).toBe('invalid');
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(1);
    expect(recovered.status.phase).toBe('awaiting-source');
    await recovered.download();
    expect(recovered).toMatchObject({ ready: true, error: null, cacheWarning: null });
    expect(recovered.status.message).toMatch(/saved in this browser/);
    expectFiles((await entry())?.files, saved.files);
    await new AssetManager().initialize();
    expect(download).toHaveBeenCalledTimes(2); expect(makeWorker).toHaveBeenCalledTimes(2);
  });

  it('surfaces a genuine download failure after a corrupt cache instead of reporting ready', async () => {
    await new AssetManager().download();
    const saved = (await entry())!, corrupt = saved.files.filter(file => file.name !== 'gi.shp');
    await entry(assetCacheKey(DEFAULT_ASSET_URL), { ...saved, files: corrupt });
    for (const stage of ['download', 'installer', 'mix-pending', 'mix'] as const) await assetCache(archiveStageKey('/asset-source', stage), null);
    download.mockResolvedValue(new Response(null, { status: 503 }));
    const reopened = new AssetManager(); await reopened.download();
    expect(reopened.ready).toBe(false); expect(reopened.status.phase).toBe('error');
    expect(reopened.error).toMatch(/HTTP 503/); expect(makeWorker).toHaveBeenCalledTimes(1);
    expectFiles((await entry())?.files, corrupt);
  });

  it('surfaces invalid extracted artwork and keeps the previously valid cache intact', async () => {
    const manager = new AssetManager(); await manager.download();
    const saved = await entry();
    extracted = files().map(file => file.name === 'giicon.shp' ? { ...file, bytes: new Uint8Array(3) } : file);
    await manager.importFiles([new File(['broken'], 'broken.exe')]);
    expect(manager.ready).toBe(false); expect(manager.status.phase).toBe('error'); expect(manager.error).toBeTruthy();
    expectEntry(await entry(), saved);
    await manager.initialize(); expect(manager.ready).toBe(true); expect(manager.error).toBeNull();
  });

  it('does not hide an extraction error or save invalid output', async () => {
    workerFailure = 'No game MIX files found'; workerInvalid = true;
    const manager = new AssetManager(); await manager.download();
    expect(manager).toMatchObject({ ready: false, error: workerFailure });
    expect(await entry()).toBeUndefined();
  });

  it('keeps artwork usable when IndexedDB cannot open and reports that it cannot save', async () => {
    vi.spyOn(indexedDB, 'open').mockImplementation(() => { throw new DOMException('Storage disabled', 'SecurityError'); });
    const manager = new AssetManager();
    expect(await manager.initialize()).toBe('unavailable');
    expect(manager.status.phase).toBe('awaiting-source'); expect(download).not.toHaveBeenCalled();
    await manager.download();
    expect(manager.ready).toBe(true); expect(manager.error).toBeNull();
    expect(manager.cacheWarning).toMatch(/could not save.*Storage disabled/);
    expect(manager.status.message).toMatch(/cache unavailable/); expect(pixels(manager)).toEqual([252, 124, 28, 255]);
  });

  it('clears a transient read warning if the replacement saves successfully', async () => {
    vi.spyOn(indexedDB, 'open').mockImplementationOnce(() => { throw new DOMException('Temporary read failure', 'UnknownError'); });
    const manager = new AssetManager(); await manager.download();
    expect(manager).toMatchObject({ ready: true, error: null, cacheWarning: null });
    expect(manager.status.message).toMatch(/saved in this browser/); expect(await entry()).toBeDefined();
  });

  it('closes the database on a synchronous quota error and clears warnings after a later successful import', async () => {
    const close = vi.spyOn(IDBDatabase.prototype, 'close');
    const open = vi.spyOn(indexedDB, 'open');
    const put = vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => { throw new DOMException('Storage full', 'QuotaExceededError'); });
    const manager = new AssetManager(); await manager.download();
    expect(close).toHaveBeenCalledTimes(open.mock.calls.length); // Every read and failed write releases its connection.
    expect(manager.ready).toBe(true); expect(manager.cacheWarning).toMatch(/could not save.*Storage full/);
    expect(await entry()).toBeUndefined();
    put.mockRestore(); await manager.importFiles([new File(['fixture'], 'installer.exe')]);
    expect(manager.cacheWarning).toBeNull(); expect(manager.status.message).toMatch(/saved in this browser/);
    await new AssetManager().initialize(); expect(download).toHaveBeenCalledTimes(1);
  });

  it('waits for transaction commit: an aborted successful put is not reported as saved', async () => {
    const original = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, ...args: Parameters<typeof original>) {
      const request = original.apply(this, args);
      request.addEventListener('success', () => this.transaction.abort());
      return request;
    });
    const manager = new AssetManager(); await manager.download();
    expect(manager.ready).toBe(true); expect(manager.cacheWarning).toMatch(/could not save.*aborted/);
    expect(manager.status.message).toMatch(/cache unavailable/); expect(await entry()).toBeUndefined();
  });

  it('cancels cache decoding without accidentally downloading or overwriting a valid entry', async () => {
    await new AssetManager().download(); const saved = await entry();
    const manager = new AssetManager();
    await manager.initialize({ onProgress: progress => { if (progress.phase === 'decode') manager.cancel(); } });
    expect(download).toHaveBeenCalledTimes(1); expect(makeWorker).toHaveBeenCalledTimes(1);
    expectEntry(await entry(), saved); expect(manager.ready).toBe(false);
  });
});
