import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  startGame,
  type StartupDependencies,
  type BattleControls,
  type BattleUI,
} from '../src/main';
import { Game } from '../src/game/Game';
import { GameAudio } from '../src/game/Audio';
import {
  AssetManager,
  type AssetOptions,
  type AssetRestoreResult,
} from '../src/assets/AssetManager';
import { Camera } from '../src/render/Camera';
import type { UIActions, AssetStatus } from '../src/ui/UI';
import { NativeFont } from '../src/assets/NativeFont';
import { NativeCursors } from '../src/assets/NativeCursor';
import { CustomArt } from '../src/assets/CustomArt';
import { testFont, testCursorShp } from '../src/assets/asset-test-fixtures';

const artworkUrl = 'data:image/png;base64,fixture';

function artworkCanvas() {
  // Browser boundary: CustomArt sees opaque fixture pixels, and startup exports the resulting sprite URL.
  return {
    width: 1,
    height: 1,
    toDataURL: () => artworkUrl,
    getContext(): Pick<
      CanvasRenderingContext2D,
      'drawImage' | 'save' | 'restore' | 'fillRect' | 'getImageData'
    > | null {
      return {
        drawImage() {},
        save() {},
        restore() {},
        fillRect() {},
        getImageData: (_x: number, _y: number, width: number, height: number) => ({
          data: new Uint8ClampedArray(width * height * 4).fill(255),
          width,
          height,
          colorSpace: 'srgb',
        }),
      };
    },
  };
}

function createHarness() {
  const assets = new AssetManager();
  const game = new Game();
  const audio = new GameAudio(() => undefined);
  const font = new NativeFont(testFont());
  const cursors = new NativeCursors(testCursorShp(), new Uint8Array(768));

  const artwork = {
    source: document.createElement('canvas'),
    width: 1,
    height: 1,
    anchorX: 0,
    anchorY: 0,
    offsetX: 0,
    offsetY: 0,
  };

  const installed = {
    setFont: vi.fn<BattleUI['setFont']>(),
    setCursors: vi.fn<BattleUI['setCursors']>(),
    setChrome: vi.fn<BattleUI['setChrome']>(),
  };

  const renderer = {
    camera: new Camera(),
    render: vi.fn(),
    pick: () => null,
    assets,
    targetLines: true,
  };

  const controls: BattleControls = {
    setPlacement() {},
    setMode() {},
    executeCommand() {},
    planning: false,
    setScrollRate() {},
    scrollRate: 1,
    cancelPlacement() {},
    getBindings: () => [],
    inspectBinding: () => ({ ok: true }),
    assignBinding: () => ({ ok: true }),
    resetBindings() {},
    radarOrder() {},
    tick() {},
  };

  const actions: UIActions = {
    onPlace() {},
    onCenter() {},
    onZoom() {},
    onMode() {},
    onSound() {},
    onAssetRetry() {},
    onAssetImport() {},
    onRestart() {},
  };

  const status: AssetStatus = { phase: 'cache' };

  const state = {
    assets,
    game,
    font,
    cursors,
    installed,
    renderer,
    actions,
    status,
    loading: true,
    modal: false,
    runtimeError: '',
    frame: (_now: number) => {},
    visibility: () => {},
    customArt: vi.fn<StartupDependencies['loadCustomArt']>().mockResolvedValue(null),
    music: vi.spyOn(audio, 'setMusicPlaying').mockImplementation(() => {}),
    resetAudio: vi.spyOn(audio, 'reset').mockImplementation(() => {}),
  };

  const ready = async (options: AssetOptions = {}): Promise<AssetRestoreResult> => {
    assets.ready = true;
    assets.status = { phase: 'ready', message: 'Saved files restored.', loaded: 1, total: 1 };
    options.onProgress?.(assets.status);

    return 'ready';
  };

  vi.spyOn(game, 'tick').mockImplementation((dt) => {
    game.state.time += dt;
  });
  vi.spyOn(game, 'setAnimationDefinitions').mockImplementation(() => {});
  vi.spyOn(game, 'restart').mockImplementation(() => {
    game.state.time = 0;
  });
  vi.spyOn(assets, 'initialize').mockImplementation(ready);
  vi.spyOn(assets, 'download').mockImplementation(async (options = {}) => {
    await ready(options);
  });
  vi.spyOn(assets, 'importFiles').mockImplementation(async (_files, options) => {
    await ready(options);
  });
  vi.spyOn(assets, 'getFont').mockReturnValue(font);
  vi.spyOn(assets, 'getCursors').mockReturnValue(cursors);
  vi.spyOn(assets, 'getCameo').mockReturnValue(null);
  vi.spyOn(assets, 'getUIAsset').mockReturnValue(artwork);
  vi.spyOn(assets, 'getDialogAsset').mockReturnValue(artwork);
  vi.spyOn(assets, 'getAnimationDefinitions').mockReturnValue({
    piffpiff: { frames: 12, ticksPerFrame: 1 },
  });
  vi.spyOn(assets, 'getInfantryAnimationDefinitions').mockReturnValue({});

  const ui: BattleUI = {
    setLoading: (value) => {
      state.loading = value;
    },
    setAssetStatus: (value) => {
      state.status = value;
    },
    isModalOpen: () => state.modal,
    showRuntimeError: (message) => {
      state.runtimeError = message;
      state.loading = true;
    },
    setAssetSource() {},
    setZoom() {},
    setCameo() {},
    ...installed,
    setCursor() {},
    update() {},
    setMode() {},
    showToast() {},
    selectCategory() {},
    openOptions() {},
    openBriefing() {},
  };

  const dependencies: StartupDependencies = {
    createGame: () => game,
    createAssets: () => assets,
    createAudio: () => audio,
    createUI: (_game, actions) => {
      state.actions = actions;

      return ui;
    },
    createRuntime: () => ({ renderer, controls }),
    loadCustomArt: state.customArt,
  };

  return { state, dependencies };
}

let harness: ReturnType<typeof createHarness>['state'];

let dependencies: StartupDependencies;

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
  vi.stubGlobal('document', {
    querySelector: () => ({}),
    createElement: artworkCanvas,
    hidden: false,
    addEventListener: (_name: string, callback: () => void) => {
      harness.visibility = callback;
    },
  });
  const fixture = createHarness();
  harness = fixture.state;
  dependencies = fixture.dependencies;
  vi.stubGlobal('navigator', {
    userAgent: '',
    maxTouchPoints: 0,
    storage: { persist: vi.fn(async () => false) },
  });
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.stubGlobal('window', {});

  // SAFETY: CustomArt reads only decoded natural dimensions; artworkCanvas provides opaque pixels for every atlas frame.
  const image = { naturalWidth: 80, naturalHeight: 40 } as HTMLImageElement;
  harness.customArt.mockResolvedValue(
    new CustomArt({ building: image, infantry: image, buildingCameo: image, infantryCameo: image }),
  );
  vi.stubGlobal('location', { search: '' });
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
  vi.stubGlobal('requestAnimationFrame', (frame: (now: number) => void) => {
    harness.frame = frame;

    return 1;
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('startup authorization', () => {
  it('restores cached artwork while keeping the first-open gate and battle clock stopped', async () => {
    await startGame(dependencies);
    await settle();
    expect(harness.assets.initialize).toHaveBeenCalledOnce();
    expect(harness.customArt).toHaveBeenCalledOnce();
    expect(harness.assets.customArt).toBe(await harness.customArt.mock.results[0].value);
    expect(harness.assets.customArt).toBeInstanceOf(CustomArt);
    expect(harness.installed.setFont).toHaveBeenCalledExactlyOnceWith(harness.font);
    expect(harness.installed.setCursors).toHaveBeenCalledExactlyOnceWith(harness.cursors);
    expect(harness.installed.setChrome).toHaveBeenCalledWith('side1', artworkUrl);
    expect(harness.installed.setChrome).toHaveBeenCalledWith('radar-online', artworkUrl);
    expect(harness.installed.setChrome).toHaveBeenCalledWith('tab00-active', artworkUrl);
    expect(harness.installed.setChrome).toHaveBeenCalledWith('options-medium', artworkUrl);
    expect(harness.installed.setChrome).toHaveBeenCalledWith('options-button-frame1', artworkUrl);
    expect(harness.assets.getUIAsset).toHaveBeenCalled();
    expect(harness.game.setAnimationDefinitions).toHaveBeenCalledWith(
      { piffpiff: { frames: 12, ticksPerFrame: 1 } },
      {},
    );
    expect(harness.assets.download).not.toHaveBeenCalled();
    expect(navigator.storage.persist).not.toHaveBeenCalled();
    harness.frame(performance.now() + 100);
    expect(harness.loading).toBe(true);
    expect(harness.game.state.time).toBe(0);
    expect(harness.game.tick).not.toHaveBeenCalled();
    expect(harness.music).toHaveBeenLastCalledWith(false);
  });

  it('starts battle only after explicit Continue and shares duplicate submissions', async () => {
    await startGame(dependencies);
    await settle();
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
    harness.customArt.mockRejectedValue(
      new Error(
        'Unable to load bundled artwork /art/butchers/george-sheet.png. Reload the page to retry.',
      ),
    );
    await startGame(dependencies);
    await settle();
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
    await startGame(dependencies);
    await settle();
    harness.actions.onAssetImport([new File([], 'ra2.mix')]);
    await settle();
    expect(navigator.storage.persist).toHaveBeenCalledOnce();
    expect(harness.assets.importFiles).toHaveBeenCalledOnce();
    expect(harness.loading).toBe(false);
  });

  it('aborts to the cached source gate and requires another explicit Continue without restoring or importing files', async () => {
    await startGame(dependencies);
    await settle();
    harness.actions.onAssetRetry('https://example.test/game.exe');
    await settle();
    harness.frame(performance.now() + 100);
    expect(harness.game.state.time).toBeGreaterThan(0);
    harness.actions.onAbort?.();
    expect(harness.resetAudio).toHaveBeenCalled();
    expect(harness.game.restart).toHaveBeenCalledOnce();
    expect(harness.loading).toBe(true);
    expect(harness.status.ready).toBe(true);
    harness.frame(performance.now() + 200);
    expect(harness.game.state.time).toBe(0);
    expect(harness.assets.initialize).toHaveBeenCalledOnce();
    expect(harness.assets.download).toHaveBeenCalledOnce();
    expect(harness.assets.importFiles).not.toHaveBeenCalled();
    harness.actions.onAssetRetry('https://example.test/game.exe');
    await settle();
    expect(harness.loading).toBe(false);
  });

  it('preserves visible frame time above 100ms and excludes hidden-tab elapsed time', async () => {
    const clock = vi.spyOn(performance, 'now').mockReturnValue(0);
    await startGame(dependencies);
    await settle();
    harness.actions.onAssetRetry('https://example.test/game.exe');
    await settle();
    harness.frame(200);
    expect(harness.game.state.time).toBeCloseTo(0.2);
    Object.assign(document, { hidden: true });
    harness.visibility();
    expect(harness.music).toHaveBeenLastCalledWith(false);
    harness.frame(10000);
    expect(harness.game.state.time).toBeCloseTo(0.2);
    clock.mockReturnValue(10000);
    Object.assign(document, { hidden: false });
    harness.visibility();
    expect(harness.music).toHaveBeenLastCalledWith(true);
    harness.frame(10050);
    expect(harness.game.state.time).toBeCloseTo(0.25);
    clock.mockRestore();
  });

  it('continues with older original artwork missing optional font, cursors and interface chrome without a bypass or reimport', async () => {
    vi.mocked(harness.assets.getUIAsset).mockReturnValue(null);
    vi.mocked(harness.assets.getDialogAsset).mockReturnValue(null);
    vi.mocked(harness.assets.getFont).mockReturnValue(null);
    vi.mocked(harness.assets.getCursors).mockReturnValue(null);

    await startGame(dependencies);
    await settle();
    expect(harness.installed.setFont).not.toHaveBeenCalled();
    expect(harness.installed.setCursors).not.toHaveBeenCalled();
    expect(harness.installed.setChrome).not.toHaveBeenCalled();
    expect(harness.actions).not.toHaveProperty('onFallback');
    expect(harness.actions).not.toHaveProperty('onAssetUpdate');
    expect(harness.status.error).toBeUndefined();
    expect(harness.status.ready).toBe(true);
    expect(harness.assets.download).not.toHaveBeenCalled();
    harness.frame(performance.now() + 100);
    expect(harness.loading).toBe(true);
    expect(harness.game.state.time).toBe(0);
    harness.actions.onAssetRetry('https://example.test/game.exe');
    await settle();
    expect(harness.loading).toBe(false);
    expect(harness.assets.importFiles).not.toHaveBeenCalled();
    harness.frame(performance.now() + 200);
    expect(harness.game.state.time).toBeGreaterThan(0);
  });

  it('keeps the gate closed if rendering originals fails before the first battle frame', async () => {
    await startGame(dependencies);
    await settle();
    harness.renderer.render.mockImplementation(() => {
      throw new Error('Missing original artwork: gi');
    });
    harness.actions.onAssetRetry('https://example.test/game.exe');
    await settle();
    expect(harness.status.error).toContain('Missing original artwork: gi');
    expect(harness.loading).toBe(true);
    harness.frame(performance.now() + 100);
    expect(harness.game.state.time).toBe(0);
    expect(harness.renderer.render).toHaveBeenCalledOnce();
  });

  it('stops a running battle while replacing assets and keeps it stopped after failure', async () => {
    await startGame(dependencies);
    await settle();
    harness.actions.onAssetRetry('https://example.test/game.exe');
    await settle();
    harness.frame(performance.now() + 100);
    const time = harness.game.state.time;
    vi.mocked(harness.assets.download).mockImplementation(async (options = {}) => {
      harness.assets.ready = false;
      harness.assets.status = { phase: 'error', loaded: 0, message: 'Invalid original archive.' };
      options.onProgress?.(harness.assets.status);
    });
    harness.actions.onAssetRetry('https://example.test/bad.exe');
    await settle();
    harness.frame(performance.now() + 200);
    expect(harness.loading).toBe(true);
    expect(harness.game.state.time).toBe(time);
    expect(harness.status.error).toBe('Invalid original archive.');
    expect(harness.assets.download).toHaveBeenCalledTimes(2);
  });

  it('pauses for options without changing manual pause state and reports runtime faults without an archive remedy', async () => {
    await startGame(dependencies);
    await settle();
    harness.actions.onAssetRetry('https://example.test/game.exe');
    await settle();
    harness.modal = true;
    harness.frame(performance.now() + 100);
    expect(harness.game.tick).not.toHaveBeenCalled();
    expect(harness.music).toHaveBeenLastCalledWith(true); // Keep live volume adjustment audible in Options.
    harness.modal = false;
    vi.mocked(harness.game.tick).mockImplementation(() => {
      throw new Error('Path state invalid');
    });
    harness.frame(performance.now() + 200);
    expect(harness.runtimeError).toBe('Path state invalid');
    expect(harness.resetAudio).toHaveBeenCalled();
    expect(harness.music).toHaveBeenLastCalledWith(false);
    expect(harness.assets.ready).toBe(true);
    expect(harness.status.error).toBeUndefined();
    const calls = vi.mocked(harness.game.tick).mock.calls.length;
    harness.frame(performance.now() + 300);
    expect(harness.game.tick).toHaveBeenCalledTimes(calls);
  });
});
