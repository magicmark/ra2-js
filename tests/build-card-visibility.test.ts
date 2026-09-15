import { describe, expect, it } from 'vitest';
import { Game } from '../src/game/Game';
import { BUILDING_CONSTRUCTION_SECONDS } from '../src/game/buildingSale';
import type { Entity } from '../src/game/types';
import { UI } from '../src/ui/UI';

const advance = (game: Game, seconds: number) => { for (let i = 0; i < Math.ceil(seconds * 30); i++) game.tick(1 / 30); };
const spawn = (game: Game, type: string) => (game as any).spawn(type, 0, 25, 35) as Entity;

// Exercise the actual UI visibility method with real simulation state. Browser
// checks cover HTML layout, category switches, focus and native cameos.
function cards(game: Game, types: string[]) {
  const elements = new Map(types.map(type => [type, { hidden: false }])), count = { textContent: '' };
  const ui = Object.create(UI.prototype) as any;
  Object.assign(ui, { game, cardElements: elements, root: { querySelector: () => count } });
  const update = () => ui.updateCardVisibility();
  const visible = () => [...elements].filter(([, card]) => !card.hidden).map(([type]) => type);
  update();
  return { update, visible, count };
}

describe('building cards follow prerequisite visibility', () => {
  it('reveals buildings only when prerequisite construction finishes and updates the count', () => {
    const game = new Game({ ai: false });
    game.state.entities = game.state.entities.filter(e => e.side !== 0 || e.type === 'conyard');
    const ui = cards(game, ['power', 'refinery', 'barracks', 'warfactory']);
    expect(ui.visible()).toEqual(['power']); expect(ui.count.textContent).toBe('01 AVAILABLE');
    const power = spawn(game, 'power');
    power.constructing = { startedAt: game.state.time, duration: BUILDING_CONSTRUCTION_SECONDS };
    ui.update(); expect(ui.visible()).toEqual(['power']);
    advance(game, BUILDING_CONSTRUCTION_SECONDS + 1 / 30);
    ui.update(); expect(ui.visible()).toEqual(['power', 'refinery', 'barracks']);
    expect(ui.count.textContent).toBe('03 AVAILABLE');
    spawn(game, 'refinery'); ui.update(); expect(ui.visible()).not.toContain('warfactory');
    spawn(game, 'barracks'); ui.update(); expect(ui.visible()).toContain('warfactory');
  });

  for (const loss of ['destroyed', 'selling', 'captured'] as const) it(`hides unqueued technology when its last prerequisite is ${loss}`, () => {
    const game = new Game({ ai: false }), ui = cards(game, ['warfactory', 'radar', 'shipyard']);
    expect(ui.visible()).toHaveLength(3);
    const refinery = game.state.entities.find(e => e.side === 0 && e.type === 'refinery')!;
    if (loss === 'destroyed') refinery.hp = 0;
    else if (loss === 'selling') expect(game.sell(refinery.id)).toBe(true);
    else refinery.side = 1;
    ui.update(); expect(ui.visible()).toEqual([]); expect(ui.count.textContent).toBe('00 AVAILABLE');
    const replacement = spawn(game, 'refinery'); ui.update(); expect(ui.visible()).toHaveLength(3);
    spawn(game, 'refinery'); replacement.hp = 0; ui.update(); expect(ui.visible()).toHaveLength(3);
  });

  it('requires a completed construction producer even for buildings without explicit prerequisites', () => {
    const game = new Game({ ai: false }), ui = cards(game, ['power', 'pillbox']);
    expect(ui.visible()).toEqual(['power', 'pillbox']);
    game.state.entities.find(e => e.side === 0 && e.type === 'conyard')!.selling = { startedAt: 0, duration: 2 };
    ui.update(); expect(ui.visible()).toEqual([]);
    const yard = spawn(game, 'conyard'); yard.constructing = { startedAt: 0, duration: 2 };
    ui.update(); expect(ui.visible()).toEqual([]);
    delete yard.constructing; ui.update(); expect(ui.visible()).toEqual(['power', 'pillbox']);
  });

  it('keeps paid, blocked or paused production visible, and hides it after cancellation', () => {
    const game = new Game({ ai: false }), ui = cards(game, ['butchers']);
    expect(game.build('butchers')).toBe(true); advance(game, 2);
    const item = game.state.sides[0].queues.structures[0]; expect(item.spent).toBeGreaterThan(0);
    game.state.entities.find(e => e.side === 0 && e.type === 'refinery')!.hp = 0;
    advance(game, .1); expect(item.blockedPrerequisite).toBe('Requires Ore Refinery');
    ui.update(); expect(ui.visible()).toEqual(['butchers']);
    game.toggleBuildPause('structures'); ui.update(); expect(ui.visible()).toEqual(['butchers']);
    game.cancelBuild('structures'); ui.update(); expect(ui.visible()).toEqual([]);
  });

  it('keeps non-head queued buildings visible after prerequisite loss', () => {
    const game = new Game({ ai: false }), ui = cards(game, ['power', 'butchers']);
    expect(game.build('power')).toBe(true); expect(game.build('butchers')).toBe(true);
    game.state.entities.find(e => e.side === 0 && e.type === 'refinery')!.hp = 0;
    ui.update(); expect(ui.visible()).toEqual(['power', 'butchers']);
    const item = game.state.sides[0].queues.structures[1];
    game.cancelBuild('structures', 0, item.id); ui.update(); expect(ui.visible()).toEqual(['power']);
  });

  it('preserves ready unique defenses after their prerequisite and producer are lost', () => {
    const game = new Game({ ai: false }), lab = spawn(game, 'battlelab');
    game.configureLocalTools({ instantBuild: true });
    const ui = cards(game, ['chronosphere', 'weather_control']);
    expect(game.build('chronosphere')).toBe(true); advance(game, .1);
    expect(game.state.sides[0].queues.defenses[0].ready).toBe(true);
    lab.hp = 0; game.state.entities.find(e => e.side === 0 && e.type === 'conyard')!.hp = 0;
    ui.update(); expect(ui.visible()).toEqual(['chronosphere']);
    game.cancelBuild('defenses'); ui.update(); expect(ui.visible()).toEqual([]);
  });

  it('keeps unlocked buildings visible through zero funds, full queues and build limits', () => {
    const game = new Game({ ai: false }), ui = cards(game, ['power', 'warfactory', 'chronosphere']);
    game.state.sides[0].money = 0;
    ui.update(); expect(ui.visible()).toEqual(['power', 'warfactory']);
    for (let i = 0; i < 8; i++) expect(game.build('power')).toBe(true);
    expect(game.canBuild('warfactory').reason).toBe('Queue is full (8)');
    ui.update(); expect(ui.visible()).toEqual(['power', 'warfactory']);
    spawn(game, 'battlelab'); spawn(game, 'chronosphere');
    expect(game.canBuild('chronosphere').reason).toBe('Build limit reached');
    ui.update(); expect(ui.visible()).toContain('chronosphere');
  });

  it('leaves unit-card visibility unchanged', () => {
    const game = new Game({ ai: false }), ui = cards(game, ['gi', 'george', 'grizzly', 'prism_tank']);
    expect(game.canBuild('george').ok).toBe(false); expect(game.canBuild('prism_tank').ok).toBe(false);
    expect(ui.visible()).toEqual(['gi', 'george', 'grizzly', 'prism_tank']);
  });
});
