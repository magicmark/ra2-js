import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { isBuilding } from '../src/game/definitions';
import { parseNativeMap } from '../src/game/maps/nativeMap';

const nativeMap = () => parseNativeMap(readFileSync('public/maps/emerald-divide.map', 'utf8'));

describe('temporary automatic Soviet wave setting', () => {
  for (const native of [false, true]) it(`keeps the ${native ? 'native' : 'training'} map economy active without scheduled attacks`, () => {
    const game = new Game(native ? { map: nativeMap() } : {});
    game.setGameSpeed(1); // Keep the four-minute simulation window independent of the default pace.
    expect(game.automaticSovietWaves).toBe(false);
    const playerBuildings = game.state.entities.filter(e => e.side === 0 && isBuilding(game.defs[e.type]));
    let warned = false, attacking = false;
    // Cross both the first (100s) and subsequent wave deadlines with the AI on.
    for (let step = 0; step < 240 * 4; step++) {
      game.tick(.25);
      warned ||= game.state.events.some(e => e.text.includes('strike force'));
      attacking ||= game.state.entities.some(e => e.side === 1 && e.order === 'attack');
    }
    expect(game.state.time).toBeCloseTo(240);
    expect(warned).toBe(false);
    expect(attacking).toBe(false);
    expect(playerBuildings.every(e => e.hp === e.maxHp)).toBe(true);
    expect(game.state.entities.some(e => e.side === 1 && e.type === 'warfactory_soviet')).toBe(true);
    expect(game.state.entities.filter(e => e.side === 1 && e.type === 'warminer').length).toBeGreaterThanOrEqual(2);
    expect(game.state.entities.filter(e => e.side === 1 && e.type === 'rhino').length).toBeGreaterThanOrEqual(2);
    expect(game.state.sides[1].money).toBeGreaterThanOrEqual(0);
  }, 45000); // Four simulated minutes, including native-map pathfinding.

  it('preserves the setting through restart and native-map selection, with an explicit reenable option', () => {
    for (const automaticSovietWaves of [false, true]) {
      const game = new Game({ automaticSovietWaves });
      game.setGameSpeed(1);
      game.restart();
      expect(game.automaticSovietWaves).toBe(automaticSovietWaves);
      game.loadNativeMap(nativeMap());
      expect(game.automaticSovietWaves).toBe(automaticSovietWaves);
      let warned = false;
      for (let step = 0; step < 110 * 4; step++) {
        game.tick(.25);
        warned ||= game.state.events.some(e => e.text.includes('strike force'));
      }
      expect(warned).toBe(automaticSovietWaves);
    }
  }, 20000);

  it('allows commanded player combat and Soviet return fire with waves disabled', () => {
    const game = new Game();
    const attacker = game.state.entities.find(e => e.type === 'gi')!;
    const target = game.state.entities.find(e => e.type === 'conscript')!;
    game.state.entities = game.state.entities.filter(e => e.type === 'conyard' || e === attacker || e === target);
    for (const tile of game.state.tiles) { tile.terrain = 'grass'; tile.ore = 0; }
    Object.assign(attacker, { hp: 225, maxHp: 225, x: 20.5, y: 30.5 });
    Object.assign(target, { hp: 1000, maxHp: 1000, x: 22.5, y: 30.5 });
    game.tick(1 / 30);
    game.orderAttack([attacker.id], target.id);
    for (let step = 0; step < 30; step++) game.tick(1 / 30);
    expect(game.automaticSovietWaves).toBe(false);
    expect(attacker.firedAt).toBeDefined();
    expect(target.hp).toBeLessThan(1000);
    expect(target.firedAt).toBeDefined();
    expect(attacker.hp).toBeLessThan(225);
  });
});
