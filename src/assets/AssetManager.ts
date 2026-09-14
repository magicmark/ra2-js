import { CATALOG, DIALOG_PCX_FILES, DIALOG_SHAPE_FILES, EFFECT_ANIMATIONS, theaterNames, type AssetSpec } from './catalog';
import { decodeHva, decodePalette, decodeTmp, decodeVpl, decodeVxl, ShpFile, type IndexedFrame, type VoxelLimb } from './formats';
import { RA2_NORMALS } from './voxelNormals';
import { buildingLoopFrame, buildingLoops, type BuildingLoop } from './buildingAnimations';
import { NativeFont } from './NativeFont';
import { NativeCursors } from './NativeCursor';
import { decodePcx } from './Pcx';
import { nativeAnimationInterval, nativeAnimationFrame, NATIVE_SPEED_INDEX, readArtSections, type NativeAnimationDefinition } from './NativeAnimation';
import { infantryArt, infantrySequenceFrame, type InfantryArt } from './InfantryAnimation';
import { buildingSaleFrame } from '../game/buildingSale';
import type { CustomArt } from './CustomArt';
import { nativeTileSpec, nativeOverlaySpec, NATIVE_THEATERS, THEATER_EXTENSION, type NativeTheater } from '../game/maps/theater';

import { AssetDownload, InvalidArchiveError, assetCache, assetCacheKey, assetSourceUrl, selectedAssetCacheKeys, DEFAULT_ASSET_URL, ORIGINAL_ASSET_URL, type ArchiveInput, type ArchiveResume, type SavedArchive } from './AssetDownload';
export { assetCacheKey, assetSourceUrl, DEFAULT_ASSET_URL, ORIGINAL_ASSET_URL } from './AssetDownload';

export interface Sprite { source: HTMLCanvasElement; width: number; height: number; anchorX: number; anchorY: number; offsetX: number; offsetY: number }
export interface AssetProgress { phase: 'cache' | 'awaiting-source' | 'download' | 'extract' | 'decode' | 'ready' | 'error'; loaded: number; total?: number; message: string }
export type AssetRestoreResult = 'ready' | 'missing' | 'invalid' | 'unavailable' | 'cancelled';
export interface AssetOptions { url?: string; onProgress?: (progress: AssetProgress) => void; forceRefresh?: boolean; nativeMaps?: boolean }
/** Original sidebar frames consumed by the supported Allied interface. */
export const HUD_ASSET_FRAMES: Readonly<Record<string, readonly number[]>> = {
  side1: [0], side2: [0], side2b: [0], side3: [0], top: [0], credits: [0], tabs: [0],
  radar: [0, 32], repair: [0, 1], sell: [0, 1], tab00: [0, 1, 2], tab01: [0, 1, 2],
  tab02: [0, 1, 2], tab03: [0, 1, 2], bottom: [0], 'menu-left': [0, 1], 'menu-right': [0, 1],
  'scroll-up': [0, 1, 2], 'scroll-down': [0, 1, 2],
  'command-team1': [0, 1], 'command-team2': [0, 1], 'command-type': [0, 1],
  'command-deploy': [0, 1], 'command-guard': [0, 1], 'command-planning': [0, 1],
  'command-background': [0], 'command-left': [0, 1, 2], 'command-right': [0],
};
export const REQUIRED_TERRAIN = ['clear01', 'water01', 'proad01', 'proad02', 'proad03', 'ruff01', 'green01',
  ...Array.from({ length: 15 }, (_, i) => `glat${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 15 }, (_, i) => `clat${String(i + 1).padStart(2, '0')}`)];
export const DIALOG_ASSET_FRAMES: Readonly<Record<string, readonly number[]>> = {
  'options-small': [0], 'options-medium': [0], 'options-large': [0],
  'options-button': [0, 1, 2], 'options-checkbox-on': [0], 'options-checkbox-off': [0], 'options-slider-thumb': [0],
};
interface AssetFile { name: string; bytes: Uint8Array }
interface CacheEntry { version: number; files: AssetFile[]; saved: number; unavailableEnhancements?: string[] }
interface PreparedVoxel { x: number; y: number; z: number; color: number; nx: number; ny: number; nz: number; turret: boolean }
const CACHE_VERSION = 8;
// Multiplayer DarkBlue, DarkRed, Gold and DarkGreen from rules.ini [Colors].
// Westwood uses HSV values in 0..255, with a nonlinear remap ramp.
const SIDE_COLORS = [[153, 214, 212], [0, 230, 255], [41, 240, 230], [81, 200, 210]];
const SIDE_REMAPS = SIDE_COLORS.map(([h, s, v]) => Array.from({ length: 16 }, (_, index) => {
  const hue = h / 255 * 6, saturation = s / 255 * Math.sin(index * Math.PI / 67.5 + Math.PI / 3.6);
  const value = v * Math.cos(index * 7 * Math.PI / 270 + Math.PI / 9), chroma = value * saturation;
  const secondary = chroma * (1 - Math.abs(hue % 2 - 1)), low = value - chroma;
  const rgb = hue < 1 ? [chroma, secondary, 0] : hue < 2 ? [secondary, chroma, 0] : hue < 3 ? [0, chroma, secondary] : hue < 4 ? [0, secondary, chroma] : hue < 5 ? [secondary, 0, chroma] : [chroma, 0, secondary];
  return rgb.map(channel => Math.max(0, channel + low));
}));
const idleFrames: Record<string, [number, number]> = { gi: [0, 1], cons: [0, 1], engineer: [0, 1], rock: [292, 6] };

function canvas(width: number, height: number): HTMLCanvasElement {
  const result = document.createElement('canvas'); result.width = Math.max(1, width); result.height = Math.max(1, height); return result;
}
function sprite(source: HTMLCanvasElement, anchorX: number, anchorY: number): Sprite {
  return { source, width: source.width, height: source.height, anchorX, anchorY, offsetX: -anchorX, offsetY: -anchorY };
}
function trimSprite(value: Sprite): Sprite {
  const { source, width, height, anchorX, anchorY } = value, ctx = source.getContext('2d')!;
  const image = ctx.getImageData(0, 0, width, height);
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (image.data[(y * width + x) * 4 + 3]) {
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  if (right < left || (left === 0 && right === width - 1 && top === 0 && bottom === height - 1)) return value;
  const result = canvas(right - left + 1, bottom - top + 1), target = result.getContext('2d')!, pixels = target.createImageData(result.width, result.height);
  for (let y = 0; y < result.height; y++) pixels.data.set(image.data.subarray(((y + top) * width + left) * 4, ((y + top) * width + right + 1) * 4), y * result.width * 4);
  target.putImageData(pixels, 0, 0);
  return sprite(result, anchorX - left, anchorY - top);
}
function paint(frame: IndexedFrame, palette: Uint8Array, side = -1): HTMLCanvasElement {
  const result = canvas(frame.width, frame.height), ctx = result.getContext('2d')!;
  if (!frame.width || !frame.height) return result;
  const image = ctx.createImageData(frame.width, frame.height);
  for (let i = 0; i < frame.pixels.length; i++) {
    const index = frame.pixels[i]; if (!index) continue;
    const c = index * 3, p = i * 4;
    if (side >= 0 && index >= 16 && index <= 31) {
      const color = SIDE_REMAPS[side % SIDE_REMAPS.length][index - 16];
      for (let ch = 0; ch < 3; ch++) image.data[p + ch] = color[ch];
    } else { image.data[p] = palette[c]; image.data[p + 1] = palette[c + 1]; image.data[p + 2] = palette[c + 2]; }
    image.data[p + 3] = index === 1 && side >= 0 ? 120 : 255;
  }
  ctx.putImageData(image, 0, 0); return result;
}
function shadow(frame: IndexedFrame): HTMLCanvasElement {
  const result = canvas(frame.width, frame.height), ctx = result.getContext('2d')!;
  if (!frame.width || !frame.height) return result;
  const image = ctx.createImageData(frame.width, frame.height);
  for (let i = 0; i < frame.pixels.length; i++) if (frame.pixels[i]) image.data[i * 4 + 3] = 105;
  ctx.putImageData(image, 0, 0); return result;
}
export class AssetManager {
  customArt: CustomArt | null = null;
  ready = false;
  error: string | null = null;
  status: AssetProgress = { phase: 'cache', loaded: 0, message: 'Preparing game assets…' };
  source = '';
  cacheWarning: string | null = null;
  cacheResult: AssetRestoreResult | null = null;
  private cacheProblem = '';
  private cachedArtworkFiles = 0;
  private readonly storageWarnings = new Map<string, string>();
  private readonly archiveMemory = new Map<string, SavedArchive>();
  readonly diagnostics: string[] = [];
  private files = new Map<string, Uint8Array>();
  private font: NativeFont | null = null;
  private cursors: NativeCursors | null = null;
  private shapes = new Map<string, ShpFile>();
  private sprites = new Map<string, Sprite | null>();
  private voxelModels = new Map<string, PreparedVoxel[]>();
  private buildingLoops = new Map<string, BuildingLoop>();
  private art = readArtSections(undefined);
  private effectDefinitions: Record<string, NativeAnimationDefinition> = {};
  private infantry = new Map<string, InfantryArt>();
  private buildingAnchors = new Map<string, number>();
  private nativePalettes = new Map<string, Uint8Array>();
  private theater: NativeTheater = 'TEMPERATE';
  private pipPalette: Uint8Array = new Uint8Array(768);
  private unitPalette: Uint8Array = new Uint8Array(768);
  private cameoPalette: Uint8Array = new Uint8Array(768);
  private terrainPalette: Uint8Array = new Uint8Array(768);
  private orePalette: Uint8Array = new Uint8Array(768);
  private animationPalette: Uint8Array = new Uint8Array(768);
  private sidebarPalettes: Uint8Array[] = [];
  private voxelLighting: Uint8Array = new Uint8Array();
  private preparingRun?: number;
  private requiresNativeMaps = false;
  private enhancementUpgrade = false;
  private missingEnhancements: string[] = [];
  private progress?: AssetOptions['onProgress'];
  private controller?: AbortController;
  private worker?: Worker;
  private run = 0;
  private pendingReject?: (reason: Error) => void;
  private active?: { key: string; downloading: boolean; promise: Promise<AssetRestoreResult> };

  private report(phase: AssetProgress['phase'], message: string, loaded = 0, total?: number): void {
    this.status = { phase, message, loaded, total }; this.progress?.(this.status);
  }
  /** Opening a page can only restore saved assets. It never authorizes a download. */
  initialize(options: AssetOptions = {}): Promise<AssetRestoreResult> { return this.start(options, false); }
  /** Call only after explicit source submission. Repeated submissions share a run. */
  async download(options: AssetOptions = {}): Promise<void> { await this.start(options, true); }
  private start(options: AssetOptions, downloading: boolean): Promise<AssetRestoreResult> {
    const nativeUpgrade = !!options.nativeMaps && !this.requiresNativeMaps;
    this.requiresNativeMaps ||= !!options.nativeMaps;
    const source = assetSourceUrl(options.url || DEFAULT_ASSET_URL), key = assetCacheKey(source);
    if (this.active?.key === key && (this.active.downloading || !downloading)) return this.active.promise;
    if (!nativeUpgrade && !options.forceRefresh && !this.active && this.ready && this.status.phase === 'ready' && key === assetCacheKey(this.source)) {
      this.progress = options.onProgress;
      this.report('ready', this.status.message, 1, 1);
      return Promise.resolve('ready');
    }
    this.cancel(); const run = this.run;
    this.source = source; this.progress = options.onProgress; this.error = null; this.storageWarnings.clear(); this.cacheWarning = null; this.cacheResult = null; this.cacheProblem = ''; this.cachedArtworkFiles = 0; this.ready = false;
    const promise = this.runLoad(run, source, downloading, options.forceRefresh ?? false);
    const active = { key, downloading, promise }; this.active = active;
    void promise.then(() => { if (this.active === active) this.active = undefined; });
    return promise;
  }
  private async restore(run: number, source: string): Promise<AssetRestoreResult> {
    this.report('cache', 'Preparing saved game files…');
    const keys = selectedAssetCacheKeys(source);
    let result: AssetRestoreResult = 'missing';
    for (const candidate of keys) {
      let entry: CacheEntry | undefined;
      try { entry = await assetCache<CacheEntry>(candidate); }
      catch (error) {
        if (run !== this.run) return 'cancelled';
        this.storageWarning('selected-read', `Browser asset cache unavailable: ${error instanceof Error ? error.message : String(error)}`);
        return 'unavailable';
      }
      if (run !== this.run) return 'cancelled';
      if (!entry) continue;
      this.cachedArtworkFiles = Math.max(this.cachedArtworkFiles, Array.isArray(entry.files) ? entry.files.length : 0);
      // Versions 6/7 added optional artwork, not a new representation. Validate
      // existing v5 gameplay files instead of redownloading 197 MiB on a UI update.
      if (!Number.isInteger(entry.version) || entry.version < 5 || entry.version > CACHE_VERSION) {
        this.cacheProblem = `Unsupported saved asset version ${entry.version}`;
        this.diagnostics.push(`Saved asset cache ${candidate} has unsupported version ${entry.version}`);
        result = 'invalid'; continue;
      }
      try {
        await this.prepare(entry.files, run);
        if (run !== this.run) return 'cancelled';
        // An archive selection already tried these optional files. Retrying
        // the same absent artwork on every page load cannot improve the cache.
        if (entry.unavailableEnhancements?.join('\n') === this.missingEnhancements.join('\n')) this.enhancementUpgrade = false;
        this.storageWarning('selected-read', null);
        this.report('ready', 'Original game assets loaded from this browser.', 1, 1);
        return 'ready';
      } catch (error) {
        if (run !== this.run) return 'cancelled';
        this.ready = false; result = 'invalid';
        this.cacheProblem = error instanceof Error ? error.message : String(error);
        this.diagnostics.push(`Saved game assets at ${candidate} are invalid: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return result;
  }
  private async runLoad(run: number, source: string, downloading: boolean, forceRefresh = false): Promise<AssetRestoreResult> {
    try {
      // Only the explicit artwork update action bypasses a usable saved cache.
      // The existing entry stays intact until the replacement validates/commits.
      const restored = downloading && forceRefresh ? 'missing' : await this.restore(run, source);
      if (run !== this.run) return 'cancelled';
      this.cacheResult = restored;
      if (restored === 'ready' && !this.enhancementUpgrade) return restored;
      const usableFiles = restored === 'ready' ? [...this.files].map(([name, bytes]) => ({ name, bytes })) : undefined;
      const archives = this.archiveDownload(run, source);
      let local = forceRefresh ? undefined : await archives.resume();
      if (run !== this.run) return 'cancelled';
      // New artwork is an enhancement to a playable saved selection. Upgrade
      // from local archives when available; never require a new download.
      if (usableFiles && !local) return 'ready';
      if (local) for (let attempt = 0; attempt < 2; attempt++) {
        this.report('cache', `Preparing saved game files from ${local.stage.startsWith('mix') ? 'extracted MIX archives' : 'the completed installer'}…`);
        try {
          await this.load(local.files, run, archives, local);
          this.cacheResult = this.ready ? 'ready' : 'cancelled';
          return this.cacheResult;
        } catch (error) {
          if (run !== this.run) return 'cancelled';
          if (attempt === 0 && error instanceof InvalidArchiveError) {
            const alternative = await archives.resume();
            if (run !== this.run) return 'cancelled';
            if (alternative && (alternative.stage !== local.stage || alternative.id !== local.id)) {
              local = alternative; continue;
            }
          }
          this.cacheProblem = error instanceof Error ? error.message : String(error);
          if (usableFiles) {
            this.diagnostics.push(`Optional artwork upgrade deferred: ${this.cacheProblem}`);
            await this.prepare(usableFiles, run);
            if (run !== this.run) return 'cancelled';
            this.cacheResult = 'ready';
            this.report('ready', 'Original game assets loaded from this browser.', 1, 1);
            return 'ready';
          }
          this.cacheResult = 'invalid';
          if (downloading) throw error;
          this.report('awaiting-source', `${this.cacheProblem} Press Enter to retry using saved work, or choose another source.`);
          return 'invalid';
        }
      }
      if (!downloading) {
        this.ready = false;
        const message = restored === 'invalid' && this.cachedArtworkFiles > 0
          ? `Your ${this.cachedArtworkFiles} saved artwork files are still here, but this artwork-only cache does not include the original installer or MIX archives. ${this.cacheProblem.replace(' Download or import a complete copy of the game.', '')} Import your existing installer once, or confirm the archive URL and press Enter to save a reusable archive for future updates.`
          : restored === 'invalid' ? `${this.cacheProblem} Confirm the archive URL and press Enter to download complete game assets.`
          : restored === 'unavailable' ? 'Browser storage is unavailable. Confirm the archive URL and press Enter to download for this session.'
          : 'Confirm the archive URL and press Enter to download game assets.';
        this.report('awaiting-source', message);
        return restored;
      }
      this.controller = new AbortController();
      const downloaded = await archives.download(this.controller.signal, (message, loaded, total) => {
        if (run === this.run) this.report('download', message, loaded, total);
      });
      if (run !== this.run) return 'cancelled';
      await this.load(downloaded.files, run, archives, downloaded);
      return run === this.run && this.ready ? 'ready' : 'cancelled';
    } catch (error) { if (run === this.run) this.fail(error); return run === this.run ? 'invalid' : 'cancelled'; }
  }
  private storageWarning(stage: string, message: string | null): void {
    if (message) this.storageWarnings.set(stage, message); else this.storageWarnings.delete(stage);
    this.cacheWarning = [...this.storageWarnings.values()].join(' · ') || null;
  }
  private archiveDownload(run: number, source: string): AssetDownload {
    return new AssetDownload(source, () => run === this.run, (stage, message) => {
      if (run === this.run) this.storageWarning(stage, message);
    }, this.archiveMemory);
  }
  async importFiles(files: FileList | File[], options: AssetOptions = {}): Promise<void> {
    this.requiresNativeMaps ||= !!options.nativeMaps;
    this.cancel(); const run = this.run; this.error = null; this.storageWarnings.clear(); this.cacheWarning = null; this.ready = false;
    this.source = assetSourceUrl(options.url || this.source || DEFAULT_ASSET_URL); this.progress = options.onProgress ?? this.progress;
    const archives = this.archiveDownload(run, this.source);
    try {
      const inputs = Array.from(files, file => ({ name: file.name, blob: file }));
      if (!inputs.length) throw new Error('Choose the Red Alert 2 installer, or ra2.mix and language.mix.');
      const input = await archives.remember(inputs);
      if (run === this.run) await this.load(inputs, run, archives, input);
    } catch (error) { if (run === this.run) this.fail(error); }
  }
  cancel(): void {
    this.active = undefined;
    if (this.status.phase !== 'ready') this.ready = false;
    this.run++; this.controller?.abort(); this.controller = undefined;
    this.worker?.terminate(); this.worker = undefined;
    this.pendingReject?.(new Error('Asset loading cancelled')); this.pendingReject = undefined;
  }
  async clearCache(): Promise<void> {
    const key = assetCacheKey(this.source || DEFAULT_ASSET_URL);
    await assetCache(key, null);
    await this.archiveDownload(this.run, this.source || DEFAULT_ASSET_URL).clear();
    for (const alias of selectedAssetCacheKeys(this.source)) if (alias !== key) await assetCache(alias, null);
  }
  private fail(error: unknown): void {
    this.ready = false;
    this.error = error instanceof Error ? error.message : String(error);
    if (/Failed to fetch|NetworkError|Load failed/i.test(this.error)) this.error = 'Asset download could not reach the server. Retry, use a CORS-enabled asset URL, or import the installer / MIX files.';
    this.report('error', this.error);
  }
  private async load(files: ArchiveInput[], run: number, archives: AssetDownload, input: ArchiveResume): Promise<void> {
    if (!files.length) throw new Error('Choose the Red Alert 2 installer, or ra2.mix and language.mix.');
    const phase = input.stage.startsWith('mix') ? 'cache' : 'extract';
    this.report(phase, input.stage.startsWith('mix') ? 'Preparing saved game files from MIX archives…' : 'Opening the saved installer in the browser…');
    if (run !== this.run) return;
    let staged = input.stage.startsWith('mix') ? archives.extracted(input, files) : Promise.resolve();
    try {
      const selected = await new Promise<AssetFile[]>((resolve, reject) => {
        this.pendingReject = reject;
        const worker = new Worker(new URL('./extract.worker.ts', import.meta.url), { type: 'module' }); this.worker = worker;
        worker.onmessage = ({ data }) => {
          if (run !== this.run) return;
          if (data.kind === 'progress') this.report(phase, data.message);
          if (data.kind === 'mix') staged = staged.then(() => archives.extracted(input, data.files));
          if (data.kind === 'error') {
            worker.terminate(); this.worker = undefined; this.pendingReject = undefined;
            reject(data.invalidArchive ? new InvalidArchiveError(data.message) : new Error(data.message));
          }
          if (data.kind === 'complete') {
            this.diagnostics.splice(0, this.diagnostics.length, ...data.archives.map((a: { name: string; entries: number; encrypted: boolean }) => `${a.name}: ${a.entries} files${a.encrypted ? ' (encrypted index)' : ''}`));
            worker.terminate(); this.worker = undefined; this.pendingReject = undefined; resolve(data.files);
          }
        };
        worker.onerror = event => { if (run !== this.run) return; worker.terminate(); this.worker = undefined; this.pendingReject = undefined; reject(new Error(event.message || 'Browser archive extractor failed')); };
        worker.postMessage({ files, includeMixStage: !input.stage.startsWith('mix') });
      });
      await staged;
      if (run !== this.run) return;
      await this.prepare(selected, run);
      if (run !== this.run) return;
      // Save the small ready-to-render cache even if large archive writes hit quota.
      try {
        await assetCache(assetCacheKey(this.source), { version: CACHE_VERSION, files: selected, saved: Date.now(), ...(this.missingEnhancements.length ? { unavailableEnhancements: this.missingEnhancements } : {}) }, () => run === this.run);
        if (run === this.run) { this.storageWarning('selected-read', null); this.storageWarning('selected', null); }
      } catch (error) { if (run === this.run) this.storageWarning('selected', `Assets loaded; browser storage could not save selected artwork: ${error instanceof Error ? error.message : String(error)}`); }
      await archives.complete(input);
      if (run === this.run) this.report('ready', `Original game assets ready · ${selected.length} files${this.cacheWarning ? ' · cache unavailable for some stages' : ' saved in this browser'}`, 1, 1);
    } catch (error) {
      await staged;
      // Artwork selection/decoding belongs to the current catalog, not to the
      // container. A catalog bug must never invalidate completed downloads or
      // extracted MIX files; a later corrected build can reselect them locally.
      if (run === this.run && error instanceof InvalidArchiveError) {
        await archives.reject(input, error instanceof Error ? error.message : String(error));
      }
      throw error;
    }
  }
  private requiredFile(name: string): Uint8Array {
    const bytes = this.files.get(name);
    if (!bytes?.length) throw new Error(`Missing original asset: ${name}. Download or import a complete copy of the game.`);
    return bytes;
  }
  private decodeFile<T>(name: string, decode: (bytes: Uint8Array) => T): T {
    const bytes = this.requiredFile(name);
    try { return decode(bytes); }
    catch (error) { throw new Error(`Invalid original asset ${name}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  private validateShape(name: string, frames?: readonly number[]): ShpFile {
    try {
      const shape = this.shape(name);
      if (!shape) throw new Error(`Missing ${name}.shp (or theater alias)`);
      for (const frame of frames ?? Array.from({ length: shape.frameCount }, (_, i) => i)) {
        if (frame >= shape.frameCount) throw new Error(`Missing frame ${frame}`);
        shape.frame(frame);
      }
      return shape;
    } catch (error) { throw new Error(`Invalid original sprite ${name}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  private async prepare(files: AssetFile[], run = this.run): Promise<void> {
    this.ready = false; this.preparingRun = run;
    let validated = false;
    try {
      this.report('decode', 'Decoding original sprites, palettes and vehicle voxels…');
      if (run !== this.run) throw new Error('Asset loading cancelled');
      this.files = new Map(files.map(f => [f.name.toLowerCase(), f.bytes])); this.shapes.clear(); this.sprites.clear(); this.voxelModels.clear(); this.buildingAnchors.clear(); this.nativePalettes.clear(); this.theater = 'TEMPERATE';
      this.missingEnhancements = ['game.fnt', 'mouse.shp', 'mousepal.pal', 'palette.pal', 'pips.shp', 'pips2.shp', 'oregath.shp', 'anim.pal', 'tibtre01.tem', 'tree20.tem', 'plat02.tem', 'gapowrmk.shp',
        'side0/sidebar.pal', 'side0/uibkgd.pal', ...DIALOG_SHAPE_FILES.map(name => `side0/${name}.shp`), ...Object.values(DIALOG_PCX_FILES),
        ...EFFECT_ANIMATIONS.map(name => `${name}.shp`)].filter(name => !this.files.has(name));
      // Earlier selections omitted urban buildup/sale SHPs. Reselect them
      // from saved MIX archives through the existing optional-art upgrade.
      for (const spec of Object.values(CATALOG)) if (spec.kind === 'building') {
        const name = theaterNames(spec.sprite + 'mk', 'URBAN')[0] + '.shp';
        if (!this.files.has(name)) this.missingEnhancements.push(name);
      }
      // Native maps extend the selected-art cache. A missing theater causes
      // restore() to reuse the saved MIX stage and select the new files locally.
      // It never invalidates or downloads the original archive on page load.
      if (this.requiresNativeMaps) for (const theater of NATIVE_THEATERS) {
        for (const kind of ['iso', 'unit', 'overlay'] as const) this.nativePalette(theater, kind);
        const tile = nativeTileSpec(theater, 0); if (tile) this.requiredFile(tile.fileName);
        for (const type of ['caoild', 'caairp']) if (!this.nativeShape(theater, type)) throw new Error(`Missing original native structure: ${theater} ${type}. Import complete game MIX files.`);
      }
      this.art = readArtSections(this.requiredFile('art.ini'));
      this.buildingLoops = buildingLoops(this.requiredFile('art.ini'));
      this.effectDefinitions = {};
      this.infantry.clear();
      this.font = this.files.has('game.fnt') ? this.decodeFile('game.fnt', bytes => new NativeFont(bytes)) : null;
      this.cursors = this.files.has('mouse.shp') && this.files.has('mousepal.pal') ? this.decodeFile('mouse.shp', bytes => new NativeCursors(bytes, this.requiredFile('mousepal.pal'))) : null;
      this.pipPalette = this.files.has('palette.pal') ? this.decodeFile('palette.pal', decodePalette) : new Uint8Array();
      if (this.shape('pips')) this.validateShape('pips', [0, 1, 2, 4, 13, 14]);
      if (this.shape('pips2')) this.validateShape('pips2', [0, 2]);
      if (this.shape('oregath')) this.validateShape('oregath', Array.from({ length: 120 }, (_, i) => i));
      this.unitPalette = this.decodeFile('unittem.pal', decodePalette);
      this.cameoPalette = this.decodeFile('cameo.pal', decodePalette);
      this.terrainPalette = this.decodeFile('isotem.pal', decodePalette);
      this.orePalette = this.decodeFile('temperat.pal', decodePalette);
      this.animationPalette = this.files.has('anim.pal') ? this.decodeFile('anim.pal', decodePalette) : new Uint8Array();
      this.sidebarPalettes = this.files.has('side0/sidebar.pal') ? [this.decodeFile('side0/sidebar.pal', decodePalette)] : [];
      this.voxelLighting = this.decodeFile('voxels.vpl', bytes => {
        const levels = decodeVpl(bytes);
        if (levels.length !== 32 * 256) throw new Error('All 32 material lighting levels are required');
        return levels;
      });
      for (const [name, frames] of Object.entries(HUD_ASSET_FRAMES)) {
        if (!this.files.has(`side0/${name}.shp`)) { this.missingEnhancements.push(`side0/${name}.shp`); continue; }
        this.decodeFile(`side0/${name}.shp`, bytes => {
          const shape = new ShpFile(bytes);
          for (const frame of frames) {
            if (frame >= shape.frameCount) throw new Error(`Missing frame ${frame}`);
            shape.frame(frame);
          }
        });
      }
      if (this.files.has('side0/uibkgd.pal')) this.decodeFile('side0/uibkgd.pal', decodePalette);
      for (const name of DIALOG_SHAPE_FILES) if (this.files.has(`side0/${name}.shp`)) this.decodeFile(`side0/${name}.shp`, bytes => {
        const shape = new ShpFile(bytes);
        for (let frame = 0; frame < (name === 'sidebttn' ? 3 : 1); frame++) {
          if (frame >= shape.frameCount) throw new Error(`Missing frame ${frame}`);
          shape.frame(frame);
        }
      });
      for (const name of Object.values(DIALOG_PCX_FILES)) if (this.files.has(name)) this.decodeFile(name, decodePcx);
      for (const name of EFFECT_ANIMATIONS) {
        if (!this.shape(name) || !this.animationPalette.length) continue;
        const shape = this.validateShape(name), art = this.art.get(name), ticksPerFrame = nativeAnimationInterval(Number(art?.rate ?? 900));
        if (!ticksPerFrame) throw new Error(`Invalid original animation Rate: ${name}`);
        this.effectDefinitions[name] = { frames: shape.frameCount, ticksPerFrame, normalized: /^(yes|true|1)$/i.test(art?.normalized ?? '') };
      }
      // The renderer can select each authored road segment and terrain edge.
      // Mask 15 is never selected for an edge: at least one neighbor differs.
      for (const name of REQUIRED_TERRAIN) {
        if (!this.files.has(`${name}.tem`) && !['clear01', 'water01'].includes(name)) { this.missingEnhancements.push(`${name}.tem`); continue; }
        this.decodeFile(`${name}.tem`, bytes => {
        const frames = name === 'proad03' ? 9 : name.startsWith('proad') ? 3 : /^(glat|clat)/.test(name) ? 1 : 6;
        for (let frame = 0; frame < frames; frame++) decodeTmp(bytes, frame);
        });
      }
      if (this.files.has('water02.tem')) this.decodeFile('water02.tem', bytes => { for (let frame = 0; frame < 6; frame++) decodeTmp(bytes, frame); });
      let done = 0;
      for (const [name, spec] of Object.entries(CATALOG)) {
        if (spec.kind === 'vehicle') {
          this.decodeFile(`${spec.sprite}.vxl`, decodeVxl);
          this.decodeFile(`${spec.sprite}.hva`, decodeHva);
        } else this.validateShape(spec.sprite);
        if (spec.kind === 'infantry') {
          const definition = infantryArt(this.art, spec.sprite), shape = this.shape(spec.sprite)!;
          const bodyFrames = shape.frameCount > 1 && shape.frameCount % 2 === 0 ? shape.frameCount / 2 : shape.frameCount;
          for (const [action, sequence] of Object.entries(definition.sequences)) {
            if (sequence.start + sequence.stride * 7 + sequence.frames > bodyFrames) throw new Error(`Invalid original infantry frames: ${spec.sprite}.${action}`);
          }
          this.infantry.set(spec.sprite, definition);
        }
        if (name === 'gi') this.validateShape(spec.sprite, Array.from({ length: 71 }, (_, i) => 292 + i));
        this.validateShape(spec.cameo, [0]);
        if (spec.bib) this.validateShape(spec.bib);
        for (const overlay of spec.overlays ?? []) this.validateShape(overlay);
        if (spec.turret) { this.decodeFile(`${spec.turret}.vxl`, decodeVxl); this.decodeFile(`${spec.turret}.hva`, decodeHva); }
        if (!this.getSprite(name, 0, spec.sprite.startsWith('n') ? 1 : 0)) throw new Error(`Cannot render original sprite: ${spec.sprite}`);
        if (!this.getCameo(name)) throw new Error(`Cannot render original cameo: ${spec.cameo}`);
        this.report('decode', `Decoding ${name.replaceAll('_', ' ')}…`, ++done, Object.keys(CATALOG).length);
        await new Promise(resolve => setTimeout(resolve, 0));
        if (run !== this.run) throw new Error('Asset loading cancelled');
      }
      for (let variant = 0; variant < 6; variant++) { this.validateShape(`tib${String(variant + 1).padStart(2, '0')}`, [8]); if (!this.getOverlay('ore', variant)) throw new Error(`Cannot render original ore variant ${variant}`); }
      for (let variant = 0; variant < 8; variant++) { this.validateShape(`tree${String(variant + 1).padStart(2, '0')}`); if (!this.getOverlay('tree', variant)) throw new Error(`Cannot render original tree variant ${variant}`); }
      this.missingEnhancements.sort(); this.enhancementUpgrade = this.missingEnhancements.length > 0;
      validated = true;
    } finally {
      if (this.preparingRun === run) this.preparingRun = undefined;
      if (run === this.run) this.ready = validated;
    }
  }
  private spec(name: string): AssetSpec | undefined {
    name = name.toLowerCase().replace(/\.(shp|vxl)$/, '');
    return CATALOG[name] ?? Object.values(CATALOG).find(s => s.sprite === name || s.cameo === name || NATIVE_THEATERS.some(theater => theaterNames(s.sprite, theater).includes(name)));
  }
  /** Select gameplay artwork from [Map].Theater, including all building layers. */
  setTheater(theater: NativeTheater): void {
    if (theater === this.theater) return;
    const palette = this.nativePalette(theater, 'unit');
    this.theater = theater; this.unitPalette = palette;
    // Rendered sprites and foundation anchors depend on the chosen SHP/palette.
    // Decoded SHPs remain reusable because they are keyed by actual filename.
    this.sprites.clear(); this.buildingAnchors.clear();
  }
  private shape(name: string): ShpFile | undefined {
    // Terrain scenery is SHP data with a theater extension, distinct from the
    // TMP terrain templates which also use .tem and are decoded separately.
    const candidate = theaterNames(name, this.theater).flatMap(n => [n + '.shp', n + '.' + THEATER_EXTENSION[this.theater]]).find(n => this.files.has(n)); if (!candidate) return;
    let shape = this.shapes.get(candidate);
    if (!shape) { shape = new ShpFile(this.files.get(candidate)!); this.shapes.set(candidate, shape); }
    return shape;
  }
  getFont(): NativeFont | null {
    return this.font;
  }
  getCursors(): NativeCursors | null {
    return this.cursors;
  }
  getCameo(name: string): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    if (name === 'butchers' || name === 'george') return this.customArt?.getCameo(name) ?? null;
    const spec = this.spec(name), file = spec?.cameo ?? name.toLowerCase().replace(/\.shp$/, ''), key = `cameo:${file}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const shape = this.shape(file); if (!shape) { this.sprites.set(key, null); return null; }
    const frame = shape.frame(0), image = paint(frame, this.cameoPalette), result = sprite(image, 0, 0);
    this.sprites.set(key, result); return result;
  }
  getUIAsset(name: string, frame = 0, side = 0): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    const filename = name.toLowerCase().replace(/\.shp$/, ''), key = `ui:${side}:${filename}:${frame}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const bytes = this.files.get(`side${side}/${filename}.shp`); if (!bytes || !this.files.has(`side${side}/sidebar.pal`)) return null;
    const shape = new ShpFile(bytes), image = shape.frame(frame), result = canvas(shape.width, shape.height);
    result.getContext('2d')!.drawImage(paint(image, this.sidebarPalettes[side] ?? this.decodeFile(`side${side}/sidebar.pal`, decodePalette)), image.x, image.y);
    const value = sprite(result, 0, 0); this.sprites.set(key, value); return value;
  }
  /** Native dialog artwork, separate from sidebar palette and frame conventions. */
  getDialogAsset(name: string, frame = 0, side = 0): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    if (!DIALOG_ASSET_FRAMES[name]?.includes(frame)) return null;
    const key = `dialog:${side}:${name}:${frame}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const pcxFile = DIALOG_PCX_FILES[name as keyof typeof DIALOG_PCX_FILES];
    let result: HTMLCanvasElement;
    if (pcxFile) {
      if (!this.files.has(pcxFile)) return null;
      const image = this.decodeFile(pcxFile, decodePcx);
      result = paint({ ...image, x: 0, y: 0, canvasWidth: image.width, canvasHeight: image.height }, image.palette);
    } else {
      const filename = ({ 'options-small': 'bkgdsm', 'options-medium': 'bkgdmd', 'options-large': 'bkgdlg', 'options-button': 'sidebttn' } as Record<string, string>)[name];
      if (!this.files.has(`side${side}/${filename}.shp`) || !this.files.has(`side${side}/${name === 'options-button' ? 'sidebar' : 'uibkgd'}.pal`)) return null;
      const shape = this.decodeFile(`side${side}/${filename}.shp`, bytes => new ShpFile(bytes)), image = shape.frame(frame);
      const palette = name === 'options-button' ? this.decodeFile(`side${side}/sidebar.pal`, decodePalette) : this.decodeFile(`side${side}/uibkgd.pal`, decodePalette);
      result = canvas(shape.width, shape.height);
      result.getContext('2d')!.drawImage(paint(image, palette), image.x, image.y);
    }
    const value = sprite(result, 0, 0); this.sprites.set(key, value); return value;
  }
  /** Original OREGATH.SHP: eight facings, fifteen frames at one logic tick each.
   * game.exe 0x700e70/0x7011d4 draws this with ANIM.PAL while harvesting. */
  getHarvestSprite(facing: number, time: number): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    if (!this.animationPalette.length) return null;
    const direction = ((Math.round(facing) % 8) + 8) % 8;
    const index = direction * 15 + Math.max(0, Math.floor(time * 30 + 1e-8)) % 15;
    const key = `harvest:${index}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const shape = this.shape('oregath'); if (!shape) return null;
    const frame = shape.frame(index);
    const result = sprite(paint(frame, this.animationPalette), shape.width / 2 - frame.x, shape.height / 2 - frame.y);
    this.sprites.set(key, result); return result;
  }
  /** RA2 game.exe 0x6d5440 selects PIPS frames 13/14; cargo uses PIPS2 0/2.
   * Both are drawn with PALETTE.PAL, not a side-remapped unit palette. */
  getPipSprite(kind: 'veteran' | 'elite' | 'cargo-empty' | 'cargo-ore' | 'building-empty' | 'building-green' | 'building-yellow' | 'building-red'): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    if (!this.pipPalette.length) return null;
    const name = kind.startsWith('cargo-') ? 'pips2' : 'pips';
    const index = { veteran: 13, elite: 14, 'cargo-empty': 0, 'cargo-ore': 2, 'building-empty': 0, 'building-green': 1, 'building-yellow': 2, 'building-red': 4 }[kind];
    const key = `pip:${kind}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const shape = this.shape(name); if (!shape) return null;
    const frame = shape.frame(index), result = sprite(paint(frame, this.pipPalette), 0, 0);
    this.sprites.set(key, result); return result;
  }
  getAnimationDefinitions(): Record<string, NativeAnimationDefinition> {
    return Object.fromEntries(Object.entries(this.effectDefinitions).map(([name, definition]) => [name, { ...definition }]));
  }
  getInfantryAnimationDefinitions(): Record<string, { sequences: Record<string, NativeAnimationDefinition & { facing?: number }>; fireFrame: number; idleFrequency: number }> {
    const idleFrequency = Number(readArtSections(this.files.get('rules.ini')).get('general')?.idleactionfrequency ?? .15);
    return Object.fromEntries([...this.infantry].map(([name, definition]) => [name, {
      fireFrame: definition.fireFrame, idleFrequency,
      sequences: Object.fromEntries(Object.entries(definition.sequences).map(([action, sequence]) => [action, { frames: sequence.frames, ticksPerFrame: sequence.ticksPerFrame, normalized: sequence.normalized, ...(sequence.facing === undefined ? {} : { facing: sequence.facing }) }])),
    }]));
  }
  getInfantrySequence(name: string, action: string, facing: number, ageSeconds: number, side = 0, speedIndex = NATIVE_SPEED_INDEX): Sprite | null {
    if (name === 'george') return this.ready ? this.customArt?.getInfantrySequence(action, facing, ageSeconds) ?? null : null;
    const spec = this.spec(name); if (!spec) return null;
    const sequence = this.infantry.get(spec.sprite)?.sequences[action]; if (!sequence) return null;
    return this.getInfantryFrame(name, infantrySequenceFrame(sequence, action, facing, ageSeconds, speedIndex), side);
  }
  /** Non-looping original impact/death SHP, using its own animation palette. */
  getAnimationSprite(name: string, ageSeconds: number, ticksPerFrame?: number): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    name = name.toLowerCase();
    const definition = this.effectDefinitions[name]; if (!definition) return null;
    const timing = ticksPerFrame === undefined ? definition : { ...definition, ticksPerFrame, normalized: false };
    const index = nativeAnimationFrame(timing, ageSeconds), key = `animation:${name}:${index}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const shape = this.shape(name); if (!shape) return null;
    const frame = shape.frame(index), result = sprite(paint(frame, this.animationPalette), shape.width / 2 - frame.x, shape.height / 2 - frame.y);
    this.sprites.set(key, result); return result;
  }
  getAnimationOpacity(name: string): number {
    const value = Number(this.art.get(name.toLowerCase())?.translucency ?? 0);
    return Number.isFinite(value) ? 1 - Math.max(0, Math.min(100, value)) / 100 : 1;
  }
  getSprite(name: string, frame = 0, side = 0): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    if (name === 'butchers' || name === 'george') return this.customArt?.getSprite(name, frame) ?? null;
    name = name.toLowerCase().replace(/\.(shp|vxl)$/, '');
    const spec = this.spec(name); if (!spec) return this.getDecoration(name, frame);
    frame = spec.kind === 'infantry' ? Math.max(0, Math.floor(frame)) : ((Math.floor(frame) % 32) + 32) % 32;
    const key = `${spec.sprite}:${spec.kind === 'building' && !spec.turret ? 0 : frame % (spec.kind === 'infantry' ? 56 : 32)}:${side}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    let result: Sprite | null = null;
    try {
      if (spec.kind === 'vehicle') result = this.renderVehicle(spec.sprite, frame % 32, side);
      else {
        const shape = this.shape(spec.sprite);
        if (shape) {
          if (spec.kind === 'building') result = this.renderBuilding(shape, spec, side, frame);
          else {
            const [start, stride] = idleFrames[spec.sprite] ?? [0, 1];
            const index = frame < 8 ? start + frame * stride : (spec.sprite === 'rock' ? 292 : 8) + (frame % 8) * 6 + Math.floor((frame - 8) / 8) % 6;
            return this.getInfantryFrame(spec.sprite, index, side);
          }
        }
      }
    } catch (error) { this.diagnostics.push(`${name}: ${error instanceof Error ? error.message : String(error)}`); }
    if (result) result = trimSprite(result);
    this.sprites.set(key, result); return result;
  }
  /** Exact authored SHP frame, with matching shadow and a stable ground anchor. */
  getInfantryFrame(name: string, frame: number, side = 0): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    if (name === 'george') return this.customArt?.getInfantryFrame(frame) ?? null;
    const spec = this.spec(name);
    if (spec?.kind !== 'infantry' || !Number.isInteger(frame) || frame < 0) return null;
    const key = `infantry:${spec.sprite}:${frame}:${side}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    let result: Sprite | null = null;
    try {
      const shape = this.shape(spec.sprite);
      if (!shape) return null;
      const hasShadow = shape.frameCount > 1 && shape.frameCount % 2 === 0;
      if (frame >= shape.frameCount / (hasShadow ? 2 : 1)) return null;
      const image = shape.frame(frame), lift = spec.sprite === 'rock' ? 26 : 0;
      const source = canvas(shape.width, shape.height + lift), ctx = source.getContext('2d')!;
      if (hasShadow) { const shade = shape.frame(frame + shape.frameCount / 2); ctx.drawImage(shadow(shade), shade.x, shade.y + lift); }
      ctx.drawImage(paint(image, this.unitPalette, side), image.x, image.y);
      result = trimSprite(sprite(source, shape.width / 2, shape.height / 2 + lift));
    } catch (error) { this.diagnostics.push(`${name} frame ${frame}: ${error instanceof Error ? error.message : String(error)}`); }
    this.sprites.set(key, result); return result;
  }
  getBuildingSprite(name: string, time = 0, side = 0, speedIndex = NATIVE_SPEED_INDEX): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    if (name === 'butchers') return this.customArt?.getSprite(name) ?? null;
    const spec = this.spec(name);
    if (!spec || spec.kind !== 'building' || spec.turret) return this.getSprite(name, 0, side);
    const shape = this.shape(spec.sprite); if (!shape) return null;
    const frames = (spec.overlays ?? []).map(name => {
      const overlay = this.shape(name);
      return overlay ? buildingLoopFrame(this.buildingLoops.get(name), time, overlay.frameCount > 1 && overlay.frameCount % 2 === 0 ? overlay.frameCount / 2 : overlay.frameCount, speedIndex) : 0;
    });
    if (frames.every(frame => frame === 0)) return this.getSprite(name, 0, side);
    // The key contains discrete loop frames, never elapsed time. Once the
    // finite set repeats its canvases/textures are reused on every later loop.
    const key = `building:${spec.sprite}:${side}:${frames.join(',')}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const result = trimSprite(this.renderBuilding(shape, spec, side, 0, frames));
    this.sprites.set(key, result); return result;
  }
  /** Sale replays the original buildup SHP backwards, including its own shadow. */
  getBuildingSellSprite(name: string, progress: number, side = 0): Sprite | null {
    const spec = this.spec(name);
    if (!this.ready || !spec || spec.kind !== 'building') return this.getBuildingSprite(name, 0, side);
    const buildup = this.art.get(spec.sprite)?.buildup?.toLowerCase() ?? spec.sprite + 'mk';
    const shape = this.shape(buildup), base = this.shape(spec.sprite);
    // Older artwork-only caches can retain the original standing building
    // during its sale without blocking the game on an optional MK asset.
    if (!shape || !base) return this.getBuildingSprite(name, 0, side);
    const frames = shape.frameCount > 1 && shape.frameCount % 2 === 0 ? shape.frameCount / 2 : shape.frameCount;
    const frame = buildingSaleFrame(progress, frames), key = `sell:${buildup}:${side}:${frame}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    this.getSprite(name, 0, side); // Establish the standing foundation's stable anchor.
    const source = canvas(shape.width, shape.height), ctx = source.getContext('2d')!;
    if (shape.frameCount === frames * 2) { const shade = shape.frame(frame + frames); ctx.drawImage(shadow(shade), shade.x, shade.y); }
    const image = shape.frame(frame); ctx.drawImage(paint(image, this.unitPalette, side), image.x, image.y);
    const anchorY = (this.buildingAnchors.get(spec.sprite) ?? base.height / 2) + (shape.height - base.height) / 2;
    const result = trimSprite(sprite(source, shape.width / 2, anchorY));
    this.sprites.set(key, result); return result;
  }
  /** Hull and turret use independent, quantized original VXL orientations. */
  getVehicleSprite(name: string, hull: number, turret: number, side = 0): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    const spec = this.spec(name); if (spec?.kind !== 'vehicle') return null;
    hull = ((Math.round(hull) % 32) + 32) % 32; turret = ((Math.round(turret) % 32) + 32) % 32;
    if (hull === turret) return this.getSprite(name, hull, side);
    // Floating point angles never become cache keys: each model/side has at
    // most 32×32 authored facing combinations, created only when displayed.
    const key = `vehicle:${spec.sprite}:${hull}:${turret}:${side}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const rendered = this.renderVehicle(spec.sprite, hull, side, true, turret);
    const result = rendered ? trimSprite(rendered) : null; this.sprites.set(key, result); return result;
  }
  private renderBuilding(shape: ShpFile, spec: AssetSpec, side: number, facing: number, overlayFrames: number[] = []): Sprite {
    const result = canvas(shape.width, shape.height), ctx = result.getContext('2d')!;
    const layers = [{ shape: spec.bib ? this.shape(spec.bib) : undefined, frame: 0 }, { shape, frame: 0 }, ...(spec.overlays ?? []).map((name, index) => ({ shape: this.shape(name), frame: overlayFrames[index] ?? 0 }))].filter((layer): layer is { shape: ShpFile; frame: number } => !!layer.shape);
    const draw = ({ shape: s, frame: index }: { shape: ShpFile; frame: number }, isShadow = false) => {
      const frame = s.frame(index + (isShadow ? s.frameCount / 2 : 0));
      ctx.drawImage(isShadow ? shadow(frame) : paint(frame, this.unitPalette, side), frame.x + (shape.width - s.width) / 2, frame.y + (shape.height - s.height) / 2);
    };
    for (const layer of layers) if (layer.shape.frameCount > 1 && layer.shape.frameCount % 2 === 0) draw(layer, true);
    for (const layer of layers) draw(layer);
    // Ground origin is the centre of the isometric foundation diamond.
    const foundation = spec.footprint ?? [2, 2], pixels = ctx.getImageData(0, 0, result.width, result.height).data;
    let bottom = result.height - 1;
    // Some source canvases (notably the Soviet barracks) have a large empty
    // footer. The painted foundation, rather than the canvas, defines ground.
    while (bottom > 0) {
      let painted = false;
      for (let x = 0; x < result.width; x++) if (pixels[(bottom * result.width + x) * 4 + 3] > 128) { painted = true; break; }
      if (painted) break; bottom--;
    }
    // Loading prepares frame zero first. Keep that foundation origin for all
    // animation frames even when a flag/shadow changes its painted bounds.
    const anchorY = this.buildingAnchors.get(spec.sprite) ?? bottom + 5 - (foundation[0] + foundation[1]) * 7.5;
    this.buildingAnchors.set(spec.sprite, anchorY);
    if (spec.turret) {
      const turret = this.renderVehicle(spec.turret, facing % 32, side, false);
      if (turret) ctx.drawImage(turret.source, result.width / 2 - turret.anchorX, anchorY - turret.anchorY);
    }
    return sprite(result, result.width / 2, anchorY);
  }
  getTerrain(terrain: string, variant = 0): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    const names = /^(proad|green|ruff|sandy|glat|clat|shore|dlat|plat|water|pvclr|clear)\d+$/.test(terrain) ? [terrain] : terrain === 'water' ? ['water01', 'water02'] : terrain === 'road' ? ['pave01'] : terrain === 'sand' ? ['green01', 'sand01', 'rough01'] : terrain === 'rock' ? ['ruff01', 'rough01', 'rough02'] : ['clear01'];
    const available = names.filter(name => this.files.has(name + '.tem'));
    const name = available[terrain === 'sand' || terrain === 'rock' ? 0 : variant % available.length], key = `terrain:${name}:${variant % 16}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const bytes = this.files.get(name + '.tem'); if (!bytes) return null;
    try { const frame = decodeTmp(bytes, variant), result = sprite(paint(frame, this.terrainPalette), 30, 15); this.sprites.set(key, result); return result; }
    catch { return null; }
  }
  private nativePalette(theater: string, kind: 'iso' | 'unit' | 'overlay'): Uint8Array {
    const suffix = theater === 'SNOW' ? 'sno' : theater === 'URBAN' ? 'urb' : 'tem';
    const name = kind === 'overlay' ? (theater === 'SNOW' ? 'snow.pal' : theater === 'URBAN' ? 'urban.pal' : 'temperat.pal') : `${kind}${suffix}.pal`;
    let palette = this.nativePalettes.get(name);
    if (!palette) { palette = decodePalette(this.requiredFile(name)); this.nativePalettes.set(name, palette); }
    return palette;
  }
  /** Decode the exact authored native template/subtile; never substitute a terrain category. */
  getNativeTerrain(theater: NativeTheater, tileIndex: number, subTile: number): Sprite | null {
    const spec = nativeTileSpec(theater, tileIndex);
    if (!this.ready || !spec) return null;
    // Existing native-map caches predate pavement LAT selection. Keep their
    // original pavement available while a saved archive supplies the new edges.
    if (spec.fileName.startsWith('plat') && !this.files.has(spec.fileName)) return this.getNativeTerrain(theater, theater === 'SNOW' ? 734 : 534, 0);
    const key = `native-tile:${spec.fileName}:${subTile}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const bytes = this.requiredFile(spec.fileName), data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const count = data.getUint32(0, true) * data.getUint32(4, true);
    if (subTile < 0 || subTile >= count) throw new Error(`Invalid native subtile ${spec.fileName}:${subTile}`);
    const frame = decodeTmp(bytes, subTile), result = sprite(paint(frame, this.nativePalette(theater, 'iso')), 30, 15);
    this.sprites.set(key, result); return result;
  }
  private nativeShape(theater: NativeTheater, name: string): ShpFile | undefined {
    const extension = THEATER_EXTENSION[theater];
    name = name.toLowerCase();
    const variants = theaterNames(name, theater);
    const filename = variants.flatMap(value => [`${value}.${extension}`, `${value}.shp`]).find(value => this.files.has(value));
    if (!filename) return;
    let shape = this.shapes.get(filename);
    if (!shape) { shape = new ShpFile(this.requiredFile(filename)); this.shapes.set(filename, shape); }
    return shape;
  }
  getNativeOverlay(theater: NativeTheater, index: number, data = 0): Sprite | null {
    const spec = nativeOverlaySpec(index);
    return spec ? this.getNativeDecoration(theater, spec.name, data, true) : null;
  }
  getNativeDecoration(theater: NativeTheater, name: string, frame = 0, overlay = false): Sprite | null {
    if (!this.ready) return null;
    const key = `native-decoration:${theater}:${name}:${frame}:${overlay}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const shape = this.nativeShape(theater, name); if (!shape) return null;
    if (frame >= shape.frameCount) throw new Error(`Invalid native overlay frame ${name}:${frame}`);
    const image = shape.frame(frame), source = canvas(shape.width, shape.height), ctx = source.getContext('2d')!;
    if (!overlay && shape.frameCount > 1 && shape.frameCount % 2 === 0) {
      const shade = shape.frame(frame + shape.frameCount / 2); ctx.drawImage(shadow(shade), shade.x, shade.y);
    }
    // The mechanical ore drill uses unit colors. Terrain/ISO colors turn its
    // opaque metal pixels into cyan/yellow bands that look like a ghost.
    ctx.drawImage(paint(image, this.nativePalette(theater, overlay ? 'overlay' : /^tibtre\d+$/i.test(name) ? 'unit' : 'iso')), image.x, image.y);
    const result = trimSprite(sprite(source, shape.width / 2, shape.height / 2 + (overlay ? 15 : 0)));
    this.sprites.set(key, result); return result;
  }
  getBuildingHeight(name: string): number {
    return Number(this.art.get(this.spec(name)?.sprite ?? name.toLowerCase())?.height ?? 2);
  }
  getNativeFoundation(type: string): [number, number] {
    const art = this.art.get(type.toLowerCase()), match = /^(\d+)x(\d+)$/i.exec(art?.foundation ?? '');
    return match ? [Number(match[1]), Number(match[2])] : type.toUpperCase() === 'CAAIRP' ? [3, 3] : [2, 2];
  }
  getNativeStructure(theater: NativeTheater, type: string, time = 0, side = -1, speedIndex = NATIVE_SPEED_INDEX): Sprite | null {
    if (!this.ready) return null;
    type = type.toLowerCase();
    const art = this.art.get(type), shape = this.nativeShape(theater, art?.image ?? type); if (!shape) return null;
    const overlayNames = Object.entries(art ?? {}).filter(([name]) => /^(activeanim(?:two|three|four)?|idleanim\d*|bibshape)$/i.test(name)).map(([, name]) => name.toLowerCase());
    const layers = [{ shape, frame: 0, side: -1 }, ...overlayNames.flatMap(name => {
      const overlay = this.nativeShape(theater, this.art.get(name)?.image ?? name); if (!overlay) return [];
      const frames = overlay.frameCount > 1 && overlay.frameCount % 2 === 0 ? overlay.frameCount / 2 : overlay.frameCount;
      return [{ shape: overlay, frame: buildingLoopFrame(this.buildingLoops.get(name), time, frames, speedIndex), side: name.endsWith('_f') ? side : -1 }];
    })];
    const key = `native-building:${theater}:${type}:${side}:${layers.map(layer => layer.frame).join(',')}`;
    if (this.sprites.has(key)) return this.sprites.get(key)!;
    const source = canvas(shape.width, shape.height), ctx = source.getContext('2d')!;
    const draw = (layer: typeof layers[number], isShadow: boolean) => {
      const frame = layer.shape.frame(layer.frame + (isShadow ? layer.shape.frameCount / 2 : 0));
      ctx.drawImage(isShadow ? shadow(frame) : paint(frame, this.nativePalette(theater, 'unit'), layer.side), frame.x + (shape.width - layer.shape.width) / 2, frame.y + (shape.height - layer.shape.height) / 2);
    };
    for (const layer of layers) if (layer.shape.frameCount > 1 && layer.shape.frameCount % 2 === 0) draw(layer, true);
    for (const layer of layers) draw(layer, false);
    // The base shape owns the ground anchor; moving flags cannot shift it.
    const base = shape.frame(0), foundation = this.getNativeFoundation(type);
    let bottom = base.height - 1;
    while (bottom > 0 && !base.pixels.subarray(bottom * base.width, (bottom + 1) * base.width).some(index => index > 1)) bottom--;
    const result = trimSprite(sprite(source, source.width / 2, base.y + bottom + 5 - (foundation[0] + foundation[1]) * 7.5));
    this.sprites.set(key, result); return result;
  }

  getDecoration(name: string, frame = 0): Sprite | null {
    if (!this.ready && this.preparingRun !== this.run) return null;
    const key = `decoration:${name}:${frame}`; if (this.sprites.has(key)) return this.sprites.get(key)!;
    const shape = this.shape(name); if (!shape) return null;
    const isOre = /^(tib|gem)\d/.test(name);
    const image = shape.frame(frame), groundY = shape.height / 2 + (isOre ? 15 : 0);
    const palette = isOre ? this.orePalette : /^tree\d/.test(name) ? this.terrainPalette : this.unitPalette;
    let result: Sprite;
    if (/^tree\d/.test(name) && shape.frameCount > 1 && shape.frameCount % 2 === 0) {
      const source = canvas(shape.width, shape.height), ctx = source.getContext('2d')!, shade = shape.frame(frame + shape.frameCount / 2);
      ctx.drawImage(shadow(shade), shade.x, shade.y); ctx.drawImage(paint(image, palette), image.x, image.y);
      result = sprite(source, shape.width / 2, groundY);
    } else result = sprite(paint(image, palette), shape.width / 2 - image.x, groundY - image.y);
    this.sprites.set(key, result); return result;
  }
  getOverlay(kind: 'ore' | 'tree', variant = 0): Sprite | null {
    return this.getDecoration(kind === 'ore' ? `tib${String(variant % 6 + 1).padStart(2, '0')}` : `tree${String(variant % 8 + 1).padStart(2, '0')}`, kind === 'ore' ? 8 : 0);
  }
  private vehicleModel(name: string): PreparedVoxel[] {
    if (this.voxelModels.has(name)) return this.voxelModels.get(name)!;
    const result: PreparedVoxel[] = [];
    for (const part of [name, name + 'tur', name + 'barl']) {
      const bytes = this.files.get(part + '.vxl'); if (!bytes) continue;
      const transforms = this.decodeFile(part + '.hva', decodeHva);
      for (const limb of decodeVxl(bytes)) this.prepareLimb(limb, transforms.get(limb.name), result, part !== name);
    }
    this.voxelModels.set(name, result); return result;
  }
  private prepareLimb(limb: VoxelLimb, transform: number[] | undefined, result: PreparedVoxel[], turret = false): void {
    const [sx, sy, sz] = limb.size, b = limb.bounds, scale = [(b[3] - b[0]) / sx, (b[4] - b[1]) / sy, (b[5] - b[2]) / sz];
    for (const v of limb.voxels) {
      let x = b[0] + (v.x + .5) * scale[0], y = b[1] + (v.y + .5) * scale[1], z = b[2] + (v.z + .5) * scale[2];
      const n = v.normal * 3;
      let nx = RA2_NORMALS[n] ?? 0, ny = RA2_NORMALS[n + 1] ?? 0, nz = RA2_NORMALS[n + 2] ?? 1;
      if (transform) {
        const t = transform;
        [x, y, z] = [t[0] * x + t[1] * y + t[2] * z + t[3] * scale[0] * limb.scale, t[4] * x + t[5] * y + t[6] * z + t[7] * scale[1] * limb.scale, t[8] * x + t[9] * y + t[10] * z + t[11] * scale[2] * limb.scale];
        [nx, ny, nz] = [t[0] * nx + t[1] * ny + t[2] * nz, t[4] * nx + t[5] * ny + t[6] * nz, t[8] * nx + t[9] * ny + t[10] * nz];
      }
      // VXL's lateral axis is opposite the map's. Transform normals along with
      // geometry; their authored indices carry the tank's beveled armor detail.
      result.push({ x, y: -y, z, color: v.color, nx, ny: -ny, nz, turret });
    }
  }
  private renderVehicle(name: string, facing: number, side: number, castShadow = true, turretFacing = facing): Sprite | null {
    const model = this.vehicleModel(name); if (!model.length) return null;
    const size = 144, result = canvas(size, size), ctx = result.getContext('2d')!, output = ctx.createImageData(size, size), depth = new Float32Array(size * size).fill(-Infinity);
    const angle = facing / 32 * Math.PI * 2, cs = Math.cos(angle), sn = Math.sin(angle), center = size / 2, ground = size / 2 + 12;
    const turretAngle = turretFacing / 32 * Math.PI * 2, tcs = Math.cos(turretAngle), tsn = Math.sin(turretAngle);
    if (castShadow) for (const voxel of model) {
      const cosine = voxel.turret ? tcs : cs, sine = voxel.turret ? tsn : sn;
      const x = voxel.x * cosine - voxel.y * sine, y = voxel.x * sine + voxel.y * cosine;
      const px = Math.round(center + (x - y) * Math.SQRT1_2 + voxel.z * .55), py = Math.round(ground + (x + y) * Math.SQRT1_2 * .5 + voxel.z * .15);
      if (px >= 0 && py >= 0 && px < size && py < size) output.data[(py * size + px) * 4 + 3] = 105;
    }
    for (const voxel of model) {
      const cosine = voxel.turret ? tcs : cs, sine = voxel.turret ? tsn : sn;
      const x = voxel.x * cosine - voxel.y * sine, y = voxel.x * sine + voxel.y * cosine, z = voxel.z;
      const px = Math.round(center + (x - y) * .7071), py = Math.round(ground + (x + y) * .35355 - z * .866), distance = x + y + z * .8165;
      const nx = voxel.nx * cosine - voxel.ny * sine, ny = voxel.nx * sine + voxel.ny * cosine;
      // VPL encodes the material response (including metallic highlights).
      // Scaling the source RGB loses those highlights and flattens tank armor.
      // Retail light direction reconstructed by ThomasSneddon's VXL renderer;
      // Y is flipped here with the model's lateral axis, not Z. Overhead light
      // sends most roof normals into VPL's white specular band.
      const diffuse = Math.max(0, nx * .2013022 + ny * .9101138 - voxel.nz * .3621709);
      const halfDot = nx * .178224 + ny * .805757 + voxel.nz * .564725;
      const specular = Math.max(0, halfDot / (3 - 2 * halfDot));
      const level = Math.min(31, Math.floor(16 * (diffuse + specular)));
      const c = this.voxelLighting[level * 256 + voxel.color], remap = c >= 16 && c <= 31, p = c * 3;
      const color = remap ? SIDE_REMAPS[side % SIDE_REMAPS.length][c - 16] : [this.unitPalette[p], this.unitPalette[p + 1], this.unitPalette[p + 2]];
      // A projected voxel covers one native pixel. The old 2x2 stamp overwrote
      // neighboring armor/track detail with the same color and thickened guns.
      if (px < 0 || py < 0 || px >= size || py >= size) continue;
      const index = py * size + px; if (depth[index] > distance) continue; depth[index] = distance;
      for (let ch = 0; ch < 3; ch++) output.data[index * 4 + ch] = color[ch];
      output.data[index * 4 + 3] = 255;
    }
    ctx.putImageData(output, 0, 0); return sprite(result, center, ground);
  }
}
