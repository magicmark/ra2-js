import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { INSPECTION_RULES, inspectionStatus, rankMultiplier } from '../src/game/customUnits';
import type { Entity } from '../src/game/types';

function advance(game: Game, seconds: number) {
  for (let frame = 0; frame < Math.round(seconds * 30); frame++) game.tick(1 / 30);
}
function setup() {
  const game = new Game({ ai: false });
  game.setGameSpeed(1); // These mechanics checks count the 30-frame reference clock.
  const [george, target, extra] = game.state.entities.filter(e => e.type === 'gi');
  const enemy = game.state.entities.find(e => e.type === 'conscript')!;
  game.state.entities = game.state.entities.filter(e => e.type === 'conyard' || e === george || e === target || e === enemy);
  for (const tile of game.state.tiles) { tile.terrain = 'grass'; tile.ore = 0; }
  Object.assign(george, { type: 'george', hp: 225, maxHp: 225, x: 20.5, y: 30.5 });
  Object.assign(target, { x: 22.5, y: 30.5 });
  Object.assign(enemy, { x: 50.5, y: 10.5 });
  return { game, george, target, enemy, extra };
}

describe('George noncombat inspector', () => {
  it('pauses for three seconds, leaves without upgrading, and resumes wandering', () => {
    const { game, george, target } = setup(); target.hp = 60;
    advance(game, .1);
    const stopped = { x: george.x, y: george.y };
    expect(target.inspectedBy).toBe(george.id);
    expect(inspectionStatus(george, game.state, game.defs)).toContain(`Inspecting ${game.defs[target.type].name}`);
    advance(game, 2.8);
    expect(george.x).toBe(stopped.x); expect(george.y).toBe(stopped.y);
    expect(target.inspectionProgress).toBeCloseTo(2.9 / 3);
    advance(game, .1);
    expect(george.inspection).toBeUndefined(); expect(target.inspectedBy).toBeUndefined();
    expect(george.order).toBe('move'); expect(george.path.length).toBeGreaterThan(0);
    advance(game, 2);
    expect(Math.hypot(george.x - stopped.x, george.y - stopped.y)).toBeGreaterThan(.5);
    expect(george.inspection).toBeUndefined();
    advance(game, 30);
    expect(target.rank ?? 0).toBe(0); expect(target.promotedAt).toBeUndefined();
    expect(target.hp).toBe(60); expect(target.maxHp).toBe(game.defs.gi.hp);
    expect(rankMultiplier(target)).toBe(1);
    expect(game.state.events.filter(e => e.text.includes('promoted'))).toEqual([]);
  });

  for (const reason of ['range', 'ownership', 'death', 'transport'] as const) it(`ends an inspection on ${reason} loss and walks away`, () => {
    const { game, george, target } = setup(); advance(game, 1);
    if (reason === 'range') target.x = george.x + INSPECTION_RULES.radius + .1;
    if (reason === 'ownership') target.side = -1;
    if (reason === 'death') target.hp = 0;
    if (reason === 'transport') target.transportId = 999;
    advance(game, 1 / 30);
    expect(george.inspection).toBeUndefined(); expect(george.path.length).toBeGreaterThan(0);
    expect(target.rank ?? 0).toBe(0);
    if (reason !== 'death') expect(target.inspectedBy).toBeUndefined();
  });

  it('excludes enemies, neutral units, buildings, embarked units and other Georges; Elite units remain inspectable', () => {
    const { game, george, target, enemy, extra } = setup();
    target.rank = 2; advance(game, .1); expect(george.inspection?.targetId).toBe(target.id);
    target.transportId = 999;
    Object.assign(enemy, { type: 'engineer', x: george.x + 1, y: george.y });
    Object.assign(extra, { type: 'george', x: george.x - 1, y: george.y });
    const neutral: Entity = { ...target, id: 998, side: -1, rank: 0, transportId: undefined, x: george.x, y: george.y - 1, path: [] };
    const building = game.state.entities.find(e => e.type === 'conyard' && e.side === 0)!;
    building.x = george.x; building.y = george.y + 1;
    game.state.entities.push(extra, neutral);
    advance(game, 10);
    expect(george.inspection).toBeUndefined(); expect(extra.inspection).toBeUndefined();
    for (const e of [george, extra, enemy, neutral, building]) expect(e.rank ?? 0).toBe(0);
    expect(target.rank).toBe(2);
  });

  it('allows one inspector per target without accelerating or upgrading', () => {
    const { game, george, target, extra } = setup();
    Object.assign(extra, { type: 'george', x: george.x - 1, y: george.y }); game.state.entities.push(extra);
    advance(game, 1);
    expect(target.inspectedBy).toBe(george.id); expect(extra.inspection).toBeUndefined();
    expect(target.inspectionProgress).toBeCloseTo(1 / 3);
    advance(game, 20); expect(target.rank ?? 0).toBe(0);
  });

  it('rejects selection and all player orders while preserving autonomous movement', () => {
    const { game, george, target, enemy } = setup();
    game.state.entities = game.state.entities.filter(e => e !== target);
    advance(game, .1);
    game.select([george.id]); expect(george.selected).toBe(false);
    game.select([target.id], true); expect(george.selected).toBe(false);
    const before = structuredClone(george);
    game.orderMove([george.id], 1, 1); game.orderMove([george.id], 1, 1, true);
    game.orderForceMove([george.id], 1, 1); game.orderAttack([george.id], enemy.id, true);
    game.orderForceFire([george.id], 1, 1); game.orderWaypoints([george.id], [{ x: 1, y: 1 }]);
    game.orderGuard([george.id], 1, 1, enemy.id); game.stop([george.id]); game.guard([george.id]);
    game.scatter([george.id]); game.deploy([george.id]);
    expect(george).toEqual(before);
    advance(game, 2);
    expect(Math.hypot(george.x - before.x, george.y - before.y)).toBeGreaterThan(.5);
  });

  it('retries wandering after an impassable enclosure opens', () => {
    const { game, george, target } = setup(); game.state.entities = game.state.entities.filter(e => e !== target);
    for (const tile of game.state.tiles) tile.terrain = 'water';
    advance(game, 2); expect(george.path).toEqual([]);
    for (const tile of game.state.tiles) tile.terrain = 'grass';
    advance(game, 2); expect(Math.hypot(george.x - 20.5, george.y - 30.5)).toBeGreaterThan(.5);
  });

  it('never attacks or produces firing effects under attack, force-fire, retaliation or attack-move commands', () => {
    const { game, george, target, enemy } = setup();
    game.state.entities = game.state.entities.filter(e => e !== target);
    Object.assign(enemy, { x: george.x + 2, y: george.y, hp: 1000, maxHp: 1000 });
    game.tick(1 / 30); game.state.effects = [];
    game.orderAttack([george.id], enemy.id);
    game.orderAttack([george.id], enemy.id, true);
    game.orderForceFire([george.id], enemy.x, enemy.y);
    expect(game.state.effects).toEqual([]);
    let fired = false;
    for (let frame = 0; frame < 60; frame++) {
      game.tick(1 / 30);
      fired ||= game.state.effects.some(e => e.side === 0 && ['shot', 'impact', 'explosion'].includes(e.kind));
      expect(george.targetId).toBeNull(); expect(george.infantryAnimation).toBeUndefined();
    }
    expect(fired).toBe(false); expect(george.firedAt).toBeUndefined(); expect(enemy.hp).toBe(1000);
    expect(george.hp).toBeLessThan(225); // Incoming attacks never cause retaliation.
    const start = { x: george.x, y: george.y };
    game.orderMove([george.id], george.x - 2, george.y, true); advance(game, 1);
    expect(Math.hypot(george.x - start.x, george.y - start.y)).toBeGreaterThan(.5);
    expect(george.targetId).toBeNull(); expect(george.firedAt).toBeUndefined();
  });

  it('preserves independent veteran damage and durability bonuses', () => {
    const { game, george, target, enemy } = setup();
    target.rank = 1; // Veteran training from a Spy is independent of George.
    game.state.entities = game.state.entities.filter(e => e !== george);
    Object.assign(enemy, { x: target.x + 2, y: target.y, hp: 1000, maxHp: 1000, type: 'engineer', rank: 2 });
    game.tick(1 / 30); game.orderAttack([target.id], enemy.id);
    for (let frame = 0; frame < 30 && target.firedAt === undefined; frame++) game.tick(1 / 30);
    const armor = game.defs[target.type].verses?.[0] ?? 1; // Engineer has no armor.
    expect(enemy.hp).toBeCloseTo(1000 - game.defs.gi.damage * armor * 1.1 / 1.2);
    expect(target.rank).toBe(1); expect(enemy.rank).toBe(2);
  });
});
