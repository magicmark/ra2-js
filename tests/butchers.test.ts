import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { parseNativeMap } from '../src/game/maps/nativeMap';
import { NATIVE_EFFECT_TIMINGS, NATIVE_INFANTRY_TIMINGS } from '../src/game/combat';

function advance(game: Game, seconds: number) {
  for (let n = 0; n < Math.ceil(seconds * 30); n++) game.tick(1 / 30);
}

function setup(native = false) {
  const map = native
    ? parseNativeMap(readFileSync('public/maps/frostline-basin.map', 'utf8'))
    : undefined;

  const game = new Game({ ai: false, map });

  for (const e of game.state.entities) if (game.defs[e.type].harvester) e.order = 'guard';
  game.state.sides[0].money = 30000;

  return game;
}

function placeReady(game: Game, type: string) {
  for (let y = 0; y < game.state.height; y++)
    for (let x = 0; x < game.state.width; x++) {
      if (game.canPlace(type, x, y)) {
        expect(game.place(type, x, y)).toBe(true);

        return game.state.entities.find((e) => e.type === type && e.x === x && e.y === y)!;
      }
    }

  throw new Error(`No legal ${type} plot in the actual map`);
}

function buildShop(game: Game) {
  expect(game.build('butchers')).toBe(true);
  advance(game, game.defs.butchers.buildTime + 1 / 30);
  expect(game.state.sides[0].queues.structures[0].ready).toBe(true);

  return placeReady(game, 'butchers');
}

describe('The Butcher’s and George', () => {
  it('has explicit Allied technology and noncombat inspector rules', () => {
    const { defs } = setup();
    expect(defs.butchers).toMatchObject({
      name: "The Butcher's",
      category: 'structures',
      faction: 'allied',
      cost: 1000,
      hp: 650,
      armor: 'steel',
      power: -30,
      footprint: [3, 3],
      requires: ['barracks', 'refinery'],
    });
    expect(defs.butchers.producer).toBeUndefined();
    expect(defs.george).toMatchObject({
      name: 'George',
      category: 'infantry',
      faction: 'allied',
      cost: 650,
      hp: 225,
      armor: 'flak',
      damage: 0,
      range: 0,
      requires: ['barracks', 'butchers'],
    });
    expect(defs.george.impact).toBeUndefined();
    expect(defs.george.description).toContain('Noncombat inspector');
    expect(defs.george.speed).toBe(defs.gi.speed);
  });

  for (const native of [false, true])
    it(`builds, places, unlocks and trains through the real ${native ? 'native' : 'procedural'} map queues`, () => {
      const game = setup(native),
        side = game.state.sides[0];

      expect(game.canBuild('george')).toEqual({ ok: false, reason: "Requires The Butcher's" });
      expect(game.build('george')).toBe(false);
      const shop = buildShop(game);
      expect(shop.hp).toBe(650);
      expect(side.powerUsed).toBeGreaterThanOrEqual(30);
      expect(game.canBuild('george').ok).toBe(true);
      const barracks = game.state.entities.find((e) => e.side === 0 && e.type === 'barracks')!;
      game.setGameSpeed(1);
      barracks.rally = { x: 1.5, y: 1.5 };
      const before = side.money;
      expect(game.build('george')).toBe(true);
      advance(game, game.defs.george.buildTime + 1 / 30);
      const george = game.state.entities.find((e) => e.type === 'george')!;
      expect(george).toMatchObject({ side: 0, hp: 225, maxHp: 225 });
      expect(Math.hypot(george.x - barracks.x, george.y - barracks.y)).toBeLessThan(6);
      expect(side.queues.infantry).toEqual([]);
      expect(before - side.money).toBeCloseTo(650);
      const start = { x: george.x, y: george.y };
      game.select([george.id]);
      expect(george.selected).toBe(false);
      advance(game, 6);
      expect(Math.hypot(george.x - start.x, george.y - start.y)).toBeGreaterThan(0.5);
    });

  it('rejects Soviet production even with captured Allied prerequisites, and ignores enemy/dead prerequisites', () => {
    const game = setup(),
      shop = buildShop(game);

    for (const id of ['butchers', 'george'])
      expect(game.canBuild(id, 1)).toEqual({ ok: false, reason: 'Unavailable to this faction' });
    shop.side = 1;

    for (const e of game.state.entities) if (['barracks', 'refinery'].includes(e.type)) e.side = 1;

    for (const id of ['butchers', 'george']) expect(game.build(id, 1)).toBe(false);
    expect(game.canBuild('butchers').reason).toBe('Requires Barracks');
    shop.side = 0;
    shop.hp = 0;
    const barracks = game.state.entities.find((e) => e.type === 'barracks')!;
    barracks.side = 0;
    expect(game.canBuild('george').reason).toBe("Requires The Butcher's");
  });

  for (const method of ['destroy', 'sell'] as const)
    it(`holds paid George progress when the shop is ${method === 'destroy' ? 'destroyed' : 'sold'}, then resumes after rebuilding`, () => {
      const game = setup(),
        shop = buildShop(game),
        side = game.state.sides[0];

      game.build('george');
      advance(game, 3);
      const item = side.queues.infantry[0];
      expect(item.progress).toBeGreaterThan(0);

      if (method === 'destroy') shop.hp = 0;
      else expect(game.sell(shop.id)).toBe(true);
      game.tick(1 / 30);

      const progress = item.progress,
        spent = item.spent,
        money = side.money;

      expect(item.blockedPrerequisite).toBe("Requires The Butcher's");
      expect(game.canBuild('george').ok).toBe(false);
      advance(game, 15);
      expect(item.progress).toBe(progress);
      expect(item.spent).toBe(spent);
      expect(side.money).toBe(money);
      expect(game.state.entities.some((e) => e.type === 'george')).toBe(false);
      buildShop(game);
      advance(game, game.defs.george.buildTime);
      expect(item.blockedPrerequisite).toBeUndefined();
      expect(side.queues.infantry).toEqual([]);
      expect(game.state.entities.filter((e) => e.type === 'george')).toHaveLength(1);
    });

  it('holds shop construction when Refinery is lost and can refund its actual spending', () => {
    const game = setup(),
      side = game.state.sides[0];

    game.build('butchers');
    advance(game, 4);

    const item = side.queues.structures[0],
      paid = item.spent;

    game.state.entities.find((e) => e.type === 'refinery')!.hp = 0;
    const cash = side.money;
    advance(game, 25);
    expect(game.canBuild('butchers').reason).toBe('Requires Ore Refinery');
    expect(item.blockedPrerequisite).toBe('Requires Ore Refinery');
    expect(item.spent).toBe(paid);
    expect(item.ready).toBe(false);
    game.cancelBuild('structures');
    expect(side.money).toBeCloseTo(cash + paid);
  });

  it('moves without attacking after original animation metadata is installed', () => {
    const game = setup(),
      george = game.state.entities.find((e) => e.type === 'gi')!,
      target = game.state.entities.find((e) => e.type === 'conscript')!;

    game.state.entities = game.state.entities.filter(
      (e) => e.type === 'conyard' || e === george || e === target,
    );

    for (const tile of game.state.tiles) {
      tile.terrain = 'grass';
      tile.ore = 0;
    }

    Object.assign(george, {
      type: 'george',
      hp: 225,
      maxHp: 225,
      x: 20.5,
      y: 30.5,
      previous: { x: 20.5, y: 30.5 },
    });
    Object.assign(target, { x: 50.5, y: 10.5, hp: 1000, maxHp: 1000 });
    game.setAnimationDefinitions(NATIVE_EFFECT_TIMINGS, NATIVE_INFANTRY_TIMINGS);
    advance(game, 2);
    expect(Math.hypot(george.x - 20.5, george.y - 30.5)).toBeGreaterThan(0.5);
    game.stop([george.id]);
    target.x = george.x + 2;
    target.y = george.y;
    game.tick(1 / 30);
    game.orderAttack([george.id], target.id);
    advance(game, 1);
    expect(george.firedAt).toBeUndefined();
    expect(george.targetId).toBeNull();
    expect(george.infantryAnimation).toBeUndefined();
    expect(target.hp).toBe(1000);
  });
});
