import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ assets: {} as any, game: {} as any, renderer: {} as any, actions: {} as any, status: {} as any, customArt: vi.fn(), music: vi.fn(), resetAudio: vi.fn(), loading: true, modal: false, runtimeError: '', frame: (_now: number) => {}, visibility: () => {} }));
vi.mock('../src/assets/CustomArt', () => ({ CustomArt: { load: harness.customArt } }));
vi.mock('../src/game/Game', () => ({ Game: class { constructor() { return harness.game; } } }));
vi.mock('../src/game/Audio', () => ({ GameAudio: class { unlock() {} reset() { harness.resetAudio(); } setMusicPlaying(active: boolean) { harness.music(active); } notifications() {} effects() {} } }));
vi.mock('../src/render/Renderer', () => ({ Renderer: class { constructor() { return harness.renderer; } } }));
vi.mock('../src/input/Controls', () => ({ detectMobile: () => false, Controls: class { tick() {} cancelPlacement() {} setMode() {} } }));
vi.mock('../src/dev/LocalTools', () => ({ installLocalTools: vi.fn() }));
vi.mock('../src/assets/AssetManager', () => ({
  DEFAULT_ASSET_URL: 'https://example.test/game.exe', assetSourceUrl: (url: string) => url,
  HUD_ASSET_FRAMES: { side1: [0], radar: [32], tab00: [1, 2] },
  DIALOG_ASSET_FRAMES: { 'options-medium': [0], 'options-button': [0, 1, 2] },
  AssetManager: class { constructor() { return harness.assets; } },
}));
vi.mock('../src/ui/UI', () => ({ UI: class {
  constructor(_game: unknown, actions: unknown) { harness.actions = actions; }
  setLoading(value: boolean) { harness.loading = value; }
  setAssetStatus(status: unknown) { harness.status = status; }
  setAssetSource() {} setZoom() {} setCameo() {} setChrome() {} setFont() {} setCursors() {} setCursor() {} update() {}
  isModalOpen() { return harness.modal; }
  showRuntimeError(message: string) { harness.runtimeError = message; harness.loading = true; }
} }));

const settle = () => new Promise(resolve => setTimeout(resolve, 0));
beforeEach(() => {
  vi.resetModules(); harness.loading = true; harness.status = {}; harness.modal = false; harness.runtimeError = '';
  harness.customArt.mockReset().mockResolvedValue({}); harness.music.mockClear(); harness.resetAudio.mockClear();
  harness.game = { defs: {}, state: { time: 0, speed: 1, events: [], effects: [] } };
  harness.game.tick = vi.fn((dt: number) => { harness.game.state.time += dt; });
  harness.game.setAnimationDefinitions = vi.fn();
  harness.game.restart = vi.fn(() => { harness.game.state.time = 0; });
  harness.renderer = { camera: { zoom: 1, center: vi.fn() }, render: vi.fn() };
  const ready = async (options: any) => {
    harness.assets.ready = true;
    harness.assets.status = { phase: 'ready', message: 'Saved files restored.', loaded: 1, total: 1 };
    options.onProgress?.(harness.assets.status);
    return 'ready';
  };
  harness.assets = { ready: false, status: { phase: 'cache' }, initialize: vi.fn(ready), download: vi.fn(ready), importFiles: vi.fn((_files: unknown, options: unknown) => ready(options)), getFont: () => ({}), getCursors: () => ({}), getUIAsset: vi.fn(() => ({ source: { toDataURL: () => 'data:image/png;base64,fixture' } })) };
  harness.assets.getDialogAsset=harness.assets.getUIAsset;
  harness.assets.getAnimationDefinitions=()=>({piffpiff:{frames:12,ticksPerFrame:1}});
  harness.assets.getInfantryAnimationDefinitions=()=>({});
  vi.stubGlobal('navigator', { storage: { persist: vi.fn(async () => false) } });
  vi.stubGlobal('window', {});
  vi.stubGlobal('document', { querySelector: () => ({}), hidden: false, addEventListener: (_name: string, callback: () => void) => { harness.visibility = callback; } });
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
  vi.stubGlobal('requestAnimationFrame', (frame: (now: number) => void) => { harness.frame = frame; return 1; });
});
afterEach(() => vi.unstubAllGlobals());

describe('startup authorization', () => {
  it('restores cached artwork while keeping the first-open gate and battle clock stopped', async () => {
    await import('../src/main'); await settle();
    expect(harness.assets.initialize).toHaveBeenCalledOnce();
    expect(harness.customArt).toHaveBeenCalledOnce();
    expect(harness.assets.customArt).toEqual({});
    expect(harness.assets.getUIAsset).toHaveBeenCalled();
    expect(harness.game.setAnimationDefinitions).toHaveBeenCalledWith({piffpiff:{frames:12,ticksPerFrame:1}},{});
    expect(harness.assets.download).not.toHaveBeenCalled();
    expect(navigator.storage.persist).not.toHaveBeenCalled();
    harness.frame(performance.now() + 100);
    expect(harness.loading).toBe(true);
    expect(harness.game.state.time).toBe(0);
    expect(harness.game.tick).not.toHaveBeenCalled();
    expect(harness.music).toHaveBeenLastCalledWith(false);
  });

  it('starts battle only after explicit Continue and shares duplicate submissions', async () => {
    await import('../src/main'); await settle();
    harness.actions.onAssetRetry('https://example.test/game.exe');
    harness.actions.onAssetRetry('https://example.test/game.exe');
    await settle();
    expect(harness.assets.download).toHaveBeenCalledOnce();
    expect(navigator.storage.persist).toHaveBeenCalledOnce();
    expect(harness.loading).toBe(false);
    expect(harness.music).toHaveBeenLastCalledWith(true);
    harness.frame(performance.now() + 100);
    expect(harness.game.state.time).toBeGreaterThan(0);
  });

  it('reports missing bundled PNGs without blaming the user’s original archives or starting the battle', async () => {
    harness.customArt.mockRejectedValue(new Error('Unable to load bundled artwork /art/butchers/george-sheet.png. Reload the page to retry.'));
    await import('../src/main'); await settle();
    expect(harness.runtimeError).toContain('Unable to load bundled artwork');
    expect(harness.assets.initialize).not.toHaveBeenCalled();
    expect(harness.assets.download).not.toHaveBeenCalled();
    expect(harness.status.error).toBeUndefined();
    harness.frame(performance.now() + 100);
    expect(harness.game.tick).not.toHaveBeenCalled();
    expect(harness.loading).toBe(true);
  });

  it('does not wait for the browser persistence decision before entering with imported originals', async () => {
    vi.mocked(navigator.storage.persist).mockImplementation(() => new Promise(() => {}));
    await import('../src/main'); await settle();
    harness.actions.onAssetImport([{ name: 'ra2.mix' }]); await settle();
    expect(navigator.storage.persist).toHaveBeenCalledOnce();
    expect(harness.assets.importFiles).toHaveBeenCalledOnce();
    expect(harness.loading).toBe(false);
  });

  it('aborts to the cached source gate and requires another explicit Continue without restoring or importing files', async () => {
    await import('../src/main'); await settle();
    harness.actions.onAssetRetry('https://example.test/game.exe'); await settle();
    harness.frame(performance.now() + 100);
    expect(harness.game.state.time).toBeGreaterThan(0);
    harness.actions.onAbort();
    expect(harness.resetAudio).toHaveBeenCalled();
    expect(harness.game.restart).toHaveBeenCalledOnce();
    expect(harness.loading).toBe(true);
    expect(harness.status.ready).toBe(true);
    harness.frame(performance.now() + 200);
    expect(harness.game.state.time).toBe(0);
    expect(harness.assets.initialize).toHaveBeenCalledOnce();
    expect(harness.assets.download).toHaveBeenCalledOnce();
    expect(harness.assets.importFiles).not.toHaveBeenCalled();
    harness.actions.onAssetRetry('https://example.test/game.exe'); await settle();
    expect(harness.loading).toBe(false);
  });

  it('preserves visible frame time above 100ms and excludes hidden-tab elapsed time', async () => {
    const clock = vi.spyOn(performance, 'now').mockReturnValue(0);
    await import('../src/main'); await settle();
    harness.actions.onAssetRetry('https://example.test/game.exe'); await settle();
    harness.frame(200);
    expect(harness.game.state.time).toBeCloseTo(.2);
    Object.assign(document, { hidden: true });
    harness.visibility(); expect(harness.music).toHaveBeenLastCalledWith(false);
    harness.frame(10000);
    expect(harness.game.state.time).toBeCloseTo(.2);
    clock.mockReturnValue(10000);
    Object.assign(document, { hidden: false }); harness.visibility();
    expect(harness.music).toHaveBeenLastCalledWith(true);
    harness.frame(10050);
    expect(harness.game.state.time).toBeCloseTo(.25);
    clock.mockRestore();
  });

  it('continues with older original artwork missing optional font, cursors and interface chrome without a bypass or reimport', async () => {
    harness.assets.getUIAsset.mockReturnValue(null);
    harness.assets.getFont = () => null; harness.assets.getCursors = () => null;
    await import('../src/main'); await settle();
    expect(harness.actions).not.toHaveProperty('onFallback');
    expect(harness.actions).not.toHaveProperty('onAssetUpdate');
    expect(harness.status.error).toBeUndefined();
    expect(harness.status.ready).toBe(true);
    expect(harness.assets.download).not.toHaveBeenCalled();
    harness.frame(performance.now() + 100);
    expect(harness.loading).toBe(true);
    expect(harness.game.state.time).toBe(0);
    harness.actions.onAssetRetry('https://example.test/game.exe'); await settle();
    expect(harness.loading).toBe(false); expect(harness.assets.importFiles).not.toHaveBeenCalled();
    harness.frame(performance.now() + 200); expect(harness.game.state.time).toBeGreaterThan(0);
  });

  it('keeps the gate closed if rendering originals fails before the first battle frame', async () => {
    await import('../src/main'); await settle();
    harness.renderer.render.mockImplementation(() => { throw new Error('Missing original artwork: gi'); });
    harness.actions.onAssetRetry('https://example.test/game.exe'); await settle();
    expect(harness.status.error).toContain('Missing original artwork: gi');
    expect(harness.loading).toBe(true);
    harness.frame(performance.now() + 100);
    expect(harness.game.state.time).toBe(0);
    expect(harness.renderer.render).toHaveBeenCalledOnce();
  });

  it('stops a running battle while replacing assets and keeps it stopped after failure', async () => {
    await import('../src/main'); await settle();
    harness.actions.onAssetRetry('https://example.test/game.exe'); await settle();
    harness.frame(performance.now() + 100);
    const time = harness.game.state.time;
    harness.assets.download.mockImplementation(async (options: any) => {
      harness.assets.ready = false;
      harness.assets.status = { phase: 'error', message: 'Invalid original archive.' };
      options.onProgress(harness.assets.status);
    });
    harness.actions.onAssetRetry('https://example.test/bad.exe'); await settle();
    harness.frame(performance.now() + 200);
    expect(harness.loading).toBe(true);
    expect(harness.game.state.time).toBe(time);
    expect(harness.status.error).toBe('Invalid original archive.');
    expect(harness.assets.download).toHaveBeenCalledTimes(2);
  });

  it('pauses for options without changing manual pause state and reports runtime faults without an archive remedy', async () => {
    await import('../src/main'); await settle();
    harness.actions.onAssetRetry('https://example.test/game.exe'); await settle();
    harness.modal = true;
    harness.frame(performance.now() + 100);
    expect(harness.game.tick).not.toHaveBeenCalled();
    expect(harness.music).toHaveBeenLastCalledWith(true); // Keep live volume adjustment audible in Options.
    harness.modal = false;
    harness.game.tick.mockImplementation(() => { throw new Error('Path state invalid'); });
    harness.frame(performance.now() + 200);
    expect(harness.runtimeError).toBe('Path state invalid');
    expect(harness.resetAudio).toHaveBeenCalled();
    expect(harness.music).toHaveBeenLastCalledWith(false);
    expect(harness.assets.ready).toBe(true);
    expect(harness.status.error).toBeUndefined();
    const calls = harness.game.tick.mock.calls.length;
    harness.frame(performance.now() + 300);
    expect(harness.game.tick).toHaveBeenCalledTimes(calls);
  });
});
