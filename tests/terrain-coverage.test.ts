import { afterEach, expect, it, vi } from 'vitest';
import { Renderer } from '../src/render/Renderer';
import { Game } from '../src/game/Game';
import { TestCanvas } from '../src/assets/asset-test-fixtures';

vi.mock('../src/render/GL', () => ({ GL: class {
  createTexture = (source: TestCanvas) => ({ source });
  updateTexture = vi.fn(); flush = vi.fn(); polygon = vi.fn(); sprite = vi.fn();
} }));
class Surface extends TestCanvas {
  getContext() { return { ...super.getContext(), clearRect: () => { this.pixels.fill(0); } }; }
}
afterEach(() => vi.unstubAllGlobals());
function fixture() {
  vi.stubGlobal('document', { createElement: () => new Surface() });
  const source = new Surface(); source.width = 60; source.height = 30;
  source.pixels = new Uint8ClampedArray(60 * 30 * 4);
  for (let y = 0; y < 30; y++) for (let x = 0; x < 60; x++) {
    if (Math.abs(x + .5 - 30) / 30 + Math.abs(y + .5 - 15) / 15 <= 1) source.pixels.set([70, 100, 40, 255], (y * 60 + x) * 4);
  }
  const art = { source: source as unknown as CanvasImageSource, width: 60, height: 30, anchorX: 30, anchorY: 15 };
  const game = new Game({ ai: false });
  const renderer = new Renderer({} as HTMLCanvasElement, game);
  renderer.assets = { ready: true, getTerrain: () => art } as any;
  Object.assign(renderer.camera, { width: 640, height: 480, zoom: .45 });
  return { game, renderer, view: renderer as any };
}

it.each([[0, 0], [64, 0], [64, 64], [0, 64]])('tiles every visible ground chunk at diamond tip %i,%i without expanding gameplay', (x, y) => {
  const { game, renderer, view } = fixture(), before = JSON.stringify(game.state.tiles);
  Object.assign(renderer.camera, { width: 320, height: 240, zoom: .83 });
  renderer.camera.center(x, y); view.drawTerrain();
  const calls = vi.mocked(renderer.gl.sprite).mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  for (const [texture] of calls) {
    const pixels = (texture as any).source.pixels as Uint8ClampedArray;
    expect(pixels.every((value, index) => index % 4 !== 3 || value === 255)).toBe(true);
  }
  expect(JSON.stringify(game.state.tiles)).toBe(before);
  expect(game.state.tiles).toHaveLength(64 * 64);
  for (const [x, y] of [[-1, 0], [64, 0], [0, -1], [0, 64]]) {
    expect(game.canPlace('power', x, y)).toBe(false);
    expect((game as any).isPassable(x, y, game.defs.rocketeer)).toBe(false);
  }
});

it('extends edge shroud into scenery, and clears it when that edge is explored', () => {
  const { game, renderer, view } = fixture(); renderer.camera.center(-3, -3);
  game.state.explored.fill(0); view.drawShroud(0, 32, 0, 32);
  const sources = () => vi.mocked(renderer.gl.sprite).mock.calls.map(([texture]) => (texture as any).source as Surface);
  expect(sources().some(source => source.pixels.some((v, i) => i % 4 === 3 && v === 255))).toBe(true);
  // Only reveal the nearest corner. A remote unexplored edge must stay black.
  game.state.explored[0] = 1; vi.mocked(renderer.gl.sprite).mockClear();
  view.drawShroud(0, 32, 0, 32);
  const chunks = view.shroudChunks as Map<string, { source: Surface }>;
  const sample = (px: number, py: number) => {
    const cx = Math.floor(px / 480), cy = Math.floor(py / 480), chunk = chunks.get(`${cx}:${cy}`)!;
    return chunk.source.pixels[((py - cy * 480) * 480 + px - cx * 480) * 4 + 3];
  };
  expect(sample(0, -300)).toBe(0); // beyond the explored north tip
  expect(sample(-300, 300)).toBe(255); // a different, still unexplored edge
  game.state.explored.fill(1); vi.mocked(renderer.gl.sprite).mockClear();
  view.drawShroud(0, 32, 0, 32);
  expect(sources().every(source => source.pixels.every((v, i) => i % 4 !== 3 || v === 0))).toBe(true);
});
