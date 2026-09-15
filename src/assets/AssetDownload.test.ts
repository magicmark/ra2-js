import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  AssetDownload,
  assetCache,
  assetCacheKey,
  assetSourceUrl,
  archiveStageKey,
  ORIGINAL_ASSET_URL,
  LEGACY_ASSET_URL,
  requestPersistentAssetStorage,
  type SavedArchive,
} from './AssetDownload';

let fetchArchive: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory());
  fetchArchive = vi.fn(
    async () =>
      new Response(new Uint8Array([77, 90, 0, 0]), { headers: { 'content-length': '4' } }),
  );
  vi.stubGlobal('fetch', fetchArchive);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const loader = (source = ORIGINAL_ASSET_URL, alive = () => true) =>
  new AssetDownload(source, alive, () => {}, new Map());

it.each([true, false])(
  'preserves the browser persistence decision %s without changing saved assets',
  async (decision) => {
    await assetCache('existing', { saved: 123 });
    const persist = vi.fn(async () => decision);
    vi.stubGlobal('navigator', { storage: { persist } });
    expect(await requestPersistentAssetStorage()).toBe(decision);
    expect(persist).toHaveBeenCalledOnce();
    expect(await assetCache('existing')).toEqual({ saved: 123 });
  },
);

it('tolerates absent or unavailable persistent-storage support', async () => {
  vi.stubGlobal('navigator', undefined);
  expect(await requestPersistentAssetStorage()).toBeUndefined();
  vi.stubGlobal('navigator', { storage: {} });
  expect(await requestPersistentAssetStorage()).toBeUndefined();
  vi.stubGlobal('navigator', {
    storage: { persist: () => Promise.reject(new TypeError('Unavailable storage')) },
  });
  expect(await requestPersistentAssetStorage()).toBe(false);
});

it('fetches the public URL directly, commits before extraction, and restores exact bytes under the legacy cache alias', async () => {
  const saved = await loader().download(new AbortController().signal, () => {});
  expect(fetchArchive.mock.calls[0][0]).toBe(ORIGINAL_ASSET_URL);
  const reopened = await loader('/asset-source').resume();
  expect(reopened?.id).toBe(saved.id);
  expect(reopened?.stage).toBe('download');
  expect([...new Uint8Array(await reopened!.files[0].blob.arrayBuffer())]).toEqual([77, 90, 0, 0]);
  expect(await assetCache(archiveStageKey('/asset-source', 'installer'))).toBeUndefined();
  expect(fetchArchive).toHaveBeenCalledTimes(1);
});

it.each(['/asset-source', LEGACY_ASSET_URL, ORIGINAL_ASSET_URL])(
  'reuses completed archives for built-in source alias %s',
  async (source) => {
    const saved = await loader('/asset-source').remember([
      { name: 'original.exe', blob: new Blob(['MZoriginal']) },
    ]);

    expect(assetSourceUrl(source)).toBe(ORIGINAL_ASSET_URL);
    expect(assetCacheKey(source)).toBe('/asset-source');
    expect((await loader(source).resume())?.id).toBe(saved.id);
    expect(fetchArchive).not.toHaveBeenCalled();
  },
);

it('fetches a custom public URL exactly without mapping it to a proxy or the built-in source', async () => {
  const source = 'https://copies.example/ra2.zip?version=mine';
  await loader(source).download(new AbortController().signal, () => {});
  expect(fetchArchive.mock.calls[0][0]).toBe(source);
  expect(assetCacheKey(source)).toBe(source);
  expect(await loader('/asset-source').resume()).toBeUndefined();
});

it.each([
  ['HTML response', () => new Response('<html>server error</html>'), /supported game installer/],
  [
    'truncated response',
    () => new Response(new Uint8Array([77, 90]), { headers: { 'content-length': '100' } }),
    /Incomplete asset download/,
  ],
  [
    'partial range',
    () =>
      new Response(new Uint8Array([77, 90, 0, 0]), {
        status: 206,
        headers: { 'content-range': 'bytes 0-3/100' },
      }),
    /only part of the archive/,
  ],
  ['HTTP error', () => new Response(null, { status: 503 }), /HTTP 503/],
] as const)(
  'never persists an invalid %s as a completed archive',
  async (_name, response, message) => {
    fetchArchive.mockResolvedValueOnce(response());
    await expect(loader().download(new AbortController().signal, () => {})).rejects.toThrow(
      message,
    );
    expect(await loader().resume()).toBeUndefined();
  },
);

it('does not persist a stream that disconnects before completion', async () => {
  let reads = 0;
  fetchArchive.mockResolvedValueOnce(
    new Response(
      new ReadableStream({
        pull(controller) {
          if (reads++ === 0) controller.enqueue(new Uint8Array([77, 90]));
          else controller.error(new Error('Connection interrupted'));
        },
      }),
    ),
  );
  await expect(loader().download(new AbortController().signal, () => {})).rejects.toThrow(
    /Connection interrupted/,
  );
  expect(await loader().resume()).toBeUndefined();
});

it('cancels a late stage write before commit without overwriting an earlier completed download', async () => {
  const previous = await loader().download(new AbortController().signal, () => {});
  let alive = true;
  const original = IDBObjectStore.prototype.put;
  vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (
    this: IDBObjectStore,
    ...args: Parameters<typeof original>
  ) {
    const request = original.apply(this, args);
    request.addEventListener('success', () => {
      alive = false;
    });

    return request;
  });
  await loader(ORIGINAL_ASSET_URL, () => alive).remember([
    { name: 'replacement.exe', blob: new Blob(['MZreplacement']) },
  ]);
  expect((await loader().resume())?.id).toBe(previous.id);
});

it('rejects malformed persisted stage shapes without touching selected artwork', async () => {
  await assetCache('/asset-source', { version: 8, files: ['selected artwork'], saved: 1 });
  await assetCache(archiveStageKey('/asset-source', 'mix'), {
    version: 1,
    id: 'broken',
    files: [{ name: 'ra2.mix', blob: 'not a Blob' }],
    saved: 1,
  });
  expect(await loader().resume()).toBeUndefined();
  expect(await assetCache('/asset-source')).toEqual({
    version: 8,
    files: ['selected artwork'],
    saved: 1,
  });
});

it('does not mistake a rejected downloaded candidate for a verified installer on a new page', async () => {
  const downloader = loader(),
    input = await downloader.download(new AbortController().signal, () => {});

  await downloader.reject(input, 'No game MIX files found');
  expect(await loader().resume()).toBeUndefined();
  expect(
    (await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'download')))?.rejected,
  ).toMatch(/No game MIX/);
  expect(await assetCache(archiveStageKey('/asset-source', 'installer'))).toBeUndefined();
});

it('keeps the installer eligible when only its saved MIX representation is structurally damaged', async () => {
  const input = await loader().download(new AbortController().signal, () => {});
  await assetCache(archiveStageKey('/asset-source', 'installer'), input);
  await assetCache(archiveStageKey('/asset-source', 'mix'), {
    ...input,
    files: [{ name: 'ra2.mix', blob: new Blob(['damaged MIX']) }],
  });

  const archives = loader(),
    mix = (await archives.resume())!;

  expect(mix.stage).toBe('mix');
  await archives.reject(mix, 'Invalid MIX index');
  expect((await loader().resume())?.stage).toBe('download');
  expect(
    (await assetCache<SavedArchive>(archiveStageKey('/asset-source', 'installer')))?.rejected,
  ).toBeUndefined();
});

it.each([
  '[object Object]',
  'Archive extraction failed (7-Zip code 8). Choose a complete game installer.',
])(
  'retries an old ambiguous/runtime rejection locally, but honors a new confirmed container rejection: %s',
  async (rejected) => {
    const input = await loader().download(new AbortController().signal, () => {}),
      key = archiveStageKey('/asset-source', 'download');

    await assetCache(key, { ...input, rejected });
    expect((await loader().resume())?.id).toBe(input.id);
    await assetCache(key, { ...input, rejected, rejectionKind: 'container' });
    expect(await loader().resume()).toBeUndefined();
  },
);
