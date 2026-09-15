import { describe, expect, it } from 'vitest';
import { turnFacing, type FacingTurn } from '../src/game/facing';
import { Game } from '../src/game/Game';

const difference = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

describe('authored integer ROT facing', () => {
  it('takes twelve frames for a quarter-turn at ROT5, following the shortest direction without overshooting', () => {
    let facing = 0,
      turn: FacingTurn | undefined;

    for (let frame = 1; frame <= 12; frame++) {
      const result = turnFacing(facing, Math.PI / 2, 5, turn);
      facing = result.facing;
      turn = result.turn;
      expect(facing).toBeGreaterThan(0);
      expect(facing).toBeLessThanOrEqual(Math.PI / 2);

      if (frame < 12) expect(facing).toBeLessThan(Math.PI / 2);
    }

    expect(facing).toBeCloseTo(Math.PI / 2, 8);
  });
  it('holds a fresh 90 or 180 degree order in place until the authored turn completes, then moves at full speed', () => {
    for (const [heading, target, frames] of [
      [0, Math.PI / 2, 12],
      [-Math.PI / 2, Math.PI / 2, 25],
    ] as const) {
      const game = new Game({ ai: false }),
        tank = game.state.entities.find((e) => e.type === 'grizzly')!;

      game.setGameSpeed(1); // Inspect one authored logic frame per tick.
      tank.x = 20.5;
      tank.y = 35.5;
      tank.previous = { x: tank.x, y: tank.y };
      tank.facing = heading;
      game.orderMove([tank.id], 20.5, 38.5);

      for (let frame = 0; frame < frames; frame++) {
        game.tick(1 / 30);
        expect(tank.x).toBe(20.5);
        expect(tank.y).toBe(35.5);
      }

      expect(difference(tank.facing, target)).toBeCloseTo(0, 8);
      game.tick(1 / 30);
      expect(tank.y - 35.5).toBeCloseTo(game.defs[tank.type].speed / 30, 8);
    }
  });
  it('continues translating through a bend on an already moving route', () => {
    const game = new Game({ ai: false }),
      tank = game.state.entities.find((e) => e.type === 'grizzly')!;

    game.setGameSpeed(1); // Inspect one authored logic frame per tick.
    tank.x = 20.5;
    tank.y = 34.5;
    tank.previous = { x: tank.x, y: tank.y };
    tank.facing = 0;
    game.orderMove([tank.id], 23.5, 35.5);
    let inMotion = false;

    for (let frame = 0; frame < 30; frame++) {
      const before = { x: tank.x, y: tank.y };
      game.tick(1 / 30);
      const distance = Math.hypot(tank.x - before.x, tank.y - before.y);

      if (distance > 0) inMotion = true;

      if (inMotion) expect(distance).toBeGreaterThan((game.defs[tank.type].speed / 30) * 0.7);
    }
  });
  it('wraps through zero and retargets from the current pose without snapping', () => {
    const initial = Math.PI * 2 - 0.2,
      first = turnFacing(initial, 0.2, 5);

    expect(difference(first.facing, initial)).toBeGreaterThan(0);
    expect(difference(first.facing, initial)).toBeLessThan(0.2);
    const retargeted = turnFacing(first.facing, Math.PI, 5, first.turn);
    expect(Math.abs(difference(retargeted.facing, first.facing))).toBeLessThan(0.15);
    expect(difference(retargeted.facing, first.facing)).toBeLessThan(0);
  });
  it('turns the moving hull at its native rate and lets a stationary turret aim independently', () => {
    const game = new Game({ ai: false });
    const tank = game.state.entities.find((e) => e.type === 'grizzly')!;
    game.setGameSpeed(1); // Inspect one authored logic frame per tick.
    tank.x = 20.5;
    tank.y = 35.5;
    tank.facing = 0;
    tank.turretFacing = 0;
    game.orderMove([tank.id], 20.5, 38.5);
    game.tick(1 / 30);
    expect(tank.facing).toBeGreaterThan(0);
    expect(tank.facing).toBeLessThan(Math.PI / 2);

    for (let i = 0; i < 11; i++) game.tick(1 / 30);
    expect(tank.facing).toBeCloseTo(Math.PI / 2, 8);
    game.stop([tank.id]);
    const friendly = game.state.entities.find((e) => e.type === 'gi')!;
    friendly.x = 22.5;
    friendly.y = tank.y;
    game.orderAttack([tank.id], friendly.id, true);

    for (let i = 0; i < 15; i++) game.tick(1 / 30);
    expect(tank.facing).toBeCloseTo(Math.PI / 2, 8);
    expect(difference(tank.turretFacing!, 0)).toBeCloseTo(0, 4);
    expect(friendly.hp).toBeLessThan(friendly.maxHp);
  });
  it('does not rotate a miners hull while digging an ore cell', () => {
    const game = new Game({ ai: false }),
      miner = game.state.entities.find((e) => e.type === 'miner')!;

    const ore = game.state.tiles.findIndex((t) => t.ore > 0 && t.terrain === 'grass');
    miner.x = (ore % game.state.width) + 0.5;
    miner.y = Math.floor(ore / game.state.width) + 0.5;
    miner.facing = 0.7;
    game.state.explored.fill(1);
    game.orderHarvest([miner.id], miner.x, miner.y);

    for (let i = 0; i < 30; i++) game.tick(1 / 30);
    expect(miner.cargo).toBeGreaterThan(0);
    expect(miner.facing).toBeCloseTo(0.7, 3);
  });
});
