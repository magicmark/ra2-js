import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { oreMineFrame, updateOreMines } from '../src/game/oreMines';

describe('original ore mines', () => {
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
