import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ output: ['ra2.mix'], exit: 0, onExit: 0 }));
vi.mock('7z-wasm', () => ({ default: async (options: { onExit: (code: number) => void }) => ({
  WORKERFS: {},
  FS: { mkdir() {}, mount() {}, unmount() {}, unlink() {}, readdir: () => state.output,
    stat: () => ({ size: 10 }), readFile: () => new Uint8Array(10) },
  callMain() { if (state.onExit) options.onExit(state.onExit); if (state.exit) throw { status: state.exit }; },
}) }));
vi.mock('./formats', () => ({ MixArchive: class { constructor() { throw new Error('Invalid MIX index'); } } }));
let worker: { onmessage?: (event: any) => Promise<void>; postMessage: ReturnType<typeof vi.fn> };
beforeEach(() => {
  vi.resetModules(); state.output = ['ra2.mix']; state.exit = 0; state.onExit = 0;
  worker = { postMessage: vi.fn() }; vi.stubGlobal('self', worker);
});
afterEach(() => vi.unstubAllGlobals());

it('keeps completed installer bytes reusable after a nested MIX decoder failure', async () => {
  await import('./extract.worker');
  await worker.onmessage!({ data: { files: [{ name: 'game.exe', blob: new Blob(['installer']) }] } });
  expect(worker.postMessage).toHaveBeenLastCalledWith({ kind: 'error', invalidArchive: false, message: 'Invalid MIX index' });
});

it('reports structurally invalid direct MIX bytes as a MIX input failure', async () => {
  await import('./extract.worker');
  await worker.onmessage!({ data: { files: [{ name: 'ra2.mix', blob: new Blob(['damaged']) }] } });
  expect(worker.postMessage).toHaveBeenLastCalledWith({ kind: 'error', invalidArchive: true, message: 'Invalid MIX index' });
});

it('still rejects a non-game installer with no MIX output', async () => {
  state.output = [];
  await import('./extract.worker');
  await worker.onmessage!({ data: { files: [{ name: 'wrong.exe', blob: new Blob(['installer']) }] } });
  expect(worker.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'error', invalidArchive: true, message: expect.stringContaining('No game MIX files found') }));
});

it('still rejects a malformed installer when 7-Zip reports a fatal archive error', async () => {
  state.exit = 2;
  await import('./extract.worker');
  await worker.onmessage!({ data: { files: [{ name: 'broken.exe', blob: new Blob(['bad archive']) }] } });
  expect(worker.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'error', invalidArchive: true }));
});

it.each([7, 8, 255])('preserves completed downloads after thrown 7-Zip runtime status %s', async code => {
  state.exit = code;
  await import('./extract.worker');
  await worker.onmessage!({ data: { files: [{ name: 'game.exe', blob: new Blob(['saved installer']) }] } });
  expect(worker.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'error', invalidArchive: false, message: expect.stringContaining(`7-Zip code ${code}:`) }));
});

it.each([7, 8, 255])('preserves completed downloads after 7-Zip onExit runtime status %s', async code => {
  state.onExit = code;
  await import('./extract.worker');
  await worker.onmessage!({ data: { files: [{ name: 'game.exe', blob: new Blob(['saved installer']) }] } });
  expect(worker.postMessage).toHaveBeenLastCalledWith(expect.objectContaining({ kind: 'error', invalidArchive: false, message: expect.stringContaining(`7-Zip code ${code}:`) }));
});
