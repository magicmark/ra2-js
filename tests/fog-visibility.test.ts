import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { revealedEntity } from '../src/game/visibility';

describe('mobile contacts in fog of war', () => {
  it.each(['conscript', 'rhino', 'harrier', 'destroyer'])(
    'uses the occupied cell for %s, not explored terrain or an adjacent visible cell',
    (type) => {
      const game = new Game({ ai: false });
      const enemy = game['spawn'](type, 1, 30.5, 30.5);
      enemy.revealed = true; // Old discovery state must never override current sight.
      game.state.fog.fill(0);
      game.state.explored.fill(1);
      game.state.fog[30 * game.state.width + 31] = 1;
      expect(revealedEntity(game.state, game.defs, enemy)).toBe(false);
      game.state.fog[30 * game.state.width + 30] = 1;
      expect(revealedEntity(game.state, game.defs, enemy)).toBe(true);
      enemy.x = 29.5;
      expect(revealedEntity(game.state, game.defs, enemy)).toBe(false);
      enemy.side = 0;
      expect(revealedEntity(game.state, game.defs, enemy)).toBe(true);
      enemy.transportId = 999;
      expect(revealedEntity(game.state, game.defs, enemy)).toBe(false);
      delete enemy.transportId;
      enemy.hp = 0;
      expect(revealedEntity(game.state, game.defs, enemy)).toBe(false);
    },
  );

  it('drops a moving enemy target and its command line when it leaves sight, and rejects new attacks until it returns', () => {
    const game = new Game({ ai: false });
    game.setGameSpeed(1);
    game.state.entities = game.state.entities.filter((e) => e.type === 'conyard');

    for (const tile of game.state.tiles) {
      tile.terrain = 'grass';
      tile.ore = 0;
    }

    const attacker = game['spawn']('grizzly', 0, 30.5, 30.5);
    const enemy = game['spawn']('engineer', 1, 34.5, 30.5);
    game['rebuildBlocked']();
    game['updateVision']();
    game.orderAttack([attacker.id], enemy.id);
    expect(attacker.targetId).toBe(enemy.id);
    expect(game.commandPath(attacker.id)).toBeDefined();
    enemy.x = 50.5;
    enemy.previous = { x: enemy.x, y: enemy.y };
    game.state.explored[Math.floor(enemy.y) * game.state.width + Math.floor(enemy.x)] = 1;
    expect(revealedEntity(game.state, game.defs, enemy)).toBe(false);
    expect(game.commandPath(attacker.id)).toBeUndefined();
    game.tick(1 / 30);
    expect(attacker.targetId).toBeNull();
    expect(attacker.path).toEqual([]);
    expect(attacker.order).toBe('guard');
    expect(attacker.firedAt).toBeUndefined();
    game.orderAttack([attacker.id], enemy.id);
    expect(attacker.targetId).toBeNull();
    enemy.x = 34.5;
    game['updateVision']();
    game.orderAttack([attacker.id], enemy.id);
    expect(attacker.targetId).toBe(enemy.id);
    expect(game.commandPath(attacker.id)).toBeDefined();
  });
});
