import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import type { Entity } from '../src/game/types';

function arena(type = 'grizzly', rank: Entity['rank'] = 0, deployed = false) {
  const game = new Game({ ai: false, automaticSovietWaves: false });
  game.setGameSpeed(1);

  for (const tile of game.state.tiles) {
    tile.terrain = 'grass';
    tile.ore = 0;
  }

  const unit = game.state.entities.find((e) => e.type === 'grizzly')!;
  const target = game.state.entities.find((e) => e.type === 'rhino')!;
  Object.assign(unit, {
    type,
    rank,
    deployed,
    x: 20.5,
    y: 30.5,
    facing: 0,
    turretFacing: 0,
    hp: game.defs[type].hp,
    maxHp: game.defs[type].hp,
  });
  Object.assign(target, { x: 23.5, y: 30.5, hp: 10000, maxHp: 10000, cooldown: 9999 });
  game.state.entities = game.state.entities.filter(
    (e) => e.type === 'conyard' || e === unit || e === target,
  );
  game.state.fog.fill(1);
  game.state.explored.fill(1);

  return { game, unit, target };
}

function frames(game: Game, count: number) {
  for (let i = 0; i < count; i++) game.tick(1 / 30);
}

function nextShot(game: Game, unit: Entity) {
  const before = unit.firedAt;

  for (let i = 0; i < 300 && unit.firedAt === before; i++) game.tick(1 / 30);
  expect(unit.firedAt).not.toBe(before);

  return unit.firedAt!;
}

describe('veterancy changes actual combat', () => {
  it.each([
    ['grizzly', false, false],
    ['gi', false, true],
    ['gi', true, true],
  ] as const)(
    '%s (deployed=%s) applies rank damage and authored firing cadence',
    (type, deployed, veteranRof) => {
      const intervals: number[] = [];

      for (const rank of [0, 1, 2] as const) {
        const { game, unit, target } = arena(type, rank, deployed);
        game.orderAttack([unit.id], target.id);

        const first = nextShot(game, unit),
          def = game.defs[type];

        const verses = (deployed ? def.deployedVerses : def.verses)!;
        expect(target.hp).toBeCloseTo(
          10000 - (deployed ? def.deployedDamage! : def.damage) * verses[5] * (1 + rank * 0.1),
        );
        const baseRate = deployed ? def.deployedFireRate! : def.fireRate;
        const rate = baseRate * (rank === 2 || (rank === 1 && veteranRof) ? 0.6 : 1);
        expect(unit.cooldown).toBeGreaterThanOrEqual(rate);
        expect(unit.cooldown).toBeLessThanOrEqual(rate + 2 / 30);
        intervals.push(nextShot(game, unit) - first);
      }

      expect(intervals[2]).toBeLessThan(intervals[0]);

      if (veteranRof) {
        expect(intervals[1]).toBeLessThan(intervals[0]);
        expect(intervals[2]).toBeCloseTo(intervals[1]);
      } else expect(intervals[1]).toBeCloseTo(intervals[0]);
    },
  );

  it('uses a newly promoted rank for the next shot', () => {
    const { game, unit, target } = arena();
    game.orderAttack([unit.id], target.id);
    nextShot(game, unit);

    for (const rank of [1, 2] as const) {
      unit.rank = rank;
      const hp = target.hp;
      nextShot(game, unit);
      expect(hp - target.hp).toBeCloseTo(65 * (1 + rank * 0.1));
      expect(unit.cooldown).toBeLessThanOrEqual(2 * (rank === 2 ? 0.6 : 1) + 2 / 30);
    }
  });

  it.each([false, true])(
    'carries elite damage into both rocket impacts and preserves burst spacing (force fire=%s)',
    (force) => {
      const run = (rank: 0 | 2) => {
        const { game, unit, target } = arena('ifv', rank);

        if (force) game.orderForceFire([unit.id], target.x, target.y);
        else game.orderAttack([unit.id], target.id);

        const first = nextShot(game, unit),
          second = nextShot(game, unit);

        const reload = unit.cooldown;
        expect(target.hp).toBe(10000); // Rockets apply damage at impact, not launch.
        game.stop([unit.id]);
        frames(game, 30);
        expect(target.hp).toBeCloseTo(10000 - 2 * 25 * 0.35 * (rank === 2 ? 1.2 : 1));

        return { spacing: second - first, reload };
      };

      const rookie = run(0),
        elite = run(2);

      expect(elite.spacing).toBeCloseTo(rookie.spacing);
      expect(elite.reload).toBeCloseTo(rookie.reload - (50 / 30) * 0.4);
    },
  );

  it.each([0, 1, 2] as const)(
    "carries rank %s damage through the carrier's Hornet strike",
    (rank) => {
      const { game, unit, target } = arena('carrier', rank);
      game.orderAttack([unit.id], target.id);
      nextShot(game, unit);
      const plane = game.state.entities.find((e) => e.type === 'hornet' && e.homeId === unit.id)!;
      expect(plane.rank).toBe(rank);
      expect(unit.cooldown).toBe(rank ? 3 : 5);
      nextShot(game, plane);
      expect(target.hp).toBeCloseTo(10000 - 40 * (1 + rank * 0.1));
    },
  );
});

describe('elite automatic healing', () => {
  it.each(['gi', 'grizzly', 'harrier'])(
    'heals damaged elite %s to full for free without a repair facility',
    (type) => {
      const { game, unit, target } = arena(type, 2);
      target.x = 50.5;
      unit.hp = unit.maxHp - 7;
      const money = game.state.sides[0].money;
      frames(game, 89);
      expect(unit.hp).toBe(unit.maxHp - 7);
      frames(game, 1);
      expect(unit.hp).toBe(unit.maxHp - 2);
      frames(game, 90);
      expect(unit.hp).toBe(unit.maxHp);
      frames(game, 180);
      expect(unit.hp).toBe(unit.maxHp);
      expect(game.state.sides[0].money).toBe(money);
      unit.hp -= 1;
      frames(game, 89);
      expect(unit.hp).toBe(unit.maxHp - 1);
      frames(game, 1);
      expect(unit.hp).toBe(unit.maxHp);
    },
  );

  it('does not heal recruits, veterans, buildings, George, embarked or destroyed units', () => {
    const { game, unit, target } = arena();
    target.x = 50.5;

    const variants: Partial<Entity>[] = [
      { rank: undefined },
      { rank: 1 },
      { type: 'pillbox', rank: 2 },
      { type: 'george', rank: 2 },
      { rank: 2, transportId: 9000 },
      { rank: 2, hp: 0 },
    ];

    const units = variants.map((variant, i) => ({
      ...unit,
      id: 8000 + i,
      hp: 50,
      x: 10.5 + i * 2,
      ...variant,
    }));

    game.state.entities.push(...units);
    frames(game, 180);
    expect(units.map((e) => e.hp)).toEqual([50, 50, 50, 50, 50, 0]);
    expect(game.state.entities).not.toContain(units.at(-1));
  });

  it('keeps healing progress across move, attack and stop orders', () => {
    const { game, unit, target } = arena('grizzly', 2);
    unit.hp = 50;
    frames(game, 30);
    game.orderMove([unit.id], unit.x, unit.y + 2);
    frames(game, 30);
    game.orderAttack([unit.id], target.id);
    frames(game, 29);
    game.stop([unit.id]);
    expect(unit.hp).toBe(50);
    frames(game, 1);
    expect(unit.hp).toBe(55);
  });

  it('heals during combat, respects pause, and follows simulation time at different render rates/speeds', () => {
    for (const [hz, speed] of [
      [30, 1],
      [60, 1],
      [60, 2],
      [144, 2],
    ]) {
      const { game, unit, target } = arena('grizzly', 2);
      unit.hp = 50;
      game.orderAttack([unit.id], target.id);
      game.setGameSpeed(speed);

      for (let i = 0; i < (hz * 3) / speed; i++) game.tick(1 / hz);
      expect(unit.hp).toBe(55);
      expect(target.hp).toBeLessThan(10000);
      game.state.paused = true;
      frames(game, 180);
      expect(unit.hp).toBe(55);
      game.state.paused = false;

      for (let i = 0; i < (hz * 3) / speed; i++) game.tick(1 / hz);
      expect(unit.hp).toBe(60);
    }
  });
});
