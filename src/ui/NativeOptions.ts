import type { GameAPI } from '../game/types';
import type { UIActions, BindingInfo } from './UI';
import { GAME_SPEED_STEPS, SCROLL_RATE_STEPS } from '../input/bindings';

export type OptionsScreen =
  | 'options'
  | 'controls'
  | 'sound'
  | 'keyboard'
  | 'assets'
  | 'briefing'
  | 'abort';

export const SPEED_LABELS = ['Slowest', 'Slower', 'Slow', 'Medium', 'Fast', 'Faster', 'Fastest'];

const SPEED_STEPS = GAME_SPEED_STEPS;

const SCROLL_STEPS = SCROLL_RATE_STEPS;

export const OPTIONS_STORAGE_KEY = 'ra2-game-options:v1';

export interface OptionsPreferences {
  speed?: number;
  scroll?: number;
  effects?: number;
  music?: number;
  targetLines?: boolean;
  tooltips?: boolean;
}

interface StoredOptions {
  speed?: unknown;
  scroll?: unknown;
  effects?: unknown;
  music?: unknown;
  targetLines?: unknown;
  tooltips?: unknown;
}

function isStoredOptions(value: unknown): value is StoredOptions {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isVolume(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 10;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function readOptionsPreferences(storage: Pick<Storage, 'getItem'>): OptionsPreferences {
  try {
    const raw = JSON.parse(storage.getItem(OPTIONS_STORAGE_KEY) ?? '{}'),
      value: OptionsPreferences = {};

    if (!isStoredOptions(raw)) return value;

    const speed = SPEED_STEPS.find((step) => step === raw.speed);

    if (speed !== undefined) value.speed = speed;

    const scroll = SCROLL_STEPS.find((step) => step === raw.scroll);

    if (scroll !== undefined) value.scroll = scroll;

    if (isVolume(raw.effects)) value.effects = raw.effects;

    if (isVolume(raw.music)) value.music = raw.music;

    for (const key of ['targetLines', 'tooltips'] as const)
      if (isBoolean(raw[key])) value[key] = raw[key];

    return value;
  } catch {
    return {};
  }
}

// The original allocator repeats fifty-pixel sidebar rows below the radar.
export function optionsSidebarLayout(height: number) {
  const rows = Math.max(0, Math.floor((height - 227 - 26) / 50));

  return { rows, side3: 227 + rows * 50, back: 202 + rows * 50, addon: 253 + rows * 50 };
}

export const parentOptionsScreen = (screen: OptionsScreen): OptionsScreen | null =>
  screen === 'sound' || screen === 'keyboard'
    ? 'controls'
    : screen === 'options' || screen === 'briefing'
      ? null
      : 'options';

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

const text = (value: string) => `<span data-native="${escape(value)}">${escape(value)}</span>`;

const nav = (screen: string, label: string, extra = '') =>
  `<button type="button" class="native-menu-button" data-options-screen="${screen}" ${extra}>${text(label)}</button>`;

const slider = (id: string, label: string, max = 6) =>
  `<div class="native-setting"><label for="${id}">${text(label)}</label><input type="range" id="${id}" min="0" max="${max}" step="1" aria-label="${label}" /><output for="${id}" id="${id}-value"></output></div>`;

const checkbox = (id: string, label: string) =>
  `<label class="native-checkbox" id="${id}-row"><input id="${id}" type="checkbox" /><i aria-hidden="true"></i>${text(label)}</label>`;

export function optionsMarkup(sourcePane: string, briefingPane: string): string {
  return `<div class="native-options-modal" id="settings-modal" hidden><section class="native-options" role="dialog" aria-modal="true" aria-labelledby="settings-title" data-screen="options">
    <div class="options-background" aria-hidden="true"></div>
    <div class="options-main">
      <div class="options-page options-empty" data-options-page="options"></div>
      <div class="options-page" data-options-page="controls" hidden><div class="native-controls-form">
        ${slider('game-speed', 'Game Speed')}${slider('scroll-rate', 'Scroll Rate')}
        <div class="native-checks">${checkbox('target-lines', 'Target Lines')}${checkbox('tooltips', 'Tooltips')}${checkbox('show-hidden', 'Show Hidden Objects')}</div>
      </div></div>
      <div class="options-page" data-options-page="sound" hidden><div class="native-sound-form">${slider('music-volume', 'Music', 10)}${slider('effects-volume', 'Sound', 10)}<p class="options-explanation">Music and sound effects volume</p><button type="button" class="native-menu-button" data-options-action="preview-sound">${text('Play')}</button></div></div>
      <div class="options-page" data-options-page="keyboard" hidden><div class="native-keyboard-form">
        <label for="keyboard-category">${text('Category')}</label><select id="keyboard-category"></select>
        <label for="keyboard-command">${text('Command')}</label><select id="keyboard-command" size="7"></select>
        <div class="binding-description" id="binding-description"></div>
        <div class="binding-current">${text('Current Shortcut')}<strong id="binding-current"></strong></div>
        <label for="binding-new">${text('New Shortcut')}</label><input id="binding-new" type="text" autocomplete="off" spellcheck="false" maxlength="1" aria-describedby="binding-assignment" />
        <div id="binding-assignment" class="binding-assignment" role="status"></div>
        <div class="binding-actions"><button type="button" class="native-menu-button" data-options-action="assign">${text('Assign')}</button><button type="button" class="native-menu-button" data-options-action="reset-bindings">${text('Reset All')}</button></div>
      </div></div>
      <div class="options-page options-assets-page" data-options-page="assets" hidden>${sourcePane}</div>
      <div class="options-page options-briefing-page" data-options-page="briefing" hidden>${briefingPane}</div>
      <div class="options-page" data-options-page="abort" hidden><div class="native-confirm"><h2>${text('Abort Mission?')}</h2><p>Return to the game-files screen. Your current skirmish will end.</p><button type="button" class="native-menu-button" data-options-action="abort">${text('Abort Mission')}</button></div></div>
    </div>
    <aside class="options-sidebar" aria-label="Options navigation"><div class="options-credits"><strong id="settings-title"></strong></div><div class="options-top" aria-hidden="true"></div><div class="options-radar" aria-hidden="true"></div><div class="options-side1" aria-hidden="true"></div><div class="options-side2" aria-hidden="true"></div><div class="options-side3" aria-hidden="true"></div><div class="options-addon" aria-hidden="true"></div>
      <nav class="options-nav" data-options-nav="options">${nav('controls', 'Game Controls')}${nav('assets', 'Game Files', 'data-browser-extension')}${nav('abort', 'Abort Mission')}</nav>
      <nav class="options-nav" data-options-nav="controls" hidden>${nav('sound', 'Sound')}${nav('keyboard', 'Keyboard')}</nav>
      <button type="button" class="native-menu-button options-back" data-options-action="back"></button>
    </aside>
    <p class="options-help" id="options-help" role="status"></p>
  </section></div>`;
}

interface OptionsHooks {
  paint(element: HTMLElement, text: string): void;
  close(): void;
  tooltips(enabled?: boolean): boolean;
  bindingsChanged(): void;
}

export class NativeOptions {
  screen: OptionsScreen = 'options';
  private selectedBinding = '';
  private capturedKey = '';
  private bindingRows: readonly BindingInfo[] = [];
  private preferences: OptionsPreferences = {};
  private preferencesApplied = false;
  constructor(
    private root: HTMLElement,
    private game: GameAPI,
    private actions: UIActions,
    private hooks: OptionsHooks,
  ) {
    try {
      this.preferences = readOptionsPreferences(localStorage);
    } catch {
      /* Optional preferences never block play. */
    }

    root.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;

      const target = event.target.closest<HTMLElement>(
        '[data-options-screen],[data-options-action]',
      );

      if (!target) return;

      const screen = (
        ['options', 'controls', 'sound', 'keyboard', 'assets', 'briefing', 'abort'] as const
      ).find((screen) => screen === target.dataset.optionsScreen);

      if (screen) this.show(screen);
      else
        switch (target.dataset.optionsAction) {
          case 'back':
            this.back();
            break;
          case 'abort':
            this.hooks.close();
            this.actions.onAbort?.();
            break;
          case 'preview-sound':
            this.actions.onPreviewSound?.();
            break;
          case 'assign':
            this.assign();
            break;
          case 'reset-bindings':
            this.actions.onResetBindings?.();
            this.refreshBindings();
            this.hooks.bindingsChanged();
            this.describeBinding('Default shortcuts restored.');
            break;
        }
    });
    root.addEventListener('input', (event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement)) return;
      const value = Number(input.value);

      // Checkboxes emit input before change. Reading model state here would
      // undo their newly checked value before the change handler applies it.
      if (input.type !== 'range') return;

      if (input.id === 'game-speed') {
        if (this.actions.onSpeed) this.actions.onSpeed(SPEED_STEPS[value]);
        else this.game.state.speed = SPEED_STEPS[value];
        this.remember('speed', SPEED_STEPS[value]);
      }

      if (input.id === 'scroll-rate') {
        this.actions.onScrollRate?.(SCROLL_STEPS[value]);
        this.remember('scroll', SCROLL_STEPS[value]);
      }

      if (input.id === 'effects-volume') {
        this.actions.onEffectsVolume?.(value);
        this.remember('effects', value);
      }

      if (input.id === 'music-volume') {
        this.actions.onMusicVolume?.(value);
        this.remember('music', value);
      }

      this.update();
    });
    root.addEventListener('change', (event) => {
      const input = event.target;

      if (!(input instanceof HTMLInputElement) && !(input instanceof HTMLSelectElement)) return;

      if (input instanceof HTMLInputElement && input.id === 'target-lines') {
        this.actions.onTargetLines?.(input.checked);
        this.remember('targetLines', input.checked);
      }

      if (input instanceof HTMLInputElement && input.id === 'tooltips') {
        this.hooks.tooltips(input.checked);
        this.remember('tooltips', input.checked);
      }

      if (input instanceof HTMLInputElement && input.id === 'show-hidden')
        this.actions.onShowHidden?.(input.checked);

      if (input.id === 'keyboard-category') this.refreshCommands();

      if (input.id === 'keyboard-command') {
        this.selectedBinding = input.value;
        this.capturedKey = '';
        this.input('binding-new').value = '';
        this.describeBinding();
      }

      this.update();
    });
    this.input('binding-new').addEventListener('keydown', (event) => {
      if (event.key === 'Tab' || event.key === 'Escape') return;
      event.preventDefault();
      event.stopPropagation();

      if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) {
        this.capturedKey = '';
        this.input('binding-new').value = '';
        this.assignButton().disabled = true;
        this.message('Choose a letter or ?; browser and navigation shortcuts are reserved.');

        return;
      }

      this.capturedKey = event.key.toUpperCase();
      this.input('binding-new').value = this.capturedKey;
      const result = this.actions.inspectBinding?.(this.selectedBinding, this.capturedKey);
      this.message(
        result?.ok
          ? result.conflict
            ? `Currently assigned to ${result.conflict.label}. Assign will replace it.`
            : 'Not currently assigned.'
          : (result?.reason ?? 'Choose a command first.'),
      );
      this.assignButton().disabled = !result?.ok;
    });
  }
  private el<T extends HTMLElement = HTMLElement>(id: string): T {
    return this.root.querySelector(`#${id}`)!;
  }
  private input(id: string) {
    return this.el<HTMLInputElement>(id);
  }
  private assignButton() {
    return this.root.querySelector<HTMLButtonElement>('[data-options-action="assign"]')!;
  }
  private paint(element: HTMLElement, value: string) {
    this.hooks.paint(element, value);
  }
  private remember<K extends keyof OptionsPreferences>(key: K, value: OptionsPreferences[K]) {
    this.preferences[key] = value;

    try {
      localStorage.setItem(OPTIONS_STORAGE_KEY, JSON.stringify(this.preferences));
    } catch {
      /* Continue with session preferences. */
    }
  }
  applyPreferences() {
    if (this.preferencesApplied) return;
    this.preferencesApplied = true;
    const value = this.preferences;

    if (value.speed !== undefined) this.actions.onSpeed?.(value.speed);

    if (value.scroll !== undefined) this.actions.onScrollRate?.(value.scroll);

    if (value.effects !== undefined) this.actions.onEffectsVolume?.(value.effects);

    if (value.music !== undefined) this.actions.onMusicVolume?.(value.music);

    if (value.targetLines !== undefined) this.actions.onTargetLines?.(value.targetLines);

    if (value.tooltips !== undefined) this.hooks.tooltips(value.tooltips);
  }
  show(screen: OptionsScreen) {
    this.screen = screen;
    this.root.querySelector<HTMLElement>('.native-options')!.dataset.screen = screen;
    this.root
      .querySelectorAll<HTMLElement>('[data-options-page]')
      .forEach((page) => (page.hidden = page.dataset.optionsPage !== screen));
    this.root
      .querySelectorAll<HTMLElement>('[data-options-nav]')
      .forEach((nav) => (nav.hidden = nav.dataset.optionsNav !== screen));

    const titles: Record<OptionsScreen, string> = {
      options: 'Game Options',
      controls: 'Game Options',
      sound: 'Sound Options',
      keyboard: 'Keyboard',
      assets: 'Game Files',
      briefing: 'Briefing',
      abort: 'Game Options',
    };

    this.paint(this.el('settings-title'), titles[screen]);
    this.paint(
      this.root.querySelector('.options-back')!,
      screen === 'options' ? 'Resume Mission' : screen === 'briefing' ? 'Return' : 'Back',
    );
    this.root
      .querySelectorAll<HTMLElement>('[data-native]')
      .forEach((label) => this.paint(label, label.dataset.native!));
    this.el('options-help').textContent =
      screen === 'options'
        ? ''
        : screen === 'keyboard'
          ? 'Select a command, press a new key, then choose Assign.'
          : '';

    if (screen === 'keyboard') this.refreshBindings();
    this.update();
    this.root
      .querySelector<HTMLElement>(
        screen === 'controls'
          ? '#game-speed'
          : screen === 'sound'
            ? '#effects-volume'
            : screen === 'keyboard'
              ? '#keyboard-category'
              : screen === 'assets'
                ? '#asset-source'
                : '.options-back',
      )
      ?.focus({ preventScroll: true });
  }
  back() {
    const parent = parentOptionsScreen(this.screen);

    if (parent) this.show(parent);
    else this.hooks.close();
  }
  update() {
    if (this.root.hidden) return;
    const layout = optionsSidebarLayout(this.root.clientHeight);
    this.root.style.setProperty('--options-side3-y', `${layout.side3}px`);
    this.root.style.setProperty('--options-back-y', `${layout.back}px`);
    this.root.style.setProperty('--options-addon-y', `${layout.addon}px`);
    this.root.style.setProperty('--options-rows-height', `${layout.rows * 50}px`);

    const nearest = (steps: readonly number[], value: number) =>
      steps.reduce(
        (best, v, index) => (Math.abs(v - value) < Math.abs(steps[best] - value) ? index : best),
        0,
      );

    const speed = nearest(SPEED_STEPS, this.game.state.speed),
      scroll = nearest(SCROLL_STEPS, this.actions.getScrollRate?.() ?? 1);

    for (const [id, value, label] of [
      ['game-speed', speed, SPEED_LABELS[speed]],
      ['scroll-rate', scroll, SPEED_LABELS[scroll]],
      [
        'music-volume',
        this.actions.getMusicVolume?.() ?? 5,
        String(this.actions.getMusicVolume?.() ?? 5),
      ],
      [
        'effects-volume',
        this.actions.getEffectsVolume?.() ?? 10,
        String(this.actions.getEffectsVolume?.() ?? 10),
      ],
    ] as const) {
      if (document.activeElement !== this.input(id)) this.input(id).value = String(value);
      this.input(id).setAttribute('aria-valuetext', String(label));
      this.paint(this.el(`${id}-value`), String(label));
    }

    this.input('target-lines').checked = this.actions.getTargetLines?.() ?? true;
    this.input('game-speed').dataset.tooltip =
      'Adjust the simulation speed. Fastest is capped at 4× in this browser version.';
    this.input('scroll-rate').dataset.tooltip =
      'Adjust camera movement from arrows and screen edges.';
    this.input('tooltips').checked = this.hooks.tooltips();
    this.input('show-hidden').checked = this.actions.getShowHidden?.() ?? false;
    this.el('show-hidden-row').hidden = !this.actions.onShowHidden;
    this.input('music-volume').closest<HTMLElement>('.native-setting')!.hidden =
      !this.actions.onMusicVolume;
    this.root.querySelector<HTMLElement>('[data-options-screen="sound"]')!.hidden =
      !this.actions.onEffectsVolume;
    this.root.querySelector<HTMLElement>('[data-options-screen="keyboard"]')!.hidden =
      !this.actions.getBindings;
    this.root.querySelector<HTMLElement>('[data-options-screen="abort"]')!.hidden =
      !this.actions.onAbort;
    this.root.querySelector<HTMLElement>('[data-options-action="preview-sound"]')!.hidden =
      !this.actions.onPreviewSound;
  }
  private refreshBindings() {
    this.bindingRows = this.actions.getBindings?.() ?? [];
    const categories = [...new Set(this.bindingRows.map((row) => row.category))];

    const select = this.el<HTMLSelectElement>('keyboard-category'),
      previous = select.value;

    select.replaceChildren(...categories.map((category) => new Option(category, category)));

    if (categories.includes(previous)) select.value = previous;
    this.refreshCommands();
  }
  private refreshCommands() {
    const category = this.el<HTMLSelectElement>('keyboard-category').value;

    const rows = this.bindingRows.filter((row) => row.category === category),
      select = this.el<HTMLSelectElement>('keyboard-command');

    select.replaceChildren(...rows.map((row) => new Option(row.label, row.id)));

    if (rows.some((row) => row.id === this.selectedBinding)) select.value = this.selectedBinding;
    this.selectedBinding = select.value;
    this.capturedKey = '';
    this.input('binding-new').value = '';
    this.describeBinding();
  }
  private describeBinding(message = '') {
    const binding = this.bindingRows.find((row) => row.id === this.selectedBinding);
    this.el('binding-description').textContent = binding?.description ?? '';
    this.paint(this.el('binding-current'), binding?.key ?? 'Unassigned');
    this.message(message);
    this.assignButton().disabled = true;
  }
  private message(message: string) {
    this.el('binding-assignment').textContent = message;
  }
  private assign() {
    if (!this.capturedKey) return;
    const result = this.actions.onAssignBinding?.(this.selectedBinding, this.capturedKey);

    if (!result?.ok) {
      this.message(result?.reason ?? 'Shortcut was not assigned.');

      return;
    }

    this.refreshBindings();
    this.hooks.bindingsChanged();
    this.describeBinding('Shortcut assigned.');
    this.input('binding-new').focus();
  }
}
