import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { BUILDING_SALE_SECONDS, buildingSaleFrame } from '../src/game/buildingSale';

const advance = (game: Game, seconds: number) => { for (let i = 0; i < Math.round(seconds * 30); i++) game.tick(1 / 30); };
describe('original building sale lifecycle', () => {
  it('refunds once, disables power/actions, and holds the footprint through reverse buildup', () => {
    const game = new Game({ ai: false }), power = game.state.entities.find(e => e.side === 0 && e.type === 'power')!;
    for (const e of game.state.entities) if (game.defs[e.type].harvester) e.order = 'guard';
    const before = game.state.sides[0].money;
    game.select([power.id]);
    expect(game.sell(power.id)).toBe(true);
    expect(power.selected).toBe(false); expect(power.selling?.duration).toBe(BUILDING_SALE_SECONDS);
    expect(game.state.sides[0].money).toBe(before + game.defs.power.cost / 2);
    expect(game.state.sides[0].power).toBe(0);
    expect(game.sell(power.id)).toBe(false); expect(game.repair(power.id)).toBe(false);
    game.select([power.id]); game.orderMove([power.id], 4, 4);
    expect(power.selected).toBe(false); expect(power.rally).toBeUndefined();
    expect((game as any).isPassable(power.x, power.y)).toBe(false);
    advance(game, BUILDING_SALE_SECONDS - 1 / 30);
    expect(game.state.entities).toContain(power);
    expect((game as any).isPassable(power.x, power.y)).toBe(false);
    advance(game, 1 / 30);
    expect(game.state.entities).not.toContain(power);
    expect((game as any).isPassable(power.x, power.y)).toBe(true);
    expect(game.state.sides[0].money).toBe(before + game.defs.power.cost / 2);
    expect(game.state.effects.some(e => e.kind === 'explosion')).toBe(false);
  });
  it('holds production immediately and cannot capture or attack a selling structure', () => {
    const game = new Game({ ai: false }), barracks = game.state.entities.find(e => e.side === 0 && e.type === 'barracks')!;
    game.build('gi'); game.sell(barracks.id);
    expect(game.canBuild('gi').ok).toBe(false);
    advance(game, .5); expect(game.state.sides[0].queues.infantry[0].progress).toBe(0);
    const engineer = (game as any).spawn('engineer', 0, barracks.x + 1, barracks.y - 1);
    game.orderAttack([engineer.id], barracks.id, true);
    expect(engineer.targetId).toBeNull();
    expect(game.state.entities).toContain(barracks);
  });
  it('pauses and resumes sale on the simulation clock', () => {
    const game = new Game({ ai: false }), power = game.state.entities.find(e => e.side === 0 && e.type === 'power')!;
    game.sell(power.id); game.state.paused = true; advance(game, 3);
    expect(game.state.entities).toContain(power); expect(game.state.time).toBe(0);
    game.state.paused = false; game.setGameSpeed(2); advance(game, BUILDING_SALE_SECONDS / 2);
    expect(game.state.entities).not.toContain(power);
  });
  it('walks every authored buildup frame in reverse order', () => {
    expect(Array.from({ length: 25 }, (_, tick) => buildingSaleFrame(tick / 25, 25))).toEqual(Array.from({ length: 25 }, (_, i) => 24 - i));
    expect(buildingSaleFrame(1, 25)).toBe(0);
  });
});
