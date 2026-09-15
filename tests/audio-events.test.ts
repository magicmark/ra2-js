import { expect, it } from 'vitest';
import { Game } from '../src/game/Game';

it('tags actual production readiness for EVA without announcing placement as new production', () => {
  const game = new Game({ ai: false });
  game.configureLocalTools({ instantBuild: true });
  expect(game.build('power')).toBe(true);
  expect(game.build('gi')).toBe(true);
  game.tick(0.1);
  expect(game.state.events.some((event) => event.sound === 'EVA_ConstructionComplete')).toBe(true);
  expect(game.state.events.some((event) => event.sound === 'EVA_UnitReady')).toBe(true);
  let site: { x: number; y: number } | undefined;

  for (let y = 30; y < 50 && !site; y++)
    for (let x = 5; x < 25; x++)
      if (game.canPlace('power', x, y)) {
        site = { x, y };
        break;
      }

  expect(site).toBeDefined();
  expect(game.place('power', site!.x, site!.y)).toBe(true);
  expect(game.state.events.at(-1)?.sound).toBeUndefined();
});

it('carries shooter identity on actual simulated shots for original weapon sound selection', () => {
  const game = new Game({ ai: false });
  const tank = game.state.entities.find((entity) => entity.type === 'grizzly')!;
  const target = game.state.entities.find((entity) => entity.type === 'power_soviet')!;
  game.state.entities = game.state.entities.filter(
    (entity) => entity.type === 'conyard' || entity === tank || entity === target,
  );

  for (const tile of game.state.tiles) {
    tile.terrain = 'grass';
    tile.ore = 0;
  }

  tank.x = 20.5;
  tank.y = 30.5;
  target.x = 23;
  target.y = 30;
  target.hp = target.maxHp = 10000;
  game.state.fog.fill(1);
  game.state.explored.fill(1);
  game.orderAttack([tank.id], target.id);
  let shot;

  for (let i = 0; i < 120 && !shot; i++) {
    game.tick(1 / 30);
    shot = game.state.effects.find((effect) => effect.kind === 'shot' && effect.side === 0);
  }

  expect(shot).toMatchObject({ sourceType: 'grizzly', airTarget: false });
});
