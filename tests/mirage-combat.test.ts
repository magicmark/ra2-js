import { expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import type { Entity } from '../src/game/types';

function arena(targetType: string, rank: Entity['rank'] = 0) {
  const game = new Game({ ai: false, automaticSovietWaves: false });
  game.setGameSpeed(1);

  for (const tile of game.state.tiles) {
    tile.terrain = 'grass';
    tile.ore = 0;
  }

  const attacker = game.state.entities.find((e) => e.type === 'grizzly')!;
  const target = game.state.entities.find((e) => e.type === 'rhino')!;
  Object.assign(attacker, { type: 'mirage_tank', x: 20.5, y: 30.5, rank: 0 });
  Object.assign(target, {
    type: targetType,
    x: 25.5,
    y: 30.5,
    hp: game.defs[targetType].hp,
    maxHp: game.defs[targetType].hp,
    rank,
    cooldown: 999,
  });
  game.state.entities = game.state.entities.filter(
    (e) => e.type === 'conyard' || e === attacker || e === target,
  );
  game.state.fog.fill(1);
  game.state.explored.fill(1);

  // Preserve spy disguise rules; force-fire exercises a heat-weapon hit on one.
  if (targetType === 'spy') game.orderForceFire([attacker.id], target.x, target.y);
  else game.orderAttack([attacker.id], target.id);

  return { game, attacker, target };
}

it.each([
  'gi',
  'conscript',
  'engineer',
  'attack_dog',
  'spy',
  'tanya',
  'sniper',
  'chrono_legionnaire',
])('kills a full-health %s with one Mirage shot, including veteran and elite infantry', (type) => {
  for (const rank of [0, 1, 2] as const) {
    const { game, target } = arena(type, rank);
    game.tick(1 / 30);
    expect(game.state.effects.filter((e) => e.kind === 'shot')).toHaveLength(1);
    expect(target.hp).toBe(0);
    expect(game.state.entities).not.toContain(target);
    expect(game.state.sides[0].kills).toBe(1);
  }
});

it('uses finite infantry damage: the tougher custom inspector survives and nearby infantry are unharmed', () => {
  const { game, target } = arena('george');

  const bystander = {
    ...target,
    id: 9000,
    type: 'conscript',
    hp: 125,
    maxHp: 125,
    y: target.y + 1,
    path: [],
  };

  game.state.entities.push(bystander);
  game.tick(1 / 30);
  expect(target.hp).toBe(75);
  expect(bystander.hp).toBe(125);
  expect(game.state.sides[0].kills).toBe(0);
});

it.each([
  ['ifv', 100],
  ['miner', 100],
  ['rhino', 100],
  ['power_soviet', 30],
  ['barracks_soviet', 20],
  ['wall', 20],
] as const)('retains native Mirage damage against %s armor', (type, damage) => {
  const { game, target } = arena(type);
  game.tick(1 / 30);
  expect(game.state.effects.filter((e) => e.kind === 'shot')).toHaveLength(1);
  expect(target.hp).toBe(target.maxHp - damage);
});

it('cannot shoot airborne infantry', () => {
  const { game, attacker, target } = arena('rocketeer');
  game.tick(1 / 30);
  expect(attacker.targetId).toBeNull();
  expect(game.state.effects.filter((e) => e.kind === 'shot')).toHaveLength(0);
  expect(target.hp).toBe(target.maxHp);
});
