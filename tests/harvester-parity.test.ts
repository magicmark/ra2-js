import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import type { Entity } from '../src/game/types';

const difference = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
function arena(type: 'miner' | 'warminer' | 'grizzly' = 'miner') {
  const game = new Game({ ai: false });
  game.setGameSpeed(1); // These mechanics checks count the 30-frame reference clock.
  const unit = game.state.entities.find(e => e.type === 'miner')!;
  unit.type = type; unit.x = 20.5; unit.y = 35.5; unit.previous = { x: unit.x, y: unit.y }; unit.facing = Math.PI;
  game.state.entities = game.state.entities.filter(e => e === unit || e.type === 'conyard' || e.type === 'refinery');
  for (const tile of game.state.tiles) { tile.terrain = 'grass'; tile.ore = 0; }
  game.state.explored.fill(1); game.state.fog.fill(1);
  return { game, unit };
}
function stepWithoutSwooping(game: Game, unit: Entity) {
  const before = { x: unit.x, y: unit.y, facing: unit.facing };
  game.tick(1 / 30);
  const moved = Math.hypot(unit.x - before.x, unit.y - before.y);
  if (moved > 1e-6) {
    expect(Math.abs(difference(unit.facing, before.facing))).toBeLessThan(1e-4);
    expect(Math.abs(difference(Math.atan2(unit.y - before.y, unit.x - before.x), unit.facing))).toBeLessThan(1e-4);
  }
  return moved;
}

describe('native harvester movement and gathering state', () => {
  it('turns before automatic ore departure and before every bend, then arrives without stalling', () => {
    for (const type of ['miner', 'warminer'] as const) {
      const { game, unit } = arena(type);
      game.state.tiles[36 * game.state.width + 24].ore = 500;
      let moved = 0;
      for (let i = 0; i < 200; i++) moved += stepWithoutSwooping(game, unit);
      expect(moved).toBeGreaterThan(3); expect(unit.cargo).toBeGreaterThan(0);
    }
  });

  it('turns in place at a route corner, including a partial-frame boundary, while straight sections keep full speed', () => {
    const { game, unit } = arena('grizzly'); game.stop([unit.id]); unit.facing = 0;
    unit.path = [{ x: 21.5, y: 35.5 }, { x: 21.5, y: 38.5 }];
    let turning = 0, moved = 0;
    for (let i = 0; i < 180; i++) {
      const oldFacing = unit.facing, distance = stepWithoutSwooping(game, unit); moved += distance;
      if (Math.abs(difference(oldFacing, unit.facing)) > 1e-4) { turning++; expect(distance).toBe(0); }
      if (unit.x < 21.4 && distance > 0) expect(distance).toBeCloseTo(game.defs.grizzly.speed / 30, 8);
    }
    expect(turning).toBeGreaterThan(0); expect(moved).toBeCloseTo(4, 8); expect(unit.path).toHaveLength(0);
  });

  it('keeps automatic refinery returns and repeat harvesting free of simultaneous turning and translation', () => {
    const { game, unit } = arena('warminer');
    const refinery = game.state.entities.find(e => e.type === 'refinery')!;
    refinery.x = 15; refinery.y = 35;
    game.state.tiles[35 * game.state.width + 22].ore = 3000;
    const initialMoney = game.state.sides[0].money;
    let deposits = 0, starts = 0, wasMining = false;
    for (let i = 0; i < 1500; i++) {
      stepWithoutSwooping(game, unit);
      if (unit.harvesting && !wasMining) starts++;
      wasMining = !!unit.harvesting;
      if (game.state.sides[0].money > initialMoney) deposits++;
      if (deposits && starts >= 2) break;
    }
    expect(deposits).toBeGreaterThan(0); expect(starts).toBeGreaterThanOrEqual(2);
    game.orderMove([unit.id], 26.5, 35.5); game.tick(1 / 30);
    expect(unit.harvesting).toBe(false);
  });

  it('only marks active gathering, freezes it on pause, and clears it after stop', () => {
    const { game, unit } = arena();
    game.state.tiles[35 * game.state.width + 20].ore = 500;
    game.orderHarvest([unit.id], unit.x, unit.y); game.tick(1 / 30);
    expect(unit.harvesting).toBe(true); const anim = unit.anim;
    game.state.paused = true; game.tick(1); expect(unit.anim).toBe(anim);
    game.state.paused = false; game.stop([unit.id]); game.tick(1 / 30);
    expect(unit.harvesting).toBe(false);
  });
});


describe('full Chrono Miner refinery teleport', () => {
  it('teleports over impassable terrain with original endpoint effects, unloads once, then drives back to harvest', () => {
    const { game, unit } = arena();
    const refinery = game.state.entities.find(e => e.type === 'refinery')!;
    refinery.x = 10; refinery.y = 35;
    game.state.tiles[35 * game.state.width + 22].ore = 3000;
    // Enclose the miner so a normal return route is impossible.
    for (let y = 34; y <= 36; y++) for (let x = 19; x <= 21; x++)
      if (x !== 20 || y !== 35) game.state.tiles[y * game.state.width + x].terrain = 'water';
    unit.cargo = game.defs.miner.capacity!; unit.path = [{ x: 22.5, y: 35.5 }];
    const before = { x: unit.x, y: unit.y }, money = game.state.sides[0].money;
    game.tick(1 / 30);
    expect(unit.x).toBeLessThan(15); expect(unit.path).toHaveLength(0);
    expect(unit.previous).toEqual({ x: unit.x, y: unit.y });
    expect(unit.order).toBe('return'); expect(unit.cargo).toBe(500);
    expect(game.state.sides[0].money).toBe(money);
    expect(game.state.effects.filter(e => e.animation)).toEqual([
      expect.objectContaining({ ...before, animation: 'WARPOUT', animationTicksPerFrame: 7, maxLife: 21 * 7 / 30 }),
      expect.objectContaining({ x: unit.x, y: unit.y, animation: 'WARPIN', animationTicksPerFrame: 7, maxLife: 10 * 7 / 30 }),
    ]);
    for (const tile of game.state.tiles) tile.terrain = 'grass';
    for (let i = 0; i < 33; i++) game.tick(1 / 30);
    expect(unit.cargo).toBe(0); expect(unit.order).toBe('harvest');
    expect(game.state.sides[0].money).toBe(money + 500);
    let gathering = false;
    for (let i = 0; i < 600; i++) {
      stepWithoutSwooping(game, unit);
      if (unit.harvesting) { gathering = true; break; }
    }
    expect(gathering).toBe(true); expect(game.state.sides[0].money).toBe(money + 500);
  });

  it('waits for a free dock, avoids other miners, and can use a captured Soviet refinery', () => {
    const { game, unit } = arena();
    const refinery = game.state.entities.find(e => e.type === 'refinery')!;
    refinery.type = 'refinery_soviet'; refinery.x = 10; refinery.y = 35;
    unit.cargo = 500;
    for (let y = 34; y <= 38; y++) for (let x = 9; x <= 14; x++) game.state.tiles[y * game.state.width + x].terrain = 'water';
    game.tick(1 / 30); expect(unit.x).toBe(20.5); expect(unit.cargo).toBe(500); expect(unit.path).toHaveLength(0);
    game.state.tiles[35 * game.state.width + 9].terrain = 'grass';
    const blocker = { ...unit, id: 999, x: 9.5, y: 35.5, order: 'guard' as const, path: [] };
    game.state.entities.push(blocker);
    game.tick(1 / 30); expect(unit.x).toBe(20.5);
    blocker.x = 25.5;
    game.tick(1 / 30); expect(unit.x).toBe(9.5); expect(unit.y).toBe(35.5);
  });

  it.each(['absent', 'enemy', 'selling', 'constructing', 'destroyed'])('does not teleport to an %s refinery', state => {
    const { game, unit } = arena();
    const refinery = game.state.entities.find(e => e.type === 'refinery')!;
    if (state === 'absent') game.state.entities = game.state.entities.filter(e => e !== refinery);
    if (state === 'enemy') refinery.side = 1;
    if (state === 'selling') refinery.selling = { startedAt: 0, duration: 10 } as any;
    if (state === 'constructing') refinery.constructing = { startedAt: 0, duration: 10 };
    if (state === 'destroyed') refinery.hp = 0;
    unit.cargo = 500; game.tick(1 / 30);
    expect(unit.x).toBe(20.5); expect(unit.cargo).toBe(500);
    expect(game.state.effects.some(e => e.animation === 'WARPIN')).toBe(false);
  });

  it.each(['miner', 'warminer'] as const)('keeps manual moves and non-full %s returns on land', type => {
    const { game, unit } = arena(type);
    unit.cargo = 100; unit.order = 'return'; game.tick(1 / 30);
    expect(unit.x).toBeGreaterThan(19); expect(unit.path.length).toBeGreaterThan(0);
    unit.cargo = game.defs[type].capacity!;
    game.orderMove([unit.id], 25.5, 35.5); game.tick(1 / 30);
    expect(unit.x).toBeGreaterThan(19); expect(unit.order).toBe('move');
    expect(game.state.effects.some(e => e.animation === 'WARPIN')).toBe(false);
  });
});
