import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';

function arena() {
  const game = new Game({ ai: false }),
    engineer = game.state.entities.find((e) => e.type === 'gi')!,
    target = game.state.entities.find((e) => e.type === 'power_soviet')!;

  game.state.entities = game.state.entities.filter(
    (e) => e.type === 'conyard' || e === engineer || e === target,
  );

  for (const tile of game.state.tiles) {
    tile.terrain = 'grass';
    tile.ore = 0;
  }

  engineer.type = 'engineer';
  engineer.x = 20.5;
  engineer.y = 30.5;
  engineer.previous = { x: engineer.x, y: engineer.y };
  target.type = 'warfactory_soviet';
  target.x = 24;
  target.y = 30;
  target.hp = target.maxHp = game.defs.warfactory_soviet.hp;
  game['rebuildBlocked']();
  game.tick(0.3);

  return { game, engineer, target };
}

function advance(game: Game, seconds: number) {
  for (let i = 0; i < Math.round(seconds * 30); i++) game.tick(1 / 30);
}

describe('engineer structure entry', () => {
  it('accepts a building whose visible footprint edge is inside sight while its center remains hidden, paths to it and captures', () => {
    const { game, engineer, target } = arena();
    expect(game.state.fog[31 * game.state.width + 26]).toBe(0);
    expect(game.state.fog[30 * game.state.width + 24]).toBe(1);
    game.orderAttack([engineer.id], target.id);
    expect(engineer.targetId).toBe(target.id);
    advance(game, 8);
    expect(target.side).toBe(0);
    expect(game.state.entities).not.toContain(engineer);
    expect(game.state.events.some((e) => e.text.endsWith('captured'))).toBe(true);
    expect(game.state.events.some((e) => e.text === 'Engineer lost')).toBe(false);
  });
  it('consumes an engineer to fully repair an owned damaged building without changing its owner', () => {
    const { game, engineer, target } = arena();
    target.side = 0;
    target.hp = 50;
    game.orderAttack([engineer.id], target.id);
    advance(game, 8);
    expect(target.side).toBe(0);
    expect(target.hp).toBe(target.maxHp);
    expect(game.state.entities).not.toContain(engineer);
    expect(game.state.events.some((e) => e.text.endsWith('repaired'))).toBe(true);
  });
  it('does not consume an engineer or issue a repair order for a healthy owned building', () => {
    const { game, engineer, target } = arena();
    target.side = 0;
    game.orderAttack([engineer.id], target.id);
    advance(game, 3);
    expect(engineer.targetId).toBeNull();
    expect(game.state.entities).toContain(engineer);
  });
});
