import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { createMap, MAP_SIZE, TRAINING_THEATER } from '../src/game/map';
import { MAP_CATALOG } from '../src/game/maps/catalog';
import { parseNativeMap } from '../src/game/maps/nativeMap';
import { DEFAULT_ORE_MINES, oreMineFrame, updateOreMines } from '../src/game/oreMines';

// Original theater INI ranges, independently extracted in the visual audit.
// Include bends, slopes, bits and ends, not just the three straight/junction IDs.
const { originalRoadSets } = JSON.parse(readFileSync('tests/artifacts/map-visual-audit/inventory.json', 'utf8')) as {
  originalRoadSets: { file: string; first: number; count: number }[];
};

describe('original ore mines', () => {
  for (const id of ['training', ...MAP_CATALOG.map(entry => entry.id)]) it(`${id}: every drill avoids original road art before and after initialization`, () => {
    const map = id === 'training' ? undefined : parseNativeMap(readFileSync(`public/maps/${id}.map`, 'utf8'));
    const before = map ? structuredClone(map.cells) : createMap().map((t, i) => ({ x: i % MAP_SIZE, y: Math.floor(i / MAP_SIZE), ...t.nativeArt! }));
    const positions = map ? map.terrain.filter(t => t.type.toUpperCase() === 'TIBTRE01') : DEFAULT_ORE_MINES;
    const theater = map?.theater ?? TRAINING_THEATER;
    const ini = { TEMPERATE: 'temperat.ini', SNOW: 'snow.ini', URBAN: 'urban.ini' }[theater];
    const roads = originalRoadSets.filter(set => set.file === ini);
    expect(roads.length).toBeGreaterThan(0);
    const after = new Game({ map, ai: false }).state;
    expect(positions).toHaveLength(map ? 12 : 6);
    expect(after.oreMines!.map(({ x, y }) => ({ x, y }))).toEqual(positions.map(({ x, y }) => ({ x, y })));
    for (const { x, y } of positions) {
      const source = before.find(c => c.x === x && c.y === y)!;
      // Native rendering reads nativeMap.cells; training reads Tile.nativeArt.
      const initialized = after.nativeMap ? after.nativeMap.cells.find(c => c.x === x && c.y === y)! : after.tiles[y * after.width + x].nativeArt!;
      for (const art of [source, initialized]) {
        expect(art, `${id} (${x},${y}) must have original artwork`).toBeDefined();
        expect(roads.some(set => art.tileIndex >= set.first && art.tileIndex < set.first + set.count),
          `${id} (${x},${y}) tile ${art.tileIndex}/${art.subTile} overlaps original road art`).toBe(false);
      }
      expect([initialized.tileIndex, initialized.subTile]).toEqual([source.tileIndex, source.subTile]);
    }
  });

  it('keeps the southern training road clear and the relocated drill in its ore field', () => {
    const before = createMap(), state = new Game({ ai: false }).state;
    const mine = state.oreMines!.find(m => m.x === 20 && m.y === 51)!;
    expect(mine).toBeDefined();
    expect(before[51 * MAP_SIZE + 20]).toMatchObject({ terrain: 'grass', nativeArt: { tileIndex: 0 } });
    expect(before[51 * MAP_SIZE + 20].ore).toBeGreaterThan(0);
    expect(mine.fieldCells.length).toBeGreaterThan(0);
    expect(mine.initialOre).toBeGreaterThan(0);
    expect(mine.fieldCells.some(i => Math.hypot(i % MAP_SIZE - mine.x, Math.floor(i / MAP_SIZE) - mine.y) <= 1)).toBe(true);
    for (let x = 22; x <= 24; x++) {
      const i = 51 * MAP_SIZE + x;
      expect(state.tiles[i]).toEqual(before[i]);
      expect(state.tiles[i]).toMatchObject({ terrain: 'road', ore: 0, nativeArt: { tileIndex: 294, subTile: x - 22 } });
    }
  });

  it('places the original mine at each default field and animates with authored timing', () => {
    const game = new Game({ ai: false }), mine = game.state.oreMines![0];
    expect(game.state.oreMines).toHaveLength(6);
    expect(game.state.tiles[mine.y * game.state.width + mine.x]).toMatchObject({ terrain: 'rock', ore: 0 });
    expect(oreMineFrame(mine, 0)).toBe(0);
    mine.animationStartedAt = 1;
    expect(oreMineFrame(mine, 1.3)).toBe(3);
    expect(oreMineFrame(mine, 2)).toBe(10);
  });
  it('replenishes bounded nearby depleted ground without growing on occupied or impassable cells', () => {
    const game = new Game({ ai: false }), state = game.state, mine = state.oreMines![0];
    state.oreMines = [mine]; state.entities = [];
    for (const i of mine.fieldCells) state.tiles[i].ore = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) state.tiles[(mine.y + dy) * state.width + mine.x + dx] = { terrain: 'water', ore: 0, variant: 0 };
    const eligible = (mine.y + 1) * state.width + mine.x, occupied = mine.y * state.width + mine.x + 1;
    state.tiles[eligible].terrain = 'sand'; state.tiles[occupied].terrain = 'grass';
    state.entities = [{ id: 1, type: 'power', x: mine.x + 1, y: mine.y, hp: 100 } as any];
    const before = state.tiles.map(t => t.ore);
    for (let i = 0; i < 20; i++) { mine.animationStartedAt = state.time; state.time += 1.2; updateOreMines(state, game.defs); }
    expect(state.tiles[eligible].ore).toBe(1200);
    expect(state.tiles[occupied].ore).toBe(0);
    expect(state.tiles.flatMap((t, i) => t.ore !== before[i] ? [i] : [])).toEqual([eligible]);
  });
  it('replenishes after simulated time and pauses with the game', () => {
    const game = new Game({ ai: false }), mine = game.state.oreMines![0];
    game.state.oreMines = [mine]; game.state.entities = game.state.entities.filter(e => e.type === 'conyard' || e.type === 'conyard_soviet');
    for (const i of mine.fieldCells) game.state.tiles[i].ore = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) game.state.tiles[(mine.y + dy) * game.state.width + mine.x + dx] = { terrain: 'sand', ore: 0, variant: 0 };
    const amount = () => game.state.tiles.reduce((sum, tile) => sum + tile.ore, 0), before = amount();
    for (let i = 0; i < 1800; i++) game.tick(1 / 30);
    expect(amount()).toBeGreaterThan(before);
    const paused = amount(); game.state.paused = true;
    for (let i = 0; i < 900; i++) game.tick(1 / 30);
    expect(amount()).toBe(paused);
  });
  it('leaves a healthy field idle without motion or added ore', () => {
    const game = new Game({ ai: false }), state = game.state, mine = state.oreMines![0];
    state.oreMines = [mine];
    const initial = state.tiles.map(t => t.ore);
    for (let i = 0; i < 3000; i++) { state.time += 1 / 30; updateOreMines(state, game.defs); expect(oreMineFrame(mine, state.time)).toBe(0); }
    expect(state.tiles.map(t => t.ore)).toEqual(initial);
    mine.animationStartedAt = state.time; state.time += 2; updateOreMines(state, game.defs);
    expect(mine.animationStartedAt).toBeUndefined();
    expect(state.tiles.map(t => t.ore)).toEqual(initial);
  });
});
