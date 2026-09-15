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
  it('requires a full dwell for each rank, caps at Elite and never heals on promotion', () => {
    const { game, george, target } = setup(); target.hp = 60;
    advance(game, 9.9);
    expect(target.rank ?? 0).toBe(0);
    expect(target.inspectedBy).toBe(george.id);
    expect(target.inspectionProgress).toBeCloseTo(.99);
    expect(inspectionStatus(george, game.state, game.defs)).toContain(`Inspecting ${game.defs[target.type].name}`);
    advance(game, .1); expect(target.rank).toBe(1); expect(target.hp).toBe(60);
    advance(game, 9.9); expect(target.rank).toBe(1);
    advance(game, .1); expect(target.rank).toBe(2);
    const promotedAt = target.promotedAt;
    advance(game, 25);
    expect(target.rank).toBe(2); expect(target.promotedAt).toBe(promotedAt);
    expect(target.hp).toBe(60); expect(george.inspection).toBeUndefined();
    expect(game.state.events.filter(e => e.text.includes('promoted'))).toHaveLength(2);
    expect(rankMultiplier(target)).toBe(1.2);
  });

  it('resets on range loss and on movement, without banking partial inspections', () => {
    const { game, george, target } = setup();
    advance(game, 6); target.x = george.x + INSPECTION_RULES.radius + .1;
    advance(game, 1 / 30); expect(george.inspection).toBeUndefined();
    target.x = george.x + 2; advance(game, 5);
    expect(target.rank ?? 0).toBe(0);
    game.orderMove([george.id], george.x, george.y + 1);
    advance(game, .2); expect(george.inspection).toBeUndefined();
    game.stop([george.id]); advance(game, 9.9); expect(target.rank ?? 0).toBe(0);
    advance(game, .1); expect(target.rank).toBe(1);
  });

  it('excludes enemies, neutral units, buildings, self, other Georges and max-rank units', () => {
    const { game, george, target, enemy, extra } = setup();
    target.rank = 2;
    enemy.x = george.x + 1; enemy.y = george.y;
    enemy.type = 'engineer'; // A noncombat enemy keeps this eligibility check isolated.
    Object.assign(extra, { type: 'george', x: george.x - 1, y: george.y });
    const neutral: Entity = { ...target, id: 998, side: -1, rank: 0, x: george.x, y: george.y - 1, path: [] };
    const building = game.state.entities.find(e => e.type === 'conyard' && e.side === 0)!;
    building.x = george.x; building.y = george.y + 1;
    game.state.entities.push(extra, neutral);
    advance(game, 22);
    expect(george.inspection).toBeUndefined();
    expect(extra.inspection).toBeUndefined();
    for (const e of [george, extra, enemy, neutral, building]) expect(e.rank ?? 0).toBe(0);
    expect(target.rank).toBe(2);
  });

  it('does not stack inspectors or transfer accumulated progress after target ownership changes', () => {
    const { game, george, target, extra } = setup();
    Object.assign(extra, { type: 'george', x: george.x - 1, y: george.y });
    game.state.entities.push(extra);
    advance(game, 5.1); expect(target.rank ?? 0).toBe(0);
    expect(target.inspectedBy).toBe(george.id); expect(extra.inspection).toBeUndefined();
    target.side = -1; advance(game, 1 / 30);
    expect(george.inspection).toBeUndefined(); expect(target.inspectionProgress).toBeUndefined();
    target.side = 0; advance(game, 9.9); expect(target.rank ?? 0).toBe(0);
    advance(game, .1); expect(target.rank).toBe(1);
    advance(game, 5.1); expect(target.rank).toBe(1);
  });

  it('clears a dead target and starts a new target from zero', () => {
    const { game, george, target, extra } = setup();
    advance(game, 8); target.hp = 0;
    Object.assign(extra, { x: george.x + 2, y: george.y + 1 }); game.state.entities.push(extra);
    advance(game, 1 / 30);
    expect(george.inspection?.targetId).toBe(extra.id);
    expect(george.inspection?.elapsed).toBeCloseTo(1 / 30);
    advance(game, 9); expect(extra.rank ?? 0).toBe(0);
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

  it('applies earned damage and durability bonuses without changing ranks through combat', () => {
    const { game, george, target, enemy } = setup();
    advance(game, 10); expect(target.rank).toBe(1);
    game.state.entities = game.state.entities.filter(e => e !== george);
    Object.assign(enemy, { x: target.x + 2, y: target.y, hp: 1000, maxHp: 1000, type: 'engineer', rank: 2 });
    game.tick(1 / 30); game.orderAttack([target.id], enemy.id);
    for (let frame = 0; frame < 30 && target.firedAt === undefined; frame++) game.tick(1 / 30);
    const armor = game.defs[target.type].verses?.[0] ?? 1; // Engineer has no armor.
    expect(enemy.hp).toBeCloseTo(1000 - game.defs.gi.damage * armor * 1.1 / 1.2);
    expect(target.rank).toBe(1); expect(enemy.rank).toBe(2);
  });
});
