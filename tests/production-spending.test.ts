import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
function gameWithCash(money = 6000) {
  const game = new Game({ ai: false });
  for (const entity of game.state.entities) if (game.defs[entity.type].harvester) entity.order = 'guard';
  game.state.sides[0].money = money;
  return game;
}
function advance(game: Game, seconds: number) { for (let i = 0; i < Math.round(seconds * 30); i++) game.tick(1 / 30); }
describe('progressive production economy', () => {
  it('debits exactly the built fraction and cancels only the amount actually spent', () => {
    const game = gameWithCash(); game.build('power');
    const item = game.state.sides[0].queues.structures[0]; expect(game.state.sides[0].money).toBe(6000); expect(item.spent).toBe(0);
    advance(game, game.defs.power.buildTime / 2);
    expect(item.progress).toBeCloseTo(.5, 8); expect(item.spent).toBeCloseTo(400, 8); expect(game.state.sides[0].money).toBeCloseTo(5600, 8);
    game.cancelBuild('structures'); expect(game.state.sides[0].money).toBeCloseTo(6000, 8);
  });
  it('cancels the paused active portrait by ID without discarding a different queued type', () => {
    const game = gameWithCash(); game.build('power'); game.build('barracks');
    const queue = game.state.sides[0].queues.structures, active = queue[0], later = queue[1]; advance(game, 2); game.toggleBuildPause('structures');
    const credits = game.state.sides[0].money; game.cancelBuild('structures', 0, active.id);
    expect(queue).toEqual([later]); expect(queue[0].paused).toBe(false); expect(game.state.sides[0].money).toBeCloseTo(credits + active.spent, 8);
    game.cancelBuild('structures', 0, active.id); expect(queue).toEqual([later]);
    advance(game, 1); expect(later.progress).toBeGreaterThan(0);
  });
  it('holds at zero credits and resumes without a second click when income arrives', () => {
    const game = gameWithCash(100); expect(game.build('power')).toBe(true);
    const item = game.state.sides[0].queues.structures[0]; advance(game, 5);
    expect(game.state.sides[0].money).toBe(0); expect(item.progress).toBeCloseTo(.125); expect(item.blockedFunds).toBe(true);
    advance(game, 5); expect(item.progress).toBeCloseTo(.125);
    game.state.sides[0].money += 100; advance(game, 5); expect(item.progress).toBeCloseTo(.25); expect(item.spent).toBeCloseTo(200);
    game.cancelBuild('structures'); expect(game.state.sides[0].money).toBeCloseTo(200);
  });
  it('shares limited funds across active categories without creating money or negative balances', () => {
    const game = gameWithCash(90); game.build('power'); game.build('pillbox'); game.build('gi');
    advance(game, 2);
    const items = ['structures', 'defenses', 'infantry'].flatMap(category => game.state.sides[0].queues[category as 'structures' | 'defenses' | 'infantry']);
    expect(game.state.sides[0].money).toBe(0); expect(items.every(item => item.spent > 0 && item.blockedFunds)).toBe(true);
    expect(items.reduce((sum, item) => sum + item.spent, 0)).toBeCloseTo(90, 8);
    for (const category of ['structures', 'defenses', 'infantry'] as const) game.cancelBuild(category);
    expect(game.state.sides[0].money).toBeCloseTo(90, 8);
  });
  it('does not charge paused or unstarted queued items and retains paid ready structures', () => {
    const game = gameWithCash(); game.build('power'); game.build('power'); const [active, queued] = game.state.sides[0].queues.structures;
    advance(game, 2); game.toggleBuildPause('structures'); const cash = game.state.sides[0].money; advance(game, 2);
    expect(game.state.sides[0].money).toBe(cash); expect(queued.spent).toBe(0);
    game.cancelBuild('structures'); expect(game.state.sides[0].money).toBe(cash);
    game.toggleBuildPause('structures'); advance(game, game.defs.power.buildTime);
    expect(active.ready).toBe(true); expect(active.spent).toBeCloseTo(800); expect(game.state.sides[0].money).toBeCloseTo(5200);
    advance(game, 5); expect(game.state.sides[0].money).toBeCloseTo(5200);
  });
});
