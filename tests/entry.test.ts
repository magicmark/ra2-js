import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => ({ viewer: vi.fn(), game: vi.fn() }));
vi.mock('../src/maps/MapViewer', () => ({ startMapViewer: harness.viewer }));

beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  vi.doMock('../src/main', () => { harness.game(); return {}; });
});
afterEach(() => vi.unstubAllGlobals());

async function open(path: string) {
  vi.stubGlobal('location', new URL(path, 'https://example.test'));
  vi.stubGlobal('history', { replaceState: vi.fn((_state, _title, path) => {
    vi.stubGlobal('location', new URL(path, location.href));
  }) });
  await import('../src/entry');
  await vi.waitFor(() => expect(harness.viewer.mock.calls.length + harness.game.mock.calls.length).toBe(1));
}

it.each(['/maps', '/maps/', '/maps/emerald-divide', '/maps/frostline-basin/preview', '/maps/unknown'])('opens %s in the isolated Map Viewer', async path => {
  await open(path);
  expect(harness.viewer).toHaveBeenCalledOnce();
  expect(harness.game).not.toHaveBeenCalled();
  expect(history.replaceState).not.toHaveBeenCalled();
});

it.each(['/admin', '/admin/', '/admin/emerald-divide', '/admin/frostline-basin/preview'])('migrates bookmarked %s to /maps while preserving query and fragment', async path => {
  await open(`${path}?asset_url=https%3A%2F%2Fexample.test%2Fgame.exe#map`);
  expect(location.pathname).toBe(path.replace('/admin', '/maps'));
  expect(location.search).toBe('?asset_url=https%3A%2F%2Fexample.test%2Fgame.exe');
  expect(location.hash).toBe('#map');
  expect(harness.viewer).toHaveBeenCalledOnce();
  expect(harness.game).not.toHaveBeenCalled();
});

it.each(['/', '/?map=emerald-divide', '/maps-extra', '/administrator'])('keeps game startup separate at %s', async path => {
  await open(path);
  expect(harness.game).toHaveBeenCalledOnce();
  expect(harness.viewer).not.toHaveBeenCalled();
  expect(history.replaceState).not.toHaveBeenCalled();
});
