import { writeFileSync, mkdirSync } from 'node:fs';
import { expect, it } from 'vitest';
import { Game } from '../src/game/Game';

it.skipIf(!process.env.RA2_MOVEMENT_DIAGNOSTICS)(
  'records mobile collision movement for the parity review',
  () => {
    const game = new Game({ ai: false });

    for (const e of game.state.entities) if (game.defs[e.type].harvester) e.order = 'guard';
    const units = game.state.entities.filter((e) => e.type === 'gi').slice(0, 2);
    units[0].x = 19.5;
    units[0].y = 35.5;
    units[1].x = 25.5;
    units[1].y = 35.5;
    game.orderMove([units[0].id], 25.5, 35.5);
    game.orderMove([units[1].id], 19.5, 35.5);

    const stats = units.map((e) => ({
      id: e.id,
      turnsOver45: 0,
      turnsOver90: 0,
      blockedFramesWithPath: 0,
      minimumGap: Infinity,
      samples: new Array<number[]>(),
    }));

    for (let frame = 0; frame < 360; frame++) {
      const previous = units.map((e) => ({ x: e.x, y: e.y, facing: e.facing }));
      game.tick(1 / 30);
      units.forEach((e, i) => {
        const p = previous[i],
          turn = Math.abs(Math.atan2(Math.sin(e.facing - p.facing), Math.cos(e.facing - p.facing)));

        if (turn > Math.PI / 4 + 0.001) stats[i].turnsOver45++;

        if (turn > Math.PI / 2 + 0.001) stats[i].turnsOver90++;

        if (e.path.length && Math.hypot(e.x - p.x, e.y - p.y) < 0.001)
          stats[i].blockedFramesWithPath++;
        stats[i].minimumGap = Math.min(
          stats[i].minimumGap,
          Math.hypot(units[0].x - units[1].x, units[0].y - units[1].y),
        );
        stats[i].samples.push([frame, e.x, e.y, e.facing, e.path.length]);
      });
    }

    mkdirSync('tests/artifacts/gameplay', { recursive: true });
    writeFileSync(
      'tests/artifacts/gameplay/movement-diagnostics.json',
      JSON.stringify(stats, null, 2),
    );

    for (const stat of stats) expect(stat.minimumGap).toBeGreaterThanOrEqual(0.47);
  },
);
