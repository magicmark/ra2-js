import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { parseNativeMap } from '../src/game/maps/nativeMap';

function arena() {
  const game = new Game({ ai: false });
  const tank = game.state.entities.find((entity) => entity.type === 'grizzly')!;
  game.state.entities = game.state.entities.filter(
    (entity) => entity === tank || entity.type === 'conyard',
  );

  for (const tile of game.state.tiles) {
    tile.terrain = 'grass';
    tile.ore = 0;
  }

  Object.assign(tank, { x: 20.5, y: 30.5, previous: { x: 20.5, y: 30.5 }, facing: Math.PI / 2 });
  game.orderMove([tank.id], 20.5, 40.5);
  game.build('power');

  return { game, tank };
}

function advanceWallTime(game: Game, seconds: number, hz = 60) {
  for (let frame = 0; frame < Math.round(seconds * hz); frame++) game.tick(1 / hz);
}

describe('default game pace', () => {
  it('starts at Faster and moves a Grizzly twice as far per real second as Fast', () => {
    const current = arena(),
      previous = arena();

    previous.game.setGameSpeed(1);
    expect(current.game.state.speed).toBe(2);
    expect(current.game.nativeGameSpeedIndex).toBe(1);
    advanceWallTime(current.game, 1);
    advanceWallTime(previous.game, 1);
    expect(current.game.state.time).toBeCloseTo(2, 8);
    expect(previous.tank.y - 30.5).toBeCloseTo(1.9921875, 8);
    expect(current.tank.y - 30.5).toBeCloseTo(3.984375, 8);
    expect(current.tank.x).toBe(20.5);
    expect(current.game.state.sides[0].queues.structures[0].progress).toBeCloseTo(
      2 / current.game.defs.power.buildTime,
      8,
    );
  });

  it('preserves movement, turning and production at equal simulation time across render rates', () => {
    const run = (hz: number, speed?: number) => {
      const { game, tank } = arena();

      if (speed !== undefined) game.setGameSpeed(speed);
      tank.facing = 0; // Include a fresh quarter-turn before travel.
      advanceWallTime(game, 4 / game.state.speed, hz);

      return {
        time: game.state.time,
        x: tank.x,
        y: tank.y,
        facing: tank.facing,
        path: tank.path,
        money: game.state.sides[0].money,
        progress: game.state.sides[0].queues.structures[0].progress,
      };
    };

    const reference = run(30, 1);
    expect(reference.time).toBeCloseTo(4, 8);

    for (const hz of [5, 10, 30, 60, 144]) expect(run(hz)).toEqual(reference);
  });

  it('keeps pause and the fixed logic step at the faster default', () => {
    const { game, tank } = arena();
    game.state.paused = true;
    advanceWallTime(game, 1);
    expect(game.state.time).toBe(0);
    expect(tank.y).toBe(30.5);
    game.state.paused = false;
    game.tick(1 / 120);
    expect(game.state.time).toBe(0);
    expect(game.interpolation).toBeCloseTo(0.5);
    game.tick(1 / 120);
    expect(game.state.time).toBeCloseTo(1 / 30);
    expect(tank.y - 30.5).toBeCloseTo(17 / 256, 8);
  });

  it('uses Faster on native maps and retains the chosen speed across restart and map changes', () => {
    const map = parseNativeMap(readFileSync('public/maps/emerald-divide.map', 'utf8'));
    const game = new Game({ ai: false, map });
    expect(game.state.speed).toBe(2);

    for (const speed of [2, 1, 0.5]) {
      game.setGameSpeed(speed);
      game.restart();
      expect(game.state.speed).toBe(speed);
      game.loadNativeMap(map);
      expect(game.state.speed).toBe(speed);
    }
  });
});
