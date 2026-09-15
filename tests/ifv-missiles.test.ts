import { expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { entity } from './helpers/fixtures';

function arena(passenger?: string) {
  const game = new Game({ ai: false, automaticSovietWaves: false });
  game.setGameSpeed(1);

  for (const tile of game.state.tiles) {
    tile.terrain = 'grass';
    tile.ore = 0;
  }

  const attacker = game.state.entities.find((e) => e.type === 'grizzly')!;
  const target = game.state.entities.find((e) => e.type === 'rhino')!;
  Object.assign(attacker, { type: 'ifv', x: 20.5, y: 30.5, facing: 0, turretFacing: 0 });
  Object.assign(target, { x: 25.5, y: 30.5, hp: 1000, maxHp: 1000, cooldown: 999 });
  game.state.entities = game.state.entities.filter(
    (e) => e.type === 'conyard' || e === attacker || e === target,
  );

  if (passenger) attacker.passengers = [entity({ type: passenger })];
  game.state.fog.fill(1);
  game.state.explored.fill(1);
  game.orderAttack([attacker.id], target.id);

  return { game, attacker, target };
}

const frames = (game: Game, count: number) => {
  for (let i = 0; i < count; i++) game.tick(1 / 30);
};

it('launches two rockets before either hit, then applies each impact and damage once at arrival', () => {
  const { game, target } = arena();
  frames(game, 6);
  expect(game.state.effects.filter((e) => e.kind === 'missile')).toHaveLength(2);
  expect(game.state.effects.some((e) => e.kind === 'impact')).toBe(false);
  expect(target.hp).toBe(1000);
  frames(game, 30);
  expect(game.state.effects.filter((e) => e.kind === 'missile')).toHaveLength(0);
  expect(game.state.effects.filter((e) => e.kind === 'impact').map((e) => e.animation)).toEqual([
    'XGRYSML2',
    'XGRYSML2',
  ]);
  expect(target.hp).toBe(1000 - 2 * 25 * 0.35);
  frames(game, 10);
  expect(target.hp).toBe(1000 - 2 * 25 * 0.35);
});

it('tracks a moving target and keeps an already launched rocket when its IFV is destroyed', () => {
  const { game, attacker, target } = arena();
  frames(game, 1);
  const missile = game.state.effects.find((e) => e.missile)!;
  attacker.hp = 0;
  target.y += 2;
  frames(game, 1);
  expect(missile.to).toEqual({ x: target.x, y: target.y });
  expect(missile.y).toBeGreaterThan(missile.missile!.previous.y);
  frames(game, 40);
  expect(target.hp).toBe(1000 - 25 * 0.35);
});

it('finishes at the last known point when a target disappears, without damaging another unit', () => {
  const { game, attacker, target } = arena();
  frames(game, 1);

  const missile = game.state.effects.find((e) => e.missile)!,
    destination = { ...missile.to! };

  const bystander = { ...target, id: 9000, side: 0 };
  game.state.entities = game.state.entities.filter((e) => e !== target && e !== attacker);
  game.state.entities.push(bystander);
  frames(game, 33);
  const impact = game.state.effects.find((e) => e.kind === 'impact')!;
  expect({ x: impact.x, y: impact.y }).toEqual(destination);
  expect(bystander.hp).toBe(1000);
});

it('supports force-fire ground rockets and ends flight cleanly on pause/restart', () => {
  const { game, attacker } = arena();
  game.orderForceFire([attacker.id], 25.5, 32.5);
  frames(game, 10);
  const missile = game.state.effects.find((e) => e.missile)!;
  expect(missile).toBeDefined();
  const before = structuredClone(missile);
  game.state.paused = true;
  frames(game, 30);
  expect(missile).toEqual(before);
  game.state.paused = false;
  frames(game, 40);
  expect(game.state.effects.some((e) => e.kind === 'impact' && e.x === 25.5 && e.y === 32.5)).toBe(
    true,
  );
  game.restart();
  expect(game.state.effects).toEqual([]);
});

it('raises rockets to airborne vehicle height and drops them to a landed target', () => {
  const { game, target } = arena();
  target.type = 'nighthawk';
  frames(game, 1);
  const missile = game.state.effects.find((e) => e.missile)!;
  expect(missile.missile!.targetHeight).toBe(32);
  frames(game, 5);
  expect(missile.height).toBeGreaterThan(21);
  target.landed = true;
  frames(game, 1);
  expect(missile.missile!.targetHeight).toBe(0);
  target.type = 'rocketeer';
  frames(game, 1);
  expect(missile.missile!.targetHeight).toBe(26);
});

it('keeps force-fire aimed at the commanded ground point when its original occupant moves away', () => {
  const { game, attacker, target } = arena();
  game.orderForceFire([attacker.id], target.x, target.y);
  frames(game, 1);

  const missile = game.state.effects.find((e) => e.missile)!,
    destination = { ...missile.to! };

  target.y += 2;
  frames(game, 1);
  expect(missile.to).toEqual(destination);
  frames(game, 34);
  expect(target.hp).toBe(1000);
  expect(
    game.state.effects.some(
      (e) => e.kind === 'impact' && e.x === destination.x && e.y === destination.y,
    ),
  ).toBe(true);
});

it.each(['gi', 'spy', 'sniper', 'tanya', 'chrono_legionnaire', 'engineer'])(
  'keeps the %s passenger weapon out of missile mode',
  (passenger) => {
    const { game } = arena(passenger);
    frames(game, 30);
    expect(game.state.effects.some((e) => e.kind === 'missile')).toBe(false);
  },
);
