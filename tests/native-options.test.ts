import { afterEach, describe, expect, it, vi } from 'vitest';
import { TooltipDelay } from '../src/ui/Tooltips';
import { UI } from '../src/ui/UI';
import { NativeOptions, OPTIONS_STORAGE_KEY, optionsSidebarLayout, readOptionsPreferences } from '../src/ui/NativeOptions';
import type { UIActions } from '../src/ui/UI';
import type { GameAPI } from '../src/game/types';
import { BINDING_DEFAULTS } from '../src/input/bindings';
import { Game } from '../src/game/Game';

afterEach(() => vi.useRealTimers());

it.each([
  [null, 2],
  [JSON.stringify({ speed: 900 }), 2],
  [JSON.stringify({ effects: 0 }), 2],
  [JSON.stringify({ speed: 1 }), 1],
  [JSON.stringify({ speed: .5 }), .5],
])('applies saved speed %s over the fresh Faster default', (saved, expected) => {
  const game = new Game({ ai: false });
  const options = Object.assign(Object.create(NativeOptions.prototype), {
    preferences: readOptionsPreferences({ getItem: () => saved }),
    preferencesApplied: false,
    actions: { onSpeed: (speed: number) => game.setGameSpeed(speed), onEffectsVolume: vi.fn() },
  });
  options.applyPreferences();
  expect(game.state.speed).toBe(expected);
  game.restart(); expect(game.state.speed).toBe(expected);
});

describe('native tooltip dwell', () => {
  it('waits more than two seconds, restarts after movement, and cancels stale targets', () => {
    vi.useFakeTimers();
    const showPower = vi.fn(), showTank = vi.fn(), hide = vi.fn();
    const delay = new TooltipDelay(hide);
    delay.point('power', 10, 10, showPower);
    vi.advanceTimersByTime(1900);
    delay.point('power', 14, 10, showPower);
    vi.advanceTimersByTime(2000);
    expect(showPower).not.toHaveBeenCalled();
    delay.point('tank', 14, 10, showTank);
    vi.advanceTimersByTime(2001);
    expect(showTank).toHaveBeenCalledOnce();
    expect(showPower).not.toHaveBeenCalled();
    delay.point('power', 14, 10, showPower);
    delay.clear(); // Disabling Tooltips, a click, or opening the source gate.
    vi.advanceTimersByTime(3000);
    expect(showPower).not.toHaveBeenCalled();
    expect(hide).toHaveBeenCalled();
  });

  it('does not postpone a stationary tooltip because of subpixel pointer jitter', () => {
    vi.useFakeTimers(); const show = vi.fn(), delay = new TooltipDelay(vi.fn());
    delay.point('tank', 10, 10, show);
    for (let i = 0; i < 20; i++) { vi.advanceTimersByTime(100); delay.point('tank', 10.5, 10, show); }
    expect(show).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1); expect(show).toHaveBeenCalledOnce();
  });
});

it('uses current bindings for hints and help after a collision, without changing action labels', () => {
  const elements = new Map<string, { dataset: Record<string,string>; innerHTML: string; ariaLabel: string }>();
  const el = (selector: string) => {
    if (!elements.has(selector)) elements.set(selector, { dataset: {}, innerHTML: '', ariaLabel: 'Stable action name' });
    return elements.get(selector)!;
  };
  const bindings = BINDING_DEFAULTS.map(row => ({ ...row, key: row.defaultKey as string | null }));
  bindings.find(row => row.id === 'repair')!.key = 'S';
  bindings.find(row => row.id === 'stop')!.key = null;
  bindings.find(row => row.id === 'structures')!.key = null;
  const ui = Object.assign(Object.create(UI.prototype), {
    actions: { getBindings: () => bindings },
    root: { querySelector: el, querySelectorAll: (selector: string) => [el(selector)] },
  });
  ui.refreshBindingHints();
  expect(el('[data-mode="repair"]').dataset.tooltip).toBe('Repair mode · S');
  expect(el('[data-category="structures"]').dataset.tooltip).toBe('Structures');
  expect(el('[data-mode="repair"]').ariaLabel).toBe('Stable action name');
  expect(el('#binding-help').innerHTML).toContain('<span>Stop</span><kbd>Unassigned</kbd>');
});

it('registers authored sidebar rows and Back at the traced 800×600 coordinates', () => {
  expect(optionsSidebarLayout(600)).toEqual({ rows: 6, side3: 527, back: 502, addon: 553 });
  expect(optionsSidebarLayout(768)).toEqual({ rows: 10, side3: 727, back: 702, addon: 753 });
});

it('restores only valid game preferences and tolerates unavailable browser storage', () => {
  const getItem = vi.fn(() => JSON.stringify({ speed: 2, scroll: 3, effects: 0, targetLines: false, tooltips: false, assetSource: 'ignored' }));
  expect(readOptionsPreferences({ getItem })).toEqual({ speed: 2, scroll: 3, effects: 0, targetLines: false, tooltips: false });
  expect(getItem).toHaveBeenCalledExactlyOnceWith(OPTIONS_STORAGE_KEY);
  expect(readOptionsPreferences({ getItem: () => JSON.stringify({ speed: 900, scroll: -1, effects: 11, targetLines: 'false' }) })).toEqual({});
  expect(readOptionsPreferences({ getItem: () => { throw new Error('Storage unavailable'); } })).toEqual({});
});

it('applies a native checkbox input/change sequence before reflecting model state', () => {
  const listeners = new Map<string, (event: { target: unknown }) => void>();
  const root = { addEventListener: (type: string, listener: (event: { target: unknown }) => void) => listeners.set(type,listener), querySelector: () => ({ addEventListener: vi.fn() }) };
  let targetLines = true;
  const input = { id: 'target-lines', type: 'checkbox', checked: false, value: 'on' };
  const options = new NativeOptions(root as unknown as HTMLElement, {} as GameAPI, { onTargetLines: value => { targetLines=value; } } as UIActions, { paint:vi.fn(), close:vi.fn(), tooltips:()=>true, bindingsChanged:vi.fn() });
  vi.spyOn(options,'update').mockImplementation(() => { input.checked=targetLines; });
  listeners.get('input')!({target:input});
  expect(input.checked).toBe(false);
  listeners.get('change')!({target:input});
  expect(targetLines).toBe(false);
  expect(input.checked).toBe(false);
});
