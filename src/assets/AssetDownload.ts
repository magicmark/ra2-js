/** HTTP transport and durable archive stages, independent of the artwork catalog. */
export const ORIGINAL_ASSET_URL = 'https://archive.org/cors/red-alert-2-multiplayer/Red-Alert-2-Multiplayer.exe';
export const LEGACY_ASSET_URL = 'https://archive.org/download/red-alert-2-multiplayer/Red-Alert-2-Multiplayer.exe';
export const DEFAULT_ASSET_URL = import.meta.env.VITE_ASSET_URL || ORIGINAL_ASSET_URL;
/** Request eviction protection only from an explicit source/Continue action. */
export async function requestPersistentAssetStorage(): Promise<boolean | undefined> {
  try {
    const storage = typeof navigator === 'undefined' ? undefined : navigator.storage;
    return typeof storage?.persist === 'function' ? await storage.persist() : undefined;
  } catch {
    // Browser policy, private mode, or insecure contexts must not block play.
    return false;
  }
}
export function assetSourceUrl(url: string): string {
  const source = url.trim() || DEFAULT_ASSET_URL;
  if (source === '/asset-source' || source === LEGACY_ASSET_URL) return ORIGINAL_ASSET_URL;
  if (typeof location !== 'undefined') {
    try {
      const parsed = new URL(source, location.href);
      if (parsed.origin === location.origin && parsed.pathname === '/asset-source' && !parsed.search && !parsed.hash) return ORIGINAL_ASSET_URL;
    } catch { /* The explicit request reports malformed URLs. */ }
  }
  return source;
}
export function assetCacheKey(url: string): string { const source = assetSourceUrl(url); return source === ORIGINAL_ASSET_URL ? '/asset-source' : source; }
export function selectedAssetCacheKeys(url: string): string[] {
  const key = assetCacheKey(url);
  return key === '/asset-source' ? [key, ORIGINAL_ASSET_URL, LEGACY_ASSET_URL] : [key];
}
export interface ArchiveInput { name: string; blob: Blob }
export type ArchiveStage = 'download' | 'installer' | 'mix-pending' | 'mix';
export interface SavedArchive { version: 1; id: string; files: ArchiveInput[]; saved: number; rejected?: string; rejectionKind?: 'container' }
export interface ArchiveResume extends SavedArchive { stage: ArchiveStage }
export const archiveStageKey = (source: string, stage: ArchiveStage): IDBValidKey => ['archive-stage-v1', assetCacheKey(source), stage];

/** Keep the existing database/store and selected-art keys intact. */
export async function assetCache<T>(key: IDBValidKey, value?: T | null, alive = () => true): Promise<T | undefined> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('red-alert-command-assets', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('assets');
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
  return new Promise((resolve, reject) => {
    try {
      if (!alive()) { db.close(); resolve(undefined); return; }
      const tx = db.transaction('assets', value === undefined ? 'readonly' : 'readwrite'), store = tx.objectStore('assets');
      const request = value === undefined ? store.get(key) : value === null ? store.delete(key) : store.put(value, key);
      request.onsuccess = () => { if (!alive()) tx.abort(); };
      tx.oncomplete = () => { db.close(); resolve(value === undefined ? request.result : undefined); };
      tx.onerror = () => { db.close(); reject(tx.error); };
      tx.onabort = () => { db.close(); reject(tx.error ?? new Error('Asset cache transaction aborted')); };
    } catch (error) { db.close(); reject(error); }
  });
}

export class InvalidArchiveError extends Error {}
const details = (error: unknown) => error instanceof Error ? error.message : String(error);
const stageName = (stage: ArchiveStage) => stage.startsWith('mix') ? 'extracted MIX files' : 'completed installer download';
function validStage(value: unknown): value is SavedArchive {
  const entry = value as SavedArchive | undefined;
  return !!entry && entry.version === 1 && typeof entry.id === 'string' && Array.isArray(entry.files) && entry.files.length > 0
    && entry.files.every(file => typeof file.name === 'string' && file.blob instanceof Blob && file.blob.size > 0);
}
// Earlier builds incorrectly attached these decoder/catalog failures to every
// completed archive stage. Their bytes are still usable; retry locally without
// changing the stored generation or treating real container failures as valid.
const legacyArtworkRejection = (reason: string | undefined): boolean =>
  !!reason && /^(Missing original asset|Invalid original (asset|sprite)|Cannot render original)/.test(reason);
const legacyMixRejection = (reason: string | undefined): boolean => !!reason &&
  /^(?:.+\.mix: (?:truncated (?:encrypted )?MIX (?:header|body)|invalid MIX index|file outside MIX body|encrypted index out of bounds)|Truncated MIX encryption key)$/i.test(reason);
const legacyExtractorRejection = (reason: string | undefined): boolean => !!reason &&
  (reason === '[object Object]' || /^Archive extraction failed \(7-Zip code (?:7|8|255)\)/.test(reason));

/** A loader run supplies its cancellation guard; bytes also survive storage failures in this session. */
export class AssetDownload {
  private mix?: SavedArchive;
  constructor(private source: string, private alive: () => boolean,
    private warning: (stage: string, message: string | null) => void,
    private memory: Map<string, SavedArchive>) {}
  private memoryKey(stage: ArchiveStage): string { return JSON.stringify(archiveStageKey(this.source, stage)); }
  private async read(stage: ArchiveStage): Promise<SavedArchive | undefined> {
    const held = this.memory.get(this.memoryKey(stage));
    if (held) return held;
    try {
      const value = await assetCache<unknown>(archiveStageKey(this.source, stage));
      if (!this.alive()) return;
      if (value === undefined) return;
      if (!validStage(value) || stage.startsWith('mix') && !value.files.every(file => /\.mix$/i.test(file.name))) {
        this.warning(stage, `Saved ${stageName(stage)} are invalid; an explicit retry can replace them.`); return;
      }
      return value;
    } catch (error) { if (this.alive()) this.warning(stage, `Cannot read ${stageName(stage)}: ${details(error)}`); }
  }
  private async save(stage: ArchiveStage, entry: SavedArchive): Promise<boolean> {
    if (!this.alive()) return false;
    this.memory.set(this.memoryKey(stage), entry);
    try {
      await assetCache(archiveStageKey(this.source, stage), entry, this.alive);
      if (!this.alive()) return false;
      this.warning(stage, null); return true;
    } catch (error) {
      if (this.alive()) this.warning(stage, `Browser storage could not save ${stageName(stage)}: ${details(error)}`);
      return false;
    }
  }
  private async remove(stage: ArchiveStage, id: string): Promise<void> {
    if (!this.alive()) return;
    const current = await this.read(stage);
    if (!this.alive() || current?.id !== id) return;
    this.memory.delete(this.memoryKey(stage));
    try { await assetCache(archiveStageKey(this.source, stage), null, this.alive); }
    catch (error) { if (this.alive()) this.warning(`cleanup-${stage}`, `Could not remove temporary ${stageName(stage)}: ${details(error)}`); }
  }
  async resume(options: { skipMix?: boolean } = {}): Promise<ArchiveResume | undefined> {
    // Always reuse the furthest completed stage, including when installer
    // promotion failed but the extracted MIX inputs were saved successfully.
    for (const stage of ['mix-pending', 'mix', 'download', 'installer'] as const) {
      if (options.skipMix && stage.startsWith('mix')) continue;
      const entry = await this.read(stage);
      if (!this.alive()) return;
      if (entry && (!entry.rejected || !entry.rejectionKind && (legacyArtworkRejection(entry.rejected) || legacyExtractorRejection(entry.rejected)
        || stage === 'installer' && legacyMixRejection(entry.rejected)))) return { ...entry, rejected: undefined, stage };
    }
  }
  async remember(files: ArchiveInput[]): Promise<ArchiveResume> {
    const entry: SavedArchive = { version: 1, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, files, saved: Date.now() };
    await this.save('download', entry);
    return { ...entry, stage: 'download' };
  }
  async download(signal: AbortSignal, progress: (message: string, loaded: number, total?: number) => void): Promise<ArchiveResume> {
    progress('Downloading the original game archive…', 0);
    if (!this.alive()) throw new Error('Asset loading cancelled');
    // Network identity is the entered public URL. The legacy proxy spelling is
    // retained only as an IndexedDB key so existing completed stages survive.
    const response = await fetch(assetSourceUrl(this.source), { signal });
    if (!response.ok) throw new Error(`Asset server returned HTTP ${response.status}. Retry or import the installer below.`);
    if (response.status === 206) {
      const range = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(response.headers.get('content-range') || '');
      if (!range || Number(range[1]) !== 0 || Number(range[2]) + 1 !== Number(range[3])) {
        throw new Error('The asset server returned only part of the archive. Press Enter to retry or choose a complete source.');
      }
    }
    const total = Number(response.headers.get('content-length')) || 0;
    const encoded = response.headers.get('content-encoding');
    const reader = response.body?.getReader(), chunks: BlobPart[] = [];
    let blob: Blob, loaded = 0;
    if (reader) {
      for (;;) {
        const next = await reader.read();
        if (!this.alive()) { await reader.cancel(); throw new Error('Asset loading cancelled'); }
        if (next.done) break;
        chunks.push(next.value as Uint8Array<ArrayBuffer>); loaded += next.value.byteLength;
        progress(`Downloading assets · ${(loaded / 1048576).toFixed(1)}${total ? ` / ${(total / 1048576).toFixed(1)}` : ''} MB`, loaded, total || undefined);
      }
      blob = new Blob(chunks);
    } else blob = await response.blob();
    if (!this.alive()) throw new Error('Asset loading cancelled');
    if (total && !encoded && blob.size !== total) throw new Error(`Incomplete asset download: received ${blob.size} of ${total} bytes. Press Enter to retry.`);
    // A fully received candidate is durable before WASM starts, but is not a
    // verified game archive until the worker validates its MIX inputs.
    const head = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
    const archive = head[0] === 0x4d && head[1] === 0x5a || head[0] === 0x50 && head[1] === 0x4b
      || head[0] === 0x37 && head[1] === 0x7a || head[0] === 0x52 && head[1] === 0x61;
    if (!archive) throw new InvalidArchiveError('The URL returned no supported game installer/archive (possibly an HTML error page). Correct the URL and press Enter to retry.');
    return this.remember([{ name: 'Red-Alert-2-Multiplayer.exe', blob }]);
  }
  async extracted(input: ArchiveResume, files: ArchiveInput[]): Promise<void> {
    if (!this.alive()) return;
    this.mix = { version: 1, id: input.id, saved: input.saved, files };
    if (input.stage === 'mix' || input.stage === 'mix-pending') return;
    await this.save('mix-pending', this.mix);
  }
  async complete(input: ArchiveResume): Promise<void> {
    if (!this.alive()) return;
    if (this.mix && input.stage !== 'mix' && await this.save('mix', this.mix)) {
      await this.remove('mix-pending', this.mix.id); this.warning('mix-pending', null);
    }
    const installer = input.stage === 'download' || input.stage === 'installer' ? input : await this.read('download');
    if (installer?.id === input.id && input.stage !== 'installer' && !installer.files.every(file => /\.mix$/i.test(file.name))) {
      if (await this.save('installer', installer)) { await this.remove('download', installer.id); this.warning('download', null); }
    } else if (installer?.id === input.id) await this.remove('download', installer.id);
  }
  async reject(input: ArchiveResume, reason: string): Promise<void> {
    // Reject only the failed representation. A damaged MIX cache can be
    // rebuilt from its saved installer without downloading that installer again.
    const stages: ArchiveStage[] = input.stage.startsWith('mix') ? ['mix-pending', 'mix'] : ['download', 'installer'];
    for (const stage of stages) {
      const entry = await this.read(stage);
      if (!this.alive()) return;
      if (entry?.id === input.id) await this.save(stage, { ...entry, rejected: reason, rejectionKind: 'container' });
    }
  }
  async clear(): Promise<void> {
    for (const stage of ['download', 'mix-pending', 'mix', 'installer'] as const) {
      this.memory.delete(this.memoryKey(stage)); await assetCache(archiveStageKey(this.source, stage), null);
    }
  }
}
