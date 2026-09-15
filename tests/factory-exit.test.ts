import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { factoryExitLane } from '../src/game/factoryExit';
import type { Entity } from '../src/game/types';

const advance = (game: Game, seconds: number) => { for (let n = 0; n < Math.round(seconds * 30); n++) game.tick(1 / 30); };
function arena(soviet = false) {
  const game = new Game({ ai: false }); game.setGameSpeed(1);
  game.state.entities = game.state.entities.filter(e => e.type === 'conyard');
  for (const tile of game.state.tiles) { tile.terrain = 'grass'; tile.ore = 0; }
  game.state.explored.fill(1); game.state.fog.fill(1);
  const side = soviet ? 1 : 0, suffix = soviet ? '_soviet' : '';
  game.state.sides[side].money = 1_000_000;
  const spawn = (type: string, x: number, y: number): Entity => (game as any).spawn(type, side, x, y);
  spawn(`refinery${suffix}`, 20, 38); spawn(`barracks${suffix}`, 25, 38); spawn(`power${suffix}`, 20, 42);
  const factory = spawn(`warfactory${suffix}`, 20, 30); factory.rally = undefined;
  (game as any).rebuildBlocked();
  const queue = (type = soviet ? 'rhino' : 'grizzly') => {
    expect(game.build(type, side)).toBe(true);
    const item = game.state.sides[side].queues.vehicles.at(-1)!;
    item.progress = 1; item.spent = game.defs[type].cost;
    return item;
  };
  const produced = () => game.state.entities.filter(e => e.factoryExit?.factoryId === factory.id);
  return { game, factory, spawn, queue, produced, side };
}

describe('War Factory vehicle exit', () => {
  for (const soviet of [false, true]) it(`${soviet ? 'Soviet' : 'Allied'} vehicles start concealed inside and drive continuously through the +X doorway`, () => {
    const { game, factory, queue, produced } = arena(soviet), lane = factoryExitLane(factory);
    queue(); advance(game, 1 / 30);
    const unit = produced()[0];
    expect(unit.previous).toEqual(lane.start);
    expect(unit.x).toBeCloseTo(lane.start.x + game.defs[unit.type].speed / 30);
    expect(unit).toMatchObject({ y: lane.start.y, facing: 0, turretFacing: 0, order: 'move' });
    expect(unit.x).toBeLessThan(factory.x + 5);
    let previous = unit.x;
    while (unit.factoryExit) {
      advance(game, 1 / 30);
      expect(unit.x).toBeGreaterThan(previous);
      expect(unit.x - previous).toBeLessThanOrEqual(game.defs[unit.type].speed / 30 + 1e-8);
      expect(unit.y).toBe(lane.end.y); previous = unit.x;
    }
    expect(unit.x).toBe(lane.end.x);
    advance(game, 5); expect(unit.x).toBeGreaterThan(lane.end.x + 1);
  });

  it('serializes queued vehicles, clears the mouth without a rally, and preserves paid blocked production', () => {
    const { game, queue, produced, side } = arena(); queue(); const waiting = queue();
    advance(game, 1 / 30); const first = produced()[0], money = game.state.sides[side].money;
    advance(game, .5);
    expect(produced()).toEqual([first]); expect(game.state.sides[side].queues.vehicles).toEqual([waiting]);
    expect(waiting.progress).toBe(1); expect(game.state.sides[side].money).toBe(money);
    advance(game, 8);
    const tanks = game.state.entities.filter(e => e.type === 'grizzly');
    expect(tanks).toHaveLength(2); expect(produced()).toHaveLength(0);
    expect(game.state.sides[side].queues.vehicles).toEqual([]);
    expect(Math.hypot(tanks[0].x - tanks[1].x, tanks[0].y - tanks[1].y)).toBeGreaterThan(.48);
  });

  it('holds a finished unit when the actual exit is blocked, then emerges normally when cleared', () => {
    const { game, factory, queue, produced, spawn, side } = arena(), end = factoryExitLane(factory).end;
    const blocker = spawn('grizzly', end.x, end.y); const item = queue();
    advance(game, 1); expect(produced()).toEqual([]); expect(game.state.sides[side].queues.vehicles).toEqual([item]);
    blocker.x += 3; advance(game, 1 / 30); expect(produced()).toHaveLength(1);
  });

  it('uses another owned factory when the first doorway is blocked', () => {
    const { game, factory, queue, spawn } = arena(); const end = factoryExitLane(factory).end;
    spawn('grizzly', end.x, end.y); const second = spawn('warfactory', 30, 30); (game as any).rebuildBlocked();
    queue(); advance(game, 1 / 30);
    expect(game.state.entities.find(e => e.factoryExit)?.factoryExit?.factoryId).toBe(second.id);
  });

  it('stops for an obstruction introduced during departure and never opens the foundation to ordinary units', () => {
    const { game, factory, queue, produced, spawn } = arena(); queue(); advance(game, 1 / 30);
    const unit = produced()[0], blocker = spawn('grizzly', factory.x + 4, factory.y + 1);
    advance(game, 1); const x = unit.x; advance(game, 1);
    expect(unit.x).toBe(x); expect(unit.factoryExit).toBeDefined();
    expect((game as any).isPassable(factory.x + 4, factory.y + 1, blocker)).toBe(false);
    blocker.x += 5; advance(game, 5); expect(unit.factoryExit).toBeUndefined();
  });

  it('finishes the exit before obeying its rally and cannot be stopped or deployed inside', () => {
    const { game, factory, queue, produced, spawn } = arena(); factory.rally = { x: 30.5, y: 36.5 };
    spawn('service_depot', 30, 40); (game as any).rebuildBlocked();
    queue('mcv'); advance(game, 1 / 30); const unit = produced()[0];
    expect(unit).toBeDefined();
    game.stop([unit.id]); game.orderMove([unit.id], 10, 10); game.deploy([unit.id]);
    expect(unit.factoryExit).toBeDefined(); expect(unit.order).toBe('move');
    advance(game, 20); expect(unit.factoryExit).toBeUndefined();
    expect(unit.x).toBeCloseTo(30.5); expect(unit.y).toBeCloseTo(36.5);
  });

  it('hands produced miners to harvesting only after they leave the factory', () => {
    const { game, factory, queue, produced } = arena(); factory.rally = { x: 50.5, y: 50.5 };
    game.state.tiles[34 * game.state.width + 29].ore = 500;
    queue('miner'); advance(game, 1 / 30); const unit = produced()[0];
    expect(unit.order).toBe('move'); expect(unit.cargo).toBe(0);
    advance(game, 15); expect(unit.factoryExit).toBeUndefined(); expect(unit.cargo).toBeGreaterThan(0);
    expect(unit.x).toBeLessThan(40);
  });

  it('releases the factory lane when Chronosphere relocates a departing vehicle', () => {
    const { game, queue, produced, spawn } = arena();
    const sphere = spawn('chronosphere', 30, 40); spawn('power', 35, 40); spawn('power', 38, 40);
    (game as any).rebuildBlocked(); queue(); advance(game, 1 / 30);
    const unit = produced()[0]; sphere.recharge = game.defs.chronosphere.recharge;
    expect(game.activateSuperweapon('chronosphere', { x: 40.5, y: 45.5 }, unit)).toBe(true);
    expect(unit.factoryExit).toBeUndefined(); advance(game, 5);
    expect(unit.x).toBe(40.5); expect(unit.y).toBe(45.5);
  });

  it('keeps a visibly departing Mirage targetable until it stops outside', () => {
    const { game, queue, produced, spawn } = arena(); spawn('battlelab', 30, 40);
    queue('mirage_tank'); advance(game, 1 / 30); const unit = produced()[0];
    const enemy = (game as any).spawn('rhino', 1, unit.x + 4, unit.y);
    expect((game as any).canTarget(enemy, unit)).toBe(true);
    unit.factoryExit = undefined; expect((game as any).canTarget(enemy, unit)).toBe(false);
  });

  it('pauses the departure, scales it with game speed, and completes after factory sale or destruction', () => {
    for (const removal of ['sale', 'destroy'] as const) {
      const { game, factory, queue, produced } = arena(); queue(); advance(game, 1 / 30); const unit = produced()[0], x = unit.x;
      game.state.paused = true; advance(game, 1); expect(unit.x).toBe(x);
      game.state.paused = false; game.setGameSpeed(2); advance(game, 1 / 30);
      expect(unit.x - x).toBeCloseTo(game.defs[unit.type].speed * 2 / 30);
      if (removal === 'sale') expect(game.sell(factory.id)).toBe(true); else factory.hp = 0;
      advance(game, 5); expect(unit.factoryExit).toBeUndefined(); expect(unit.x).toBeGreaterThan(factory.x + 5);
    }
  });
});
