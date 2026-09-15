import { beforeEach, expect, it, vi } from 'vitest';

import { extractAssets, type OpenInstaller } from './extractAssets';

const state = { output: ['ra2.mix'], exit: 0, onExit: 0 };

const worker = { postMessage: vi.fn() };

const openInstaller: OpenInstaller = async (options) => ({
  mount() {},
  unmount() {},
  remove() {},
  names: () => state.output,
  size: () => 10,
  // A short MIX body exercises the real index parser's bounds check.
  read: () => new Uint8Array([0, 0, 1, 0, 0, 0, 0, 0, 0, 0]),
  extract() {
    if (state.onExit) options.onExit(state.onExit);

    if (state.exit) throw { status: state.exit };
  },
});

beforeEach(() => {
  state.output = ['ra2.mix'];
  state.exit = 0;
  state.onExit = 0;
  worker.postMessage.mockClear();
});

it('keeps completed installer bytes reusable after a nested MIX decoder failure', async () => {
  await extractAssets(
    { files: [{ name: 'game.exe', blob: new Blob(['installer']) }] },
    worker,
    openInstaller,
  );
  expect(worker.postMessage).toHaveBeenLastCalledWith({
    kind: 'error',
    invalidArchive: false,
    missingMusic: false,
    message: expect.stringContaining('MIX'),
  });
});

it('reports structurally invalid direct MIX bytes as a MIX input failure', async () => {
  await extractAssets(
    { files: [{ name: 'ra2.mix', blob: new Blob(['damaged']) }] },
    worker,
    openInstaller,
  );
  expect(worker.postMessage).toHaveBeenLastCalledWith({
    kind: 'error',
    invalidArchive: true,
    missingMusic: false,
    message: expect.stringContaining('MIX'),
  });
});

it('still rejects a non-game installer with no MIX output', async () => {
  state.output = [];
  await extractAssets(
    { files: [{ name: 'wrong.exe', blob: new Blob(['installer']) }] },
    worker,
    openInstaller,
  );
  expect(worker.postMessage).toHaveBeenLastCalledWith(
    expect.objectContaining({
      kind: 'error',
      invalidArchive: true,
      message: expect.stringContaining('No game MIX files found'),
    }),
  );
});

it('still rejects a malformed installer when 7-Zip reports a fatal archive error', async () => {
  state.exit = 2;
  await extractAssets(
    { files: [{ name: 'broken.exe', blob: new Blob(['bad archive']) }] },
    worker,
    openInstaller,
  );
  expect(worker.postMessage).toHaveBeenLastCalledWith(
    expect.objectContaining({ kind: 'error', invalidArchive: true }),
  );
});

it.each([7, 8, 255])(
  'preserves completed downloads after thrown 7-Zip runtime status %s',
  async (code) => {
    state.exit = code;
    await extractAssets(
      { files: [{ name: 'game.exe', blob: new Blob(['saved installer']) }] },
      worker,
      openInstaller,
    );
    expect(worker.postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        kind: 'error',
        invalidArchive: false,
        message: expect.stringContaining(`7-Zip code ${code}:`),
      }),
    );
  },
);

it.each([7, 8, 255])(
  'preserves completed downloads after 7-Zip onExit runtime status %s',
  async (code) => {
    state.onExit = code;
    await extractAssets(
      { files: [{ name: 'game.exe', blob: new Blob(['saved installer']) }] },
      worker,
      openInstaller,
    );
    expect(worker.postMessage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        kind: 'error',
        invalidArchive: false,
        message: expect.stringContaining(`7-Zip code ${code}:`),
      }),
    );
  },
);
