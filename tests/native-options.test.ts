import { uiActions } from './helpers/fixtures';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TooltipDelay } from '../src/ui/Tooltips';
import { UI } from '../src/ui/UI';
import {
  NativeOptions,
  OPTIONS_STORAGE_KEY,
  optionsSidebarLayout,
  readOptionsPreferences,
} from '../src/ui/NativeOptions';
import { BINDING_DEFAULTS } from '../src/input/bindings';
import { Game } from '../src/game/Game';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it.each([
  [null, 2],
  [JSON.stringify({ speed: 900 }), 2],
  [JSON.stringify({ effects: 0 }), 2],
  [JSON.stringify({ speed: 1 }), 1],
  [JSON.stringify({ speed: 0.5 }), 0.5],
])('applies saved speed %s over the fresh Faster default', (saved, expected) => {
  const game = new Game({ ai: false });

  const options = Object.assign(Object.create(NativeOptions.prototype), {
    preferences: readOptionsPreferences({ getItem: () => saved }),
    preferencesApplied: false,
    actions: { onSpeed: (speed: number) => game.setGameSpeed(speed), onEffectsVolume: vi.fn() },
  });

  options.applyPreferences();
  expect(game.state.speed).toBe(expected);
  game.restart();
  expect(game.state.speed).toBe(expected);
});

describe('native tooltip dwell', () => {
  it('waits more than two seconds, restarts after movement, and cancels stale targets', () => {
    vi.useFakeTimers();

    const showPower = vi.fn(),
      showTank = vi.fn(),
      hide = vi.fn();

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
    vi.useFakeTimers();

    const show = vi.fn(),
      delay = new TooltipDelay(vi.fn());

    delay.point('tank', 10, 10, show);

    for (let i = 0; i < 20; i++) {
      vi.advanceTimersByTime(100);
      delay.point('tank', 10.5, 10, show);
    }

    expect(show).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(show).toHaveBeenCalledOnce();
  });
});

it('uses current bindings for hints and help after a collision, without changing action labels', () => {
  const elements = new Map<
    string,
    { dataset: Record<string, string>; innerHTML: string; ariaLabel: string }
  >();

  const el = (selector: string) => {
    if (!elements.has(selector))
      elements.set(selector, { dataset: {}, innerHTML: '', ariaLabel: 'Stable action name' });

    return elements.get(selector)!;
  };

  const bindings = BINDING_DEFAULTS.map((row): typeof row & { key: string | null } => ({
    ...row,
    key: row.defaultKey,
  }));

  bindings.find((row) => row.id === 'repair')!.key = 'S';
  bindings.find((row) => row.id === 'stop')!.key = null;
  bindings.find((row) => row.id === 'structures')!.key = null;

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
  const getItem = vi.fn(() =>
    JSON.stringify({
      speed: 2,
      scroll: 3,
      effects: 0,
      music: 7,
      targetLines: false,
      tooltips: false,
      assetSource: 'ignored',
    }),
  );

  expect(readOptionsPreferences({ getItem })).toEqual({
    speed: 2,
    scroll: 3,
    effects: 0,
    music: 7,
    targetLines: false,
    tooltips: false,
  });
  expect(getItem).toHaveBeenCalledExactlyOnceWith(OPTIONS_STORAGE_KEY);
  expect(
    readOptionsPreferences({
      getItem: () =>
        JSON.stringify({ speed: 900, scroll: -1, effects: 11, music: -1, targetLines: 'false' }),
    }),
  ).toEqual({});
  expect(
    readOptionsPreferences({
      getItem: () => {
        throw new Error('Storage unavailable');
      },
    }),
  ).toEqual({});
});

it('persists a live music slider change and restores it independently of existing effects preferences', () => {
  let saved = JSON.stringify({ effects: 2 });
  vi.stubGlobal('localStorage', {
    getItem: () => saved,
    setItem: (_key: string, value: string) => {
      saved = value;
    },
  });

  try {
    const { root, dispatch, input } = optionsDom();

    const music = vi.fn(),
      effects = vi.fn();

    const create = () =>
      new NativeOptions(
        root,
        new Game({ ai: false }),
        uiActions({ onMusicVolume: music, onEffectsVolume: effects }),
        { paint: vi.fn(), close: vi.fn(), tooltips: () => true, bindingsChanged: vi.fn() },
      );

    const options = create();
    vi.spyOn(options, 'update').mockImplementation(() => {});
    options.applyPreferences();
    expect(effects).toHaveBeenLastCalledWith(2);
    expect(music).not.toHaveBeenCalled();
    Object.assign(input, { id: 'music-volume', type: 'range', value: '0' });
    dispatch('input');
    expect(music).toHaveBeenLastCalledWith(0);
    expect(JSON.parse(saved)).toEqual({ effects: 2, music: 0 });
    music.mockClear();
    create().applyPreferences();
    expect(music).toHaveBeenLastCalledWith(0);
  } finally {
    vi.unstubAllGlobals();
  }
});

it('applies a native checkbox input/change sequence before reflecting model state', () => {
  const { root, dispatch, input } = optionsDom();
  let targetLines = true;
  Object.assign(input, { id: 'target-lines', type: 'checkbox', checked: false, value: 'on' });

  const options = new NativeOptions(
    root,
    new Game({ ai: false }),
    uiActions({
      onTargetLines: (value) => {
        targetLines = value;
      },
    }),
    { paint: vi.fn(), close: vi.fn(), tooltips: () => true, bindingsChanged: vi.fn() },
  );

  vi.spyOn(options, 'update').mockImplementation(() => {
    input.checked = targetLines;
  });
  dispatch('input');
  expect(input.checked).toBe(false);
  dispatch('change');
  expect(targetLines).toBe(false);
  expect(input.checked).toBe(false);
});

function optionsDom() {
  class Input extends EventTarget {
    id = '';
    type = '';
    value = '';
    checked = false;
  }

  const input = new Input();

  class Root extends EventTarget {
    querySelector() {
      return input;
    }
  }

  vi.stubGlobal('HTMLInputElement', Input);
  vi.stubGlobal('HTMLSelectElement', class extends Input {});
  vi.stubGlobal('document', { createElement: () => new Root() });
  const root = document.createElement('div');

  const dispatch = (type: string) => {
    const event = new Event(type);
    Object.defineProperty(event, 'target', { value: input });
    root.dispatchEvent(event);
  };

  return { root, input, dispatch };
}
