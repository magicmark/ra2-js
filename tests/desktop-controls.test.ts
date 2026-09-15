import { afterEach, describe, expect, it, vi } from 'vitest';
import { Controls } from '../src/input/Controls';
import { Camera } from '../src/render/Camera';
import { Game } from '../src/game/Game';
import { UI } from '../src/ui/UI';
import type { Renderer } from '../src/render/Renderer';
import type { Entity } from '../src/game/types';

afterEach(() => vi.unstubAllGlobals());
function fixture() {
  const events = new EventTarget(); let settingsOpen = false, enabled = true;
  vi.stubGlobal('window', events);
  vi.stubGlobal('document', { documentElement: { classList: { contains: () => settingsOpen } }, body: { classList: { contains: () => false } } });
  const canvas = Object.assign(new EventTarget(), { style: { cursor: '' }, focus: vi.fn(), setPointerCapture: vi.fn(), getBoundingClientRect: () => ({ left: 0, top: 0 }) });
  const camera = new Camera();
  const game = new Game({ ai: false }); let picked: Entity | undefined;
  const renderer = { canvas, camera, placement: null, selectionBox: null, pick: () => picked, visible: (e: Entity) => e.x < 30, entityPoint: (e: Entity) => camera.screen(e.x, e.y) } as unknown as Renderer;
  const callbacks = { toast: vi.fn(), zoom: vi.fn(), mode: vi.fn(), ack: vi.fn(), category: vi.fn(), options: vi.fn(), briefing: vi.fn(), cursor: vi.fn(), enabled: () => enabled };
  const controls = new Controls(renderer, game, false, callbacks);
  const key = (key: string, options: { kind?: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean; repeat?: boolean; type?: string } = {}) => {
    const event = new Event(options.type ?? 'keydown', { cancelable: true });
    const { type: _type, ...eventOptions } = options;
    Object.assign(event, { key, repeat: false, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...eventOptions });
    const kind = options.kind ?? 'button';
    Object.defineProperty(event, 'target', { value: { closest: (selector: string) => (kind === 'button' ? selector === 'button' : kind === 'input' ? selector.includes('input') : kind === 'dialog' ? selector.includes('[role="dialog"]') : false) ? {} : null } });
    events.dispatchEvent(event); return event;
  };
  const pointer = (type: string, x = 300, y = 300, options = {}) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { pointerId: 1, pointerType: 'mouse', clientX: x, clientY: y, button: 0, shiftKey: false, ctrlKey: false, altKey: false, ...options });
    canvas.dispatchEvent(event);
  };
  const click = (entity?: Entity, options = {}) => { picked = entity; pointer('pointerdown', 300, 300, options); pointer('pointerup', 300, 300, options); };
  return { game, controls, camera, renderer, callbacks, events, key, click, pointer, pick: (entity?: Entity) => { picked = entity; }, settings: (value: boolean) => { settingsOpen = value; }, enable: (value: boolean) => { enabled = value; } };
}

// Keep the real keyboard -> UI -> Controls placement path; only presentation
// rendering is stubbed here. Browser checks exercise the actual DOM/cameos.
function productionFixture() {
  const f = fixture(), onPlace = vi.fn((type: string) => f.controls.setPlacement(type));
  const onCategoryChange = vi.fn();
  const ui = Object.assign(Object.create(UI.prototype), {
    game: f.game, category: 'structures', actions: { onPlace, onCategoryChange }, isModalOpen: () => false,
    renderCards: vi.fn(), update: vi.fn(), showToast: vi.fn(), closeBuildPanel: vi.fn(),
  });
  f.callbacks.category.mockImplementation(category => ui.selectCategory(category, true));
  return { ...f, ui, onPlace, onCategoryChange };
}

describe('production hotkeys pick up ready buildings', () => {
  it('sounds only changed tabs while same-tab hotkeys still pick up the ready building', () => {
    const { game, key, renderer, ui, onCategoryChange } = productionFixture();
    game.configureLocalTools({ instantBuild: true }); game.build('power'); game.tick(.1);
    key('q'); expect(renderer.placement).toBe('power'); expect(onCategoryChange).not.toHaveBeenCalled();
    key('w'); expect(onCategoryChange).toHaveBeenCalledTimes(1);
    key('w'); key('e', { repeat: true }); expect(onCategoryChange).toHaveBeenCalledTimes(1);
    key('e'); key('r'); key('q'); expect(onCategoryChange).toHaveBeenCalledTimes(4);
    key('Escape'); key('q'); expect(renderer.placement).toBe('power'); expect(onCategoryChange).toHaveBeenCalledTimes(4);
    ui.selectCategory('defenses'); expect(onCategoryChange).toHaveBeenCalledTimes(5);
    ui.selectCategory('defenses'); expect(onCategoryChange).toHaveBeenCalledTimes(5);
    ui.isModalOpen = () => true; ui.selectCategory('vehicles');
    expect(ui.category).toBe('defenses'); expect(onCategoryChange).toHaveBeenCalledTimes(5);
  });

  it('selects ready structures/defenses, replaces the preview, and preserves paid queues on cancellation', () => {
    const { game, key, renderer, ui, onPlace } = productionFixture();
    game.configureLocalTools({ instantBuild: true });
    expect(game.build('power')).toBe(true); expect(game.build('pillbox')).toBe(true); game.tick(.1);
    const before = JSON.stringify(game.state.sides[0]);
    key('q'); expect(renderer.placement).toBe('power'); expect(ui.category).toBe('structures');
    key('w'); expect(renderer.placement).toBe('pillbox'); expect(ui.category).toBe('defenses');
    key('q', { repeat: true }); expect(renderer.placement).toBe('pillbox'); expect(onPlace).toHaveBeenCalledTimes(2);
    key('Escape'); expect(renderer.placement).toBeNull();
    key('Q'); expect(renderer.placement).toBe('power');
    expect(JSON.stringify(game.state.sides[0])).toBe(before);
    expect(ui.closeBuildPanel).toHaveBeenCalledTimes(3);
  });

  it('only switches tabs for empty or unfinished queues without starting or resuming production', () => {
    const { game, key, renderer, ui, onPlace } = productionFixture();
    key('q'); key('w'); key('e'); key('r'); expect(ui.category).toBe('vehicles');
    expect(game.state.sides[0].queues.structures).toHaveLength(0);
    expect(game.build('power')).toBe(true); game.tick(.1); game.toggleBuildPause('structures');
    const before = JSON.stringify(game.state.sides[0]);
    key('q'); expect(ui.category).toBe('structures'); expect(onPlace).not.toHaveBeenCalled();
    expect(renderer.placement).toBeNull(); expect(JSON.stringify(game.state.sides[0])).toBe(before);
  });

  it('keeps ready buildings usable after losing prerequisites and at unique build limits', () => {
    const { game, key, renderer } = productionFixture();
    (game as any).spawn('battlelab', 0, 30, 30);
    game.configureLocalTools({ instantBuild: true });
    expect(game.build('chronosphere')).toBe(true); expect(game.build('power')).toBe(true); game.tick(.1);
    expect(game.canBuild('chronosphere').reason).toBe('Build limit reached');
    key('w'); expect(renderer.placement).toBe('chronosphere');
    game.state.entities.find(e => e.side === 0 && e.type === 'conyard')!.hp = 0;
    expect(game.canBuild('power').ok).toBe(false);
    key('q'); expect(renderer.placement).toBe('power');
  });

  it('respects remapped production keys and preserves default D deployment', () => {
    const { game, controls, key, renderer, ui } = productionFixture();
    game.configureLocalTools({ instantBuild: true }); game.build('power'); game.tick(.1);
    controls.assignBinding('structures', 'B');
    key('q'); expect(renderer.placement).toBeNull(); key('b'); expect(renderer.placement).toBe('power');
    key('Escape'); const gi = game.state.entities.find(e => e.side === 0 && e.type === 'gi')!;
    game.select([gi.id]); key('d'); expect(gi.deployed).toBe(true); expect(renderer.placement).toBeNull();
    ui.selectCategory('structures'); expect(renderer.placement).toBeNull(); // Mouse tab remains just a tab.
  });

  it('keeps an existing preview when opening unit tabs and ignores guarded keyboard events', () => {
    const { game, controls, key, renderer, ui, onPlace, settings, enable } = productionFixture();
    game.configureLocalTools({ instantBuild: true }); game.build('power'); game.tick(.1);
    for (const options of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { kind: 'input' }, { kind: 'dialog' }]) key('q', options);
    settings(true); key('q'); settings(false); enable(false); key('q'); enable(true);
    expect(onPlace).not.toHaveBeenCalled();
    key('q'); key('e'); expect(ui.category).toBe('infantry'); expect(renderer.placement).toBe('power');
    key('r'); expect(ui.category).toBe('vehicles'); expect(renderer.placement).toBe('power');
    controls.resetBindings(); expect(controls.getBindings().find(b => b.id === 'deploy')!.key).toBe('D');
  });
});

describe('retail mouse commands', () => {
  it('targets a Chronosphere source and destination and cancels superweapon targeting', () => {
    const { game, controls, click, key, callbacks } = fixture();
    const activate = vi.spyOn(game, 'activateSuperweapon').mockReturnValue(true);
    controls.setMode('chrono-source'); click();
    expect(controls.mode).toBe('chrono-destination'); expect(activate).not.toHaveBeenCalled();
    click(); expect(activate).toHaveBeenCalledWith('chronosphere', expect.any(Object), expect.any(Object));
    expect(controls.mode).toBe('select');
    controls.setMode('weather'); key('Escape'); expect(controls.mode).toBe('select');
    expect(callbacks.options).not.toHaveBeenCalled();
  });
  it('sends selected engineers into friendly damaged buildings from the battlefield and radar', () => {
    const { game, controls, click, pointer, pick } = fixture();
    const engineer = game.state.entities.find(e => e.type === 'gi')!, target = game.state.entities.find(e => e.type === 'power')!;
    engineer.type = 'engineer'; target.hp--; game.select([engineer.id]);
    const attack = vi.spyOn(game, 'orderAttack');
    pick(target); pointer('pointermove', 300, 300); expect(controls.cursor).toBe('repair');
    click(target); expect(attack).toHaveBeenLastCalledWith([engineer.id], target.id); expect(engineer.selected).toBe(true);
    controls.radarOrder(target.x + .5, target.y + .5); expect(attack).toHaveBeenCalledTimes(2);
    target.hp = target.maxHp; click(target); expect(target.selected).toBe(true); expect(attack).toHaveBeenCalledTimes(2);
    target.side = 1; game.select([engineer.id]); pick(target); pointer('pointermove', 300, 300);
    expect(controls.cursor).toBe('enter'); click(target); expect(attack).toHaveBeenLastCalledWith([engineer.id], target.id);
  });
  it('centers an unselected radar click and sends selected radar commands with planning and modifiers', () => {
    const { game, controls, camera } = fixture(); controls.radarOrder(25, 30); expect(camera.world(camera.width / 2, camera.height / 2)).toEqual({ x: 25, y: 30 });
    const tank = game.state.entities.find(e => e.type === 'grizzly')!; game.select([tank.id]); const move = vi.spyOn(game, 'orderMove');
    controls.radarOrder(22.5, 35.5, { ctrl: true, shift: true }); expect(move).toHaveBeenLastCalledWith([tank.id], 22.5, 35.5, true);
    controls.executeCommand('planning'); const route = vi.spyOn(game, 'orderWaypoints'); controls.radarOrder(24, 35); expect(route).not.toHaveBeenCalled(); controls.executeCommand('planning'); expect(route).toHaveBeenCalledWith([tank.id], [{ x: 24, y: 35 }]);
    controls.radarOrder(24, 35, { button: 2 }); expect(tank.selected).toBe(false);
  });
  it('uses left click to command; right click deselects or cancels without issuing a command', () => {
    const { game, renderer, controls, click } = fixture();
    const tank = game.state.entities.find(e => e.type === 'grizzly')!;
    const move = vi.spyOn(game, 'orderMove');
    click(tank); click(); expect(move).toHaveBeenCalledOnce();
    const path = tank.path;
    click(undefined, { button: 2 }); expect(tank.selected).toBe(false); expect(tank.path).toBe(path); expect(move).toHaveBeenCalledOnce();
    game.select([tank.id]); controls.setPlacement('power');
    click(undefined, { button: 2 }); expect(renderer.placement).toBeNull(); expect(tank.selected).toBe(true);
  });
  it('toggles selected units with Shift and deploys an already selected GI', () => {
    const { game, click } = fixture(); const units = game.state.entities.filter(e => e.type === 'gi');
    click(units[0]); click(units[1], { shiftKey: true }); expect(units[0].selected && units[1].selected).toBe(true);
    click(units[0], { shiftKey: true }); expect(units[0].selected).toBe(false); expect(units[1].selected).toBe(true);
    click(units[1]); expect(units[1].deployed).toBe(true); click(units[1]); expect(units[1].deployed).toBe(false);
  });
  it('routes attack-move, force fire, and force move modifiers before friendly selection', () => {
    const { game, click } = fixture(); const tank = game.state.entities.find(e => e.type === 'grizzly')!; const friendly = game.state.entities.find(e => e.type === 'gi')!;
    game.select([tank.id]);
    const move = vi.spyOn(game, 'orderMove'), attack = vi.spyOn(game, 'orderAttack'), force = vi.spyOn(game, 'orderForceMove');
    click(friendly, { ctrlKey: true, shiftKey: true }); expect(move).toHaveBeenLastCalledWith([tank.id], expect.any(Number), expect.any(Number), true);
    click(friendly, { ctrlKey: true }); expect(attack).toHaveBeenLastCalledWith([tank.id], friendly.id, true); expect(friendly.selected).toBe(false);
    click(friendly, { altKey: true }); expect(force).toHaveBeenCalledOnce();
  });
  it('right drag scrolls without deselecting and pointer cancellation cannot release an order', () => {
    const { game, controls, camera, pointer, click } = fixture(); const tank = game.state.entities.find(e => e.type === 'grizzly')!;
    click(tank); const x = camera.x;
    pointer('pointerdown', 300, 300, { button: 2 }); pointer('pointermove', 350, 300, { button: 2 }); pointer('pointerup', 350, 300, { button: 2 });
    expect(camera.x).toBeLessThan(x); expect(tank.selected).toBe(true);
    const move = vi.spyOn(game, 'orderMove');
    pointer('pointerdown'); pointer('pointercancel'); pointer('pointerup'); expect(move).not.toHaveBeenCalled();
    controls.tick(.05);
  });
});

describe('retail keyboard commands', () => {
  it('reassigns an occupied core key, unbinds its previous command, and restores defaults', () => {
    const { game, controls, key, callbacks } = fixture(), tank = game.state.entities.find(e => e.type === 'grizzly')!;
    game.select([tank.id]); const stop = vi.spyOn(game, 'stop'), guard = vi.spyOn(game, 'guard');
    expect(controls.inspectBinding('stop', 'G')).toMatchObject({ ok: true, conflict: { id: 'guard', label: 'Guard' } });
    expect(controls.getBindings().find(binding => binding.id === 'guard')?.key).toBe('G');
    expect(controls.assignBinding('stop', 'G')).toMatchObject({ ok: true, replaced: 'guard' });
    expect(controls.getBindings().find(binding => binding.id === 'guard')?.key).toBeNull();
    key('s'); expect(stop).not.toHaveBeenCalled(); key('g'); expect(stop).toHaveBeenCalledWith([tank.id]); expect(guard).not.toHaveBeenCalled();
    controls.assignBinding('structures', 'B'); key('q'); expect(callbacks.category).not.toHaveBeenCalled(); key('b'); expect(callbacks.category).toHaveBeenCalledWith('structures');
    controls.resetBindings(); key('g'); expect(guard).toHaveBeenCalledWith([tank.id]);
    expect(controls.getBindings().every(binding => binding.key === binding.defaultKey)).toBe(true);
  });
  it('remaps held planning and preserves modal, text, and browser shortcut guards', () => {
    const { game, controls, key, click, settings } = fixture(), tank = game.state.entities.find(e => e.type === 'grizzly')!;
    game.select([tank.id]); controls.assignBinding('planning', 'B'); const route = vi.spyOn(game, 'orderWaypoints'), stop = vi.spyOn(game, 'stop');
    key('z'); expect(controls.planning).toBe(false); key('b'); expect(controls.planning).toBe(true);
    click(); expect(route).not.toHaveBeenCalled(); key('b', { type: 'keyup' }); expect(route).toHaveBeenCalledOnce();
    controls.assignBinding('stop', 'C'); key('c', { ctrlKey: true }); key('c', { kind: 'input' }); settings(true); key('c');
    expect(stop).not.toHaveBeenCalled(); settings(false); key('c'); expect(stop).toHaveBeenCalledOnce();
    for (const reserved of ['Escape', 'F1', '1', 'ArrowLeft', 'Enter', 'Ctrl+C', '']) expect(controls.assignBinding('stop', reserved).ok).toBe(false);
    expect(controls.assignBinding('unknown', 'A').ok).toBe(false);
  });
  it('persists replaced bindings without touching asset preferences and tolerates unavailable storage', () => {
    const stored = new Map<string, string>([['asset-source-url', 'keep-this-source']]);
    vi.stubGlobal('localStorage', { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value) });
    fixture().controls.assignBinding('stop', 'G'); const restored = fixture().controls;
    expect(restored.getBindings().find(binding => binding.id === 'stop')?.key).toBe('G');
    expect(restored.getBindings().find(binding => binding.id === 'guard')?.key).toBeNull();
    expect(stored.get('asset-source-url')).toBe('keep-this-source');
    vi.stubGlobal('localStorage', { getItem: () => { throw Error('Denied'); }, setItem: () => { throw Error('Denied'); } });
    const denied = fixture().controls;
    expect(denied.getBindings().find(binding => binding.id === 'stop')?.key).toBe('S');
    expect(() => denied.assignBinding('stop', 'B')).not.toThrow(); expect(() => denied.resetBindings()).not.toThrow();
  });
  it('adjusts continuous scroll speed while preserving direct dragging and modal suppression', () => {
    const { controls, camera, key, pointer, settings } = fixture(), pan = vi.spyOn(camera, 'pan');
    expect(controls.scrollRate).toBe(1);
    key('ArrowLeft'); controls.tick(.1); expect(pan).toHaveBeenLastCalledWith(50, 0);
    controls.setScrollRate(2); controls.tick(.1); expect(pan).toHaveBeenLastCalledWith(100, 0);
    key('ArrowLeft', { type: 'keyup' }); pointer('pointermove', 1, 300); controls.tick(.1); expect(pan).toHaveBeenLastCalledWith(100, 0);
    pointer('pointerdown', 300, 300, { button: 2 }); pointer('pointermove', 350, 300, { button: 2 }); pointer('pointerup', 350, 300, { button: 2 });
    expect(pan).toHaveBeenLastCalledWith(50, 0);
    controls.setScrollRate(99); expect(controls.scrollRate).toBe(3); controls.setScrollRate(NaN); expect(controls.scrollRate).toBe(3);
    controls.setScrollRate(0); expect(controls.scrollRate).toBe(.25);
    const calls = pan.mock.calls.length; key('ArrowLeft'); settings(true); controls.tick(.1); expect(pan).toHaveBeenCalledTimes(calls);
  });
  it('shares native command-bar actions with hotkeys, including initial team assignment, disbanding and persistent planning', () => {
    const { game, controls, click } = fixture(); const unit = game.state.entities.find(e => e.type === 'gi')!;
    game.select([unit.id]); controls.executeCommand('team1'); game.select([]); controls.executeCommand('team1'); expect(unit.selected).toBe(true);
    controls.executeCommand('team1', { clear: true }); game.select([]); controls.executeCommand('team1'); expect(unit.selected).toBe(false);
    game.select([unit.id]); controls.executeCommand('planning'); expect(controls.planning).toBe(true);
    const route = vi.spyOn(game, 'orderWaypoints'); click(); expect(route).not.toHaveBeenCalled();
    controls.executeCommand('planning'); expect(controls.planning).toBe(false); expect(route).toHaveBeenCalledOnce();
    controls.executeCommand('deploy'); expect(unit.deployed).toBe(true);
  });
  it('maps P to all units, QWER tabs, Esc options, and leaves multiplayer A unassigned', () => {
    const { game, controls, callbacks, key } = fixture();
    key('a'); expect(controls.mode).toBe('select');
    key('p'); expect(game.state.paused).toBe(false); expect(game.state.entities.filter(e => e.selected)).toHaveLength(6);
    for (const k of ['q', 'w', 'e', 'r']) key(k);
    expect(callbacks.category.mock.calls.flat()).toEqual(['structures', 'defenses', 'infantry', 'vehicles']);
    key('Escape'); expect(callbacks.options).toHaveBeenCalledOnce();
  });
  it('selects the current type onscreen, then across the map on a second T', () => {
    const { game, key } = fixture(); const units = game.state.entities.filter(e => e.type === 'gi'); units[3].x = 50;
    game.select([units[0].id]); key('t'); expect(units.filter(e => e.selected)).toHaveLength(3);
    key('t'); expect(units.filter(e => e.selected)).toHaveLength(4);
  });
  it('assigns and recalls teams and camera bookmarks with browser defaults suppressed', () => {
    const { game, key, camera } = fixture(); const tank = game.state.entities.find(e => e.type === 'grizzly')!;
    game.select([tank.id]); expect(key('1', { ctrlKey: true }).defaultPrevented).toBe(true); game.select([]); key('1'); expect(tank.selected).toBe(true);
    camera.center(30, 30); const bookmark = { x: camera.x, y: camera.y };
    expect(key('F1', { ctrlKey: true }).defaultPrevented).toBe(true); camera.center(15, 15); key('F1'); expect({ x: camera.x, y: camera.y }).toEqual(bookmark);
  });
  it('supports stop, guard, scatter, deploy, repair/sell modes, and follow', () => {
    const { game, controls, key, camera, click } = fixture(); const unit = game.state.entities.find(e => e.type === 'gi')!;
    game.select([unit.id]); game.orderMove([unit.id], 21, 38); key('s'); expect(unit.path).toHaveLength(0);
    const guard = vi.spyOn(game, 'guard'); key('g'); expect(guard).toHaveBeenCalledWith([unit.id]);
    key('d'); expect(unit.deployed).toBe(true); key('x'); expect(unit.deployed).toBe(false); expect(unit.path.length).toBeGreaterThan(0);
    key('f'); unit.x = 22; unit.y = 35; unit.previous = { x: 22, y: 35 }; controls.tick(.05); expect(camera.world(camera.width / 2, camera.height / 2)).toEqual({ x: 22, y: 35 });
    const power = game.state.entities.find(e => e.type === 'power')!; power.hp -= 100; const repair = vi.spyOn(game, 'repair');
    key('k'); expect(controls.mode).toBe('repair'); click(power); expect(repair).toHaveBeenCalledWith(power.id);
    key('l'); expect(controls.mode).toBe('sell'); key('Escape'); expect(controls.mode).toBe('select');
  });
  it('queues waypoints while Z is held and starts the route only on release', () => {
    const { game, key, click } = fixture(); const unit = game.state.entities.find(e => e.type === 'grizzly')!; game.select([unit.id]);
    const route = vi.spyOn(game, 'orderWaypoints'); key('z'); click(); click(); expect(route).not.toHaveBeenCalled(); expect(unit.path).toHaveLength(0);
    key('z', { type: 'keyup' }); expect(route).toHaveBeenCalledWith([unit.id], [expect.any(Object), expect.any(Object)]);
  });
  it('cycles creation order, previous selection, and health bands', () => {
    const { game, key } = fixture(); const units = game.state.entities.filter(e => e.type === 'gi');
    game.select([units[0].id]); key('m'); expect(units[1].selected).toBe(true); key('n'); expect(units[0].selected).toBe(true);
    units[0].hp = units[0].maxHp * .4; units[1].hp = units[1].maxHp * .2;
    key('u'); expect(units[0].selected || units[1].selected).toBe(false);
    key('u'); expect(units[0].selected).toBe(true); key('u'); expect(units[1].selected).toBe(true);
  });
  it('does not hijack text, modals, source gate, browser shortcuts, or button Space/Enter', () => {
    const { game, controls, key, settings, enable } = fixture();
    key('p', { kind: 'input' }); key('p', { kind: 'dialog' }); expect(game.state.entities.some(e => e.selected)).toBe(false);
    settings(true); key('p'); settings(false); enable(false); key('p'); expect(game.state.entities.some(e => e.selected)).toBe(false);
    enable(true); expect(key('r', { ctrlKey: true }).defaultPrevented).toBe(false); expect(key(' ').defaultPrevented).toBe(false); expect(key('Enter').defaultPrevented).toBe(false);
    expect(controls.mode).toBe('select');
  });
  it('follows the interpolated presentation point between logic frames', () => {
    const { game, controls, key, camera } = fixture(); const unit = game.state.entities.find(e => e.type === 'grizzly')!;
    game.select([unit.id]); game.orderMove([unit.id], 22.5, 36.5); key('f'); game.tick(.05); controls.tick(.05);
    const point = camera.world(camera.width / 2, camera.height / 2), alpha = game.interpolation;
    expect(point.x).toBeCloseTo(unit.previous!.x + (unit.x - unit.previous!.x) * alpha, 8);
    expect(point.y).toBeCloseTo(unit.previous!.y + (unit.y - unit.previous!.y) * alpha, 8);
  });
  it('resets stale groups and gestures on restart and suppresses camera scrolling while a modal is open', () => {
    const { game, controls, key, camera, settings } = fixture(); const unit = game.state.entities.find(e => e.type === 'gi')!;
    game.select([unit.id]); key('1', { ctrlKey: true }); game.restart(); controls.tick(.05); key('1'); expect(game.state.entities.some(e => e.selected)).toBe(false);
    key('ArrowLeft'); const x = camera.x; settings(true); controls.tick(.1); expect(camera.x).toBe(x);
    settings(false); controls.tick(.1); expect(camera.x).toBe(x);
  });
});


describe('native contextual cursors', () => {
  it('tracks selection, modifiers, terrain and real repair/sell eligibility without issuing orders', () => {
    const { game, controls, pointer, camera, pick, callbacks, key } = fixture();
    const tank = game.state.entities.find(e => e.type === 'grizzly')!, gi = game.state.entities.find(e => e.type === 'gi')!, power = game.state.entities.find(e => e.type === 'power')!;
    camera.center(30.5, 30.5); game.state.tiles[30 * game.state.width + 30].terrain = 'grass';
    pointer('pointermove', 500, 350); expect(controls.cursor).toBe('default');
    game.select([tank.id]); controls.tick(0); expect(callbacks.cursor).toHaveBeenLastCalledWith('move');
    const move = vi.spyOn(game, 'orderMove');
    pointer('pointermove', 500, 350, { ctrlKey: true, shiftKey: true }); expect(controls.cursor).toBe('attackmove');
    pointer('pointermove', 500, 350, { ctrlKey: true, altKey: true }); expect(controls.cursor).toBe('guard');
    pointer('pointermove', 500, 350, { ctrlKey: true }); expect(controls.cursor).toBe('attack');
    pointer('pointermove', 500, 350); game.state.tiles[30 * game.state.width + 30].terrain = 'water'; expect(controls.cursor).toBe('move-blocked');
    pick(gi); game.select([gi.id]); expect(controls.cursor).toBe('deploy');
    pick(power); controls.setMode('repair'); expect(controls.cursor).toBe('repair-blocked'); power.hp--; expect(controls.cursor).toBe('repair');
    controls.setMode('sell'); expect(controls.cursor).toBe('sell'); pick(tank); expect(controls.cursor).toBe('sell-blocked');
    expect(move).not.toHaveBeenCalled();
    key('Escape'); pointer('pointerleave'); expect(callbacks.cursor).toHaveBeenLastCalledWith('default');
  });
  it('shows eight-direction scrolling and suppresses gameplay cursors behind dialogs and the source gate', () => {
    const { controls, camera, pointer, settings, enable } = fixture(); camera.center(30, 30);
    pointer('pointermove', 1, 1); expect(controls.cursor).toBe('scroll-nw');
    camera.center(-3, -3); expect(controls.cursor).toBe('scroll-nw-blocked');
    settings(true); expect(controls.cursor).toBe('default'); settings(false); enable(false); expect(controls.cursor).toBe('default');
  });
});
