import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { placementCells } from '../src/game/placement';

function game() {
  const value = new Game({ ai: false });
  for (const entity of value.state.entities) if (value.defs[entity.type].harvester) entity.order = 'guard';
  return value;
}

describe('local development controls', () => {
  it('keeps normal production defaults and applies instant/free to already queued work without refunding unspent credits', () => {
    const value = game(), side = value.state.sides[0];
    expect(value.state.speed).toBe(1);
    value.build('power'); value.tick(.1);
    const item = side.queues.structures[0], spent = item.spent;
    expect(item.progress).toBeGreaterThan(0); expect(item.ready).toBe(false); expect(spent).toBeGreaterThan(0);
    side.money = 0;
    value.configureLocalTools({ instantBuild: true, free: true }); value.tick(.1);
    expect(item.ready).toBe(true); expect(item.spent).toBe(spent); expect(side.money).toBe(0);
    value.cancelBuild('structures'); expect(side.money).toBeCloseTo(spent);
    value.configureLocalTools({ instantBuild: false, free: false });
    value.build('power'); value.tick(.1);
    expect(side.queues.structures[0].ready).toBe(false); expect(side.queues.structures[0].spent).toBeGreaterThan(0);
  });

  it('keeps instant and free independent and does not bypass prerequisites', () => {
    const value = game(), side = value.state.sides[0];
    value.configureLocalTools({ instantBuild: true }); side.money = 100;
    value.build('power'); value.tick(.1);
    expect(side.queues.structures[0].ready).toBe(false); expect(side.money).toBe(0);
    value.configureLocalTools({ instantBuild: false, free: true });
    const before = side.queues.structures[0].progress; value.tick(.1);
    expect(side.queues.structures[0].progress).toBeGreaterThan(before); expect(side.queues.structures[0].ready).toBe(false);
    expect(value.build('grizzly')).toBe(false);
  });

  it('places Allied or Soviet mobile types as enemies only on free passable cells', () => {
    const value = game(), cells = value.state.tiles;
    cells[35 * value.state.width + 20] = { terrain: 'grass', ore: 0, variant: 0 };
    const enemy = value.placeLocalEnemy('gi', 20.2, 35.8);
    expect(enemy).toMatchObject({ type: 'gi', side: 1, x: 20.5, y: 35.5, order: 'guard' });
    expect(value.placeLocalEnemy('rhino', 20.5, 35.5)).toBeUndefined();
    expect(value.placeLocalEnemy('power', 22, 35)).toBeUndefined();
    expect(value.placeLocalEnemy('rhino', -1, 35)).toBeUndefined();
  });

  it('starts and completes free repairs at zero credits, then restores paid repair rules', () => {
    const value = game(), side = value.state.sides[0], building = value.state.entities.find(entity => entity.type === 'power')!;
    building.hp -= 30; side.money = 0;
    expect(value.canRepair(building.id)).toBe(false); expect(value.repair(building.id)).toBe(false);
    value.configureLocalTools({ free: true });
    expect(value.canRepair(building.id)).toBe(true); expect(value.repair(building.id)).toBe(true);
    const before = building.hp; for (let i = 0; i < 10; i++) value.tick(.1);
    expect(building.hp).toBeGreaterThan(before); expect(side.money).toBe(0);
    value.repair(building.id); value.configureLocalTools({ free: false });
    expect(value.canRepair(building.id)).toBe(false); expect(value.repair(building.id)).toBe(false);
  });
});

it('marks only blocked foundation cells red and shares the final placement verdict', () => {
  const value = game(), cells = placementCells(value.state, value.defs, 'power', 18, 39);
  expect(cells.filter(cell => !cell.valid)).toHaveLength(2);
  expect(cells.filter(cell => cell.valid)).toHaveLength(2);
  expect(value.canPlace('power', 18, 39)).toBe(false);
  expect(placementCells(value.state, value.defs, 'power', -1, -1).every(cell => !cell.valid)).toBe(true);
});
