import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { definitions, parseDefinitions } from '../src/game/definitions';
import { placementCells } from '../src/game/placement';
import { isWithinLocalMap, parseNativeMap } from '../src/game/maps/nativeMap';
import type { Entity } from '../src/game/types';

function sea() {
  const game = new Game({ ai: false });
  const base = game.state.entities.find(e => e.side === 0 && e.type === 'power')!;
  base.x = 20; base.y = 20; game.state.entities = [base];
  for (const tile of game.state.tiles) { tile.terrain = 'water'; tile.ore = 0; }
  game.state.explored.fill(1); game.state.fog.fill(0);
  return { game, base };
}
const spawn = (game: Game, type: string, x: number, y: number) => (game as any).spawn(type, 0, x, y) as Entity;

describe('bounded shipyard placement', () => {
  it('loads original shipyard adjacency and rejects malformed placement metadata', () => {
    expect(definitions.shipyard).toMatchObject({ adjacent: 12, baseNormal: false, footprint: [4, 4], movement: 'water' });
    const rule = '[units.yard]\nname="Yard"\ncategory="structures"\ncost=1\n';
    for (const value of ['-1', '12.5', 'inf', '"12"'])
      expect(() => parseDefinitions(`${rule}adjacent=${value}`)).toThrow('Invalid placement adjacency');
    expect(() => parseDefinitions(`${rule}baseNormal="no"`)).toThrow('Invalid base adjacency flag');
  });

  it.each([[34, 20, 35, 20], [4, 20, 3, 20], [20, 34, 20, 35], [20, 4, 20, 3]])(
    'accepts a 12-cell foundation gap at %i,%i, but rejects one cell farther', (x, y, farX, farY) => {
      const { game } = sea();
      const cells = placementCells(game.state, game.defs, 'shipyard', x, y);
      expect(cells).toHaveLength(16); expect(cells.every(cell => cell.valid)).toBe(true);
      expect(game.canPlace('shipyard', x, y)).toBe(true);
      expect(game.canPlace('shipyard', farX, farY)).toBe(false);
    });

  it('bounds diagonal reach with the existing Euclidean foundation-gap metric', () => {
    const { game } = sea();
    expect(game.canPlace('shipyard', 30, 30)).toBe(true); // gap sqrt(8² + 8²)
    expect(game.canPlace('shipyard', 31, 31)).toBe(false); // gap sqrt(9² + 9²)
    expect(game.canPlace('shipyard', 50, 50)).toBe(false);
  });

  it('does not extend ordinary land-building reach or chain reach through shipyards', () => {
    const { game } = sea();
    for (let y = 20; y < 28; y++) for (let x = 26; x < 42; x++) game.state.tiles[y * 64 + x].terrain = 'grass';
    expect(game.canPlace('power', 26, 20)).toBe(true); // existing 4-cell gap
    expect(game.canPlace('power', 27, 20)).toBe(false); // existing 5-cell gap
    spawn(game, 'shipyard', 34, 20);
    expect(game.canPlace('shipyard', 50, 20)).toBe(false);
    expect(game.canPlace('power', 38, 24)).toBe(false);
  });

  for (const invalid of ['enemy', 'dead', 'selling', 'constructing', 'unit'] as const)
    it(`does not use an ${invalid} anchor`, () => {
      const { game, base } = sea();
      if (invalid === 'enemy') base.side = 1;
      if (invalid === 'dead') base.hp = 0;
      if (invalid === 'selling') base.selling = { startedAt: 0, duration: 2 };
      if (invalid === 'constructing') base.constructing = { startedAt: 0, duration: 2 };
      if (invalid === 'unit') base.type = 'gi';
      expect(game.canPlace('shipyard', 34, 20)).toBe(false);
    });

  it('keeps per-cell water, exploration, ore, occupancy and map bounds enforced', () => {
    const { game } = sea(), index = 21 * 64 + 35;
    const invalidCells = () => placementCells(game.state, game.defs, 'shipyard', 34, 20).filter(cell => !cell.valid);
    expect(game.canPlace('shipyard', 34, 20)).toBe(true); // explored, currently fogged water
    for (const terrain of ['grass', 'rock', 'sand'] as const) {
      game.state.tiles[index].terrain = terrain;
      expect(invalidCells()).toEqual([{ x: 35, y: 21, valid: false }]);
      expect(game.canPlace('shipyard', 34, 20)).toBe(false);
    }
    game.state.tiles[index].terrain = 'water'; game.state.tiles[index].ore = 1;
    expect(invalidCells()).toHaveLength(1); game.state.tiles[index].ore = 0;
    game.state.explored[index] = 0; expect(invalidCells()).toHaveLength(1); game.state.explored[index] = 1;
    const ship = spawn(game, 'destroyer', 35.5, 21.5);
    expect(game.canPlace('shipyard', 34, 20)).toBe(false);
    ship.hp = 0; expect(game.canPlace('shipyard', 34, 20)).toBe(true);
    expect(game.canPlace('shipyard', 34.5, 20)).toBe(false);
    const base = game.state.entities[0]; base.x = 55;
    expect(game.canPlace('shipyard', 61, 20)).toBe(false);
  });

  it('rejects native border/padding water even when explored and in reach', () => {
    const map = parseNativeMap(readFileSync('public/maps/emerald-divide.map', 'utf8'));
    const game = new Game({ map, ai: false });
    // A foundation straddling LocalSize: display y begins at 4, while x/y
    // here are the native isometric cell coordinates used by the simulation.
    const x = 51, y = 51;
    game.state.entities = []; spawn(game, 'power', 55, 55);
    game.state.explored.fill(1);
    for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 4; dx++) {
      const tile = game.state.tiles[(y + dy) * game.state.width + x + dx]; tile.terrain = 'water'; tile.ore = 0;
    }
    const cells = placementCells(game.state, game.defs, 'shipyard', x, y);
    expect(cells.some(cell => isWithinLocalMap(cell, map))).toBe(true);
    expect(cells.some(cell => !isWithinLocalMap(cell, map))).toBe(true);
    for (const cell of cells) expect(cell.valid).toBe(isWithinLocalMap(cell, map));
    expect(game.canPlace('shipyard', x, y)).toBe(false);
    expect(game.canPlace('shipyard', 0, 0)).toBe(false);
  });

  it('uses the longer reach for normal paid-ready placement and cannot consume invalid plots', () => {
    const { game, base } = sea();
    spawn(game, 'conyard', 16, 16); spawn(game, 'refinery', 16, 22);
    (game as any).spawn('conyard', 1, 52, 52); // Keep the staged match active.
    expect(game.place('shipyard', 34, 20)).toBe(false);
    expect(game.build('shipyard')).toBe(true);
    game.configureLocalTools({ instantBuild: true }); game.tick(.1);
    const queue = game.state.sides[0].queues.structures, item = queue[0];
    expect(item.ready).toBe(true); expect(item.spent).toBe(game.defs.shipyard.cost);
    expect(game.place('shipyard', 35, 20)).toBe(false); expect(queue[0]).toBe(item);
    expect(game.place('shipyard', 34, 20)).toBe(true); expect(queue).toHaveLength(0);
    const yard = game.state.entities.find(e => e.type === 'shipyard')!;
    expect(yard.constructing).toBeDefined(); expect([yard.x, yard.y]).toEqual([34, 20]);
    expect(base.hp).toBeGreaterThan(0);
  });
});
