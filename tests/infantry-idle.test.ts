import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { NATIVE_INFANTRY_TIMINGS } from '../src/game/combat';
import type { Entity } from '../src/game/types';

function arena() {
  const game = new Game({ ai: false }),
    original = game.state.entities.find((e) => e.type === 'gi')!;

  game.setGameSpeed(1); // Each sampled tick is one authored logic frame.

  const units = ['gi', 'conscript', 'engineer'].map((type, i) => ({
    ...structuredClone(original),
    id: 200 + i,
    type,
    x: 20.5 + i,
    y: 35.5,
    selected: false,
    path: [],
    targetId: null,
    order: 'guard' as const,
    previous: { x: 20.5 + i, y: 35.5 },
  }));

  game.state.entities = [...game.state.entities.filter((e) => e.type === 'conyard'), ...units];

  for (const tile of game.state.tiles) {
    tile.terrain = 'grass';
    tile.ore = 0;
  }

  return { game, units };
}

function frames(game: Game, count: number) {
  for (let i = 0; i < count; i++) game.tick(1 / 30);
}

function waitForIdle(game: Game, unit: Entity) {
  for (let tick = 0; tick < 1200 && !unit.infantryAnimation; tick++) game.tick(1 / 30);
  expect(unit.infantryAnimation?.sequence).toMatch(/^Idle[12]$/);
}

describe('original infantry idle actions', () => {
  it('plays both authored idle sequences and occasional facing changes without moving or synchronizing units', () => {
    const { game, units } = arena(),
      starts = units.map((): number[] => []),
      sequences = new Set<string>(),
      initial = units.map((e) => e.facing);

    let turns = 0;

    for (let tick = 0; tick < 1800; tick++) {
      game.tick(1 / 30);
      units.forEach((unit, i) => {
        const animation = unit.infantryAnimation;

        if (animation?.startedAt === game.state.time) {
          starts[i].push(tick);
          sequences.add(animation.sequence);
        }

        if (unit.facing !== initial[i]) turns++;
        expect([unit.x, unit.y]).toEqual([20.5 + i, 35.5]);
      });
    }

    expect([...sequences].sort()).toEqual(['Idle1', 'Idle2']);
    expect(starts.every((events) => events.length >= 3)).toBe(true);
    expect(starts[0]).not.toEqual(starts[1]);
    expect(starts[1]).not.toEqual(starts[2]);
    expect(turns).toBeGreaterThan(0);
  });
  it('immediately returns selected infantry to ready and lets move, deployment and attacks interrupt idle actions', () => {
    const {
      game,
      units: [unit],
    } = arena();

    waitForIdle(game, unit);
    game.select([unit.id]);
    expect(unit.infantryAnimation).toBeUndefined();
    const facing = unit.facing;
    frames(game, 360);
    expect(unit.infantryAnimation).toBeUndefined();
    expect(unit.facing).toBe(facing);
    game.select([]);
    waitForIdle(game, unit);
    game.orderMove([unit.id], 25.5, 35.5);
    expect(unit.infantryAnimation).toBeUndefined();
    frames(game, 30);
    expect(unit.x).toBeGreaterThan(20.5);
    expect(unit.infantryAnimation).toBeUndefined();
    game.stop([unit.id]);
    game.deploy([unit.id]);
    expect(unit.infantryAnimation?.sequence).toBe('Deploy');
    frames(game, 90);
    expect(unit.deployed).toBe(true);
    expect(unit.infantryAnimation).toBeUndefined();
  });
  it('uses simulation time, pauses exactly, and remains deterministic across browser cadence', () => {
    const run = (hz: number) => {
      const { game, units } = arena();

      for (let tick = 0; tick < hz * 30; tick++) game.tick(1 / hz);

      return units.map((unit) => ({ facing: unit.facing, animation: unit.infantryAnimation }));
    };

    expect(run(5)).toEqual(run(60));

    const {
      game,
      units: [unit],
    } = arena();

    waitForIdle(game, unit);

    const state = structuredClone(unit),
      time = game.state.time;

    game.state.paused = true;
    frames(game, 100);
    expect(unit).toEqual(state);
    expect(game.state.time).toBe(time);
    game.state.paused = false;
    game.setGameSpeed(2);
    game.tick(1 / 60);
    expect(game.state.time).toBeCloseTo(time + 1 / 30);
  });
  it('keeps ordinary combat usable when an old artwork cache has no optional effect sprites', () => {
    const {
      game,
      units: [unit],
    } = arena();

    game.setAnimationDefinitions({}, NATIVE_INFANTRY_TIMINGS);
    const target = game.state.entities.find((e) => e.side === 1)!;
    target.x = unit.x + 2;
    target.y = unit.y;
    game.state.fog.fill(1);
    game.orderAttack([unit.id], target.id);
    expect(() => frames(game, 60)).not.toThrow();
    expect(unit.firedAt).toBeDefined();
  });
});
