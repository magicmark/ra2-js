import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { isBuilding } from '../src/game/definitions';

function congestion(type: 'gi' | 'grizzly', corridor: boolean) {
  const game = new Game({ ai: false });
  game.setGameSpeed(1);
  const mover = game.state.entities.find((e) => e.type === type)!;
  const blocker = game.state.entities.find((e) => e.type === 'gi' && e.id !== mover.id)!;
  game.state.entities = game.state.entities.filter(
    (e) => isBuilding(game.defs[e.type]) || e === mover || e === blocker,
  );

  for (let y = 32; y <= 38; y++)
    for (let x = 17; x <= 28; x++) {
      const tile = game.state.tiles[y * game.state.width + x];
      tile.terrain = corridor && y !== 35 ? 'rock' : 'grass';
      tile.ore = 0;
    }

  Object.assign(mover, { x: 19.5, y: 35.5, facing: 0, previous: { x: 19.5, y: 35.5 } });
  Object.assign(blocker, { x: 22.15, y: corridor ? 35.25 : 35.5, order: 'guard', path: [] });
  const blockers = [blocker];

  if (corridor) {
    const second = { ...blocker, id: 100, y: 35.75, path: [] };
    game.state.entities.push(second);
    blockers.push(second);
  }

  game.orderMove([mover.id], 25.5, 35.5);

  return { game, mover, blockers };
}

describe('allied congestion', () => {
  it.each(['gi', 'grizzly'] as const)(
    '%s waits without flipping in a blocked corridor and resumes when its ally moves',
    (type) => {
      const { game, mover, blockers } = congestion(type, true);
      let turns = 0;

      for (let frame = 0; frame < 360; frame++) {
        const before = mover.facing;
        game.tick(1 / 30);

        for (const blocker of blockers)
          expect(Math.hypot(mover.x - blocker.x, mover.y - blocker.y)).toBeGreaterThanOrEqual(
            0.48 - 1e-8,
          );

        if (frame >= 120)
          turns += Math.abs(
            Math.atan2(Math.sin(mover.facing - before), Math.cos(mover.facing - before)),
          );
      }

      expect(mover.x).toBeLessThan(blockers[0].x);
      expect(mover.order).toBe('move');
      expect(turns).toBeLessThan(0.01);
      game.orderMove([blockers[0].id], 27.5, 35.5);

      for (let frame = 0; frame < 90; frame++) game.tick(1 / 30);
      game.orderMove([blockers[1].id], 26.5, 35.5);

      for (let frame = 0; frame < 600; frame++) {
        game.tick(1 / 30);

        for (const blocker of blockers)
          expect(Math.hypot(mover.x - blocker.x, mover.y - blocker.y)).toBeGreaterThanOrEqual(
            0.48 - 1e-8,
          );
      }

      expect(mover.x).toBeCloseTo(25.5, 5);
      expect(mover.y).toBeCloseTo(35.5, 5);
      expect(mover.order).toBe('guard');
    },
  );

  it.each(['gi', 'grizzly'] as const)(
    '%s routes around a stationary ally without repeated direction reversals',
    (type) => {
      const { game, mover, blockers } = congestion(type, false);
      let reversals = 0;

      for (let frame = 0; frame < 600; frame++) {
        const before = mover.facing;
        game.tick(1 / 30);

        for (const blocker of blockers)
          expect(Math.hypot(mover.x - blocker.x, mover.y - blocker.y)).toBeGreaterThanOrEqual(
            0.48 - 1e-8,
          );

        const turn = Math.abs(
          Math.atan2(Math.sin(mover.facing - before), Math.cos(mover.facing - before)),
        );

        if (turn > Math.PI / 2) reversals++;

        if (mover.order === 'guard') break;
      }

      expect(reversals).toBeLessThanOrEqual(1);
      expect(mover.x).toBeCloseTo(25.5, 5);
      expect(mover.y).toBeCloseTo(35.5, 5);
      expect(mover.order).toBe('guard');
    },
  );
});
