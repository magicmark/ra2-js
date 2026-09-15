import { expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import type { Entity } from '../src/game/types';

function arena(targetX: number, navigable = false, targetType = 'rhino') {
  const game = new Game({ ai: false, automaticSovietWaves: false });
  game.setGameSpeed(1);
  game.state.entities = game.state.entities.filter((e) => e.type === 'conyard');

  for (const tile of game.state.tiles) {
    tile.terrain = 'grass';
    tile.ore = 0;
  }

  for (let y = 29; y <= 31; y++)
    for (let x = 8; x <= (navigable ? 45 : 8); x++)
      game.state.tiles[y * game.state.width + x].terrain = 'water';

  const spawn = (type: string, side: number, x: number, y: number): Entity =>
    game['spawn'](type, side, x, y);

  const carrier = spawn('carrier', 0, 8.5, 30.5);
  const target = spawn(targetType, 1, targetX, 30.5);
  // Keep mobile targets visible independently of the carrier's shorter sight.
  const scout = spawn('rocketeer', 0, targetX, 34.5);
  scout.disabledUntil = Infinity;
  target.hp = target.maxHp = 10000;
  target.disabledUntil = Infinity;
  game['rebuildBlocked']();
  game.state.fog.fill(1);
  game.state.explored.fill(1);

  const planes = () =>
    game.state.entities.filter((e) => e.type === 'hornet' && e.homeId === carrier.id);

  const advance = (seconds: number) => {
    for (let i = 0; i < Math.ceil(seconds * 30); i++) game.tick(1 / 30);
  };

  return { game, carrier, target, planes, advance };
}

it('cannot launch at or damage a distant target when no water route reaches attack range', () => {
  const { game, carrier, target, planes, advance } = arena(55.5);
  game.orderAttack([carrier.id], target.id);
  advance(20);
  expect(carrier).toMatchObject({ x: 8.5, y: 30.5, targetId: target.id });
  expect(planes()).toHaveLength(0);
  expect(carrier.firedAt).toBeUndefined();
  expect(target.hp).toBe(target.maxHp);
});

it('moves into carrier range before launching, then its aircraft damage the target', () => {
  const { game, carrier, target, planes, advance } = arena(50.5, true);
  game.orderAttack([carrier.id], target.id);

  for (let i = 0; i < 40 * 30 && !planes().length; i++) {
    const distanceBeforeTick = Math.hypot(target.x - carrier.x, target.y - carrier.y);
    game.tick(1 / 30);

    if (distanceBeforeTick > game.defs.carrier.range) expect(planes()).toHaveLength(0);
  }

  expect(carrier.x).toBeGreaterThan(8.5);
  expect(planes()).toHaveLength(1);
  expect(Math.hypot(target.x - carrier.x, target.y - carrier.y)).toBeLessThanOrEqual(
    game.defs.carrier.range,
  );
  advance(15);
  expect(target.hp).toBeLessThan(target.maxHp);
});

it.each(['rhino', 'power_soviet'])(
  'launches at a %s exactly at the carrier range boundary',
  (targetType) => {
    const { game, carrier, target, planes, advance } = arena(33.5, false, targetType);
    game.orderAttack([carrier.id], target.id);
    advance(1 / 30);
    expect(planes()).toHaveLength(1);
    expect(planes()[0]).toMatchObject({ targetId: target.id, order: 'attack' });
    expect(carrier).toMatchObject({ x: 8.5, y: 30.5 });
  },
);

it('checks the actual target range when force-firing at a nearby ground point', () => {
  const { game, carrier, target, planes, advance } = arena(33.75);
  // The click is in range, but the entity within its hit radius is not.
  game.orderForceFire([carrier.id], 33.5, 30.5);
  advance(10);
  expect(planes()).toHaveLength(0);
  expect(target.hp).toBe(target.maxHp);
  expect(carrier.firedAt).toBeUndefined();
  target.x = 33.5;
  advance(1 / 30);
  expect(planes()).toHaveLength(1);
});
