import { revealedEntity } from '../game/visibility';
import { MAP_CATALOG } from '../game/maps/catalog';
import type { Category, GameAPI } from '../game/types';
import { inspectionStatus, INSPECTION_HELP } from '../game/customUnits';

import type { ControlMode, ControlCommand } from '../input/Controls';
import type { NativeFont } from '../assets/NativeFont';
import type { NativeCursors, NativeCursorName } from '../assets/NativeCursor';
import { assetSourceUrl, assetCacheKey, DEFAULT_ASSET_URL } from '../assets/AssetDownload';
import { Tooltips } from './Tooltips';
import { BINDING_DEFAULTS } from '../input/bindings';
import { NativeOptions, optionsMarkup, type OptionsScreen } from './NativeOptions';
import type { BindingInfo, BindingResult } from '../input/bindings';
export type { BindingInfo, BindingResult } from '../input/bindings';
export type { ControlMode } from '../input/Controls';
export interface UIActions {
  onPlace(type: string): void;
  onCenter(x: number, y: number): void;
  onZoom(delta: number): void;
  onMode(mode: ControlMode): void;
  onCommand?(command: ControlCommand, options: { shift?: boolean; ctrl?: boolean; clear?: boolean }): void;
  getPlanning?(): boolean;
  onRadar?(x: number, y: number, modifiers: { button?: number; shift?: boolean; ctrl?: boolean; alt?: boolean }): void;
  onSound(enabled: boolean): void;
  onAssetRetry(source: string): void;
  onAssetImport(files: File[]): void;
  onRestart(): void;
  getCameraView?(): { x: number; y: number }[];
  onPause?(paused: boolean): void;
  onSpeed?(speed: number): void;
  onTargetLines?(enabled: boolean): void;
  getTargetLines?(): boolean;
  onScrollRate?(value: number): void;
  getScrollRate?(): number;
  onEffectsVolume?(value: number): void;
  getEffectsVolume?(): number;
  onPreviewSound?(): void;
  onAbort?(): void;
  onShowHidden?(enabled: boolean): void;
  getShowHidden?(): boolean;
  getBindings?(): readonly BindingInfo[];
  inspectBinding?(id: string, key: string): BindingResult;
  onAssignBinding?(id: string, key: string): BindingResult;
  onResetBindings?(): void;
  getBattlefieldTooltip?(x: number, y: number): { id: number; title: string; description?: string } | null;
}
export interface AssetStatus {
  phase: string; detail?: string; progress?: number | null; error?: string; ready?: boolean; source?: string; cacheWarning?: string | null;
}
const CATEGORIES: Category[] = ['structures', 'defenses', 'infantry', 'vehicles'];
const CATEGORY_NAMES: Record<Category, string> = { structures: 'Structures', defenses: 'Defenses', infantry: 'Infantry', vehicles: 'Vehicles' };
const COMMANDS: [ControlCommand, string][] = [['team1', 'Team 1 · click to create or select; right click to disband'], ['team2', 'Team 2 · click to create or select; right click to disband'], ['type', 'Select units of the same type'], ['deploy', 'Deploy'], ['guard', 'Guard area'], ['planning', 'Planning mode']];
// Authored Allied [BuildingTypes] order: GAPOWR(1), GAREFN(2), GAPILE(4),
// GAWEAP(8), GAAIRC(106), also visible in the retail sidebar reference.
const ALLIED_STRUCTURE_ORDER = ['power', 'refinery', 'barracks', 'warfactory', 'radar', 'service_depot', 'battlelab', 'shipyard', 'ore_purifier'];
const STORAGE_NOTE = 'Game files are saved in this browser when storage is available.';
const SOURCE_HINT = 'Press Enter to use saved game files, or load this URL if they are not available.';
const escapeHTML = (value: unknown) => String(value).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]!);
const formatMoney = (value: number) => Math.floor(value).toLocaleString('en-US');
export function visibleCredits(value: number): number {
  // Progressive spending can leave an exact credit boundary a few floating-point
  // bits low. Correct only that noise; real fractional credits still round down.
  const nearest = Math.round(value);
  return Math.abs(value - nearest) < 1e-8 ? nearest : Math.floor(value);
}
const icons: Record<string, string> = {
  star: '<path d="m12 1 3.2 7 7.8.8-5.8 5.2 1.6 7.6-6.8-3.9-6.8 3.9L6.8 14 1 8.8 8.8 8z" fill="currentColor" stroke="none"/>',
  structures: '<path d="M3 21V10l9-6 9 6v11M7 21v-7h10v7M12 4V1M2 21h20M6 8V4h3"/>',
  defenses: '<path d="m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5zM8 11h8M12 7v8"/>',
  infantry: '<path d="M5 21v-4c0-3 3-5 7-5s7 2 7 5v4M8 7a4 4 0 0 1 8 0v2c0 2-2 3-4 3s-4-1-4-3ZM6 7h12M9 18v3M15 18v3"/>',
  vehicles: '<path d="M4 13h16l2 4-2 4H4l-2-4ZM7 13V8h9l3 5M13 8V5h9M6 17h12"/>',
  power: '<path d="m14 2-9 12h6l-1 8 9-12h-6z"/>',
  credits: '<path d="m12 2 9 5v10l-9 5-9-5V7zM15 8h-5c-3 0-3 4 0 4h4c3 0 3 4 0 4H9M12 5v14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
  play: '<path d="m8 4 12 8-12 8z"/>',
  settings: '<path d="m10 2 4 0 1 3 3 2 3-.2 2 3-2 3 0 3-3 2-3-.2-2 3-4 0-1-3-3-2-3 .2-2-3 2-3V9l3-2 3 .2z" transform="translate(1 0) scale(.91)"/><circle cx="12" cy="12" r="3"/>',
  target: '<circle cx="12" cy="12" r="7"/><path d="M12 1v7M12 16v7M1 12h7M16 12h7"/>',
  select: '<path d="m5 2 14 12-7 1-4 7z"/>',
  pan: '<path d="M12 2v20M2 12h20M8 6l4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4M18 8l4 4-4 4"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  minus: '<path d="M4 12h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  chevron: '<path d="m7 9 5 5 5-5"/>',
  stop: '<rect x="5" y="5" width="14" height="14"/>',
  wrench: '<path d="m14 4 3-2-1 5 3 3 4-1-2 4-5 1-9 9-5-5 10-9z"/>',
  sell: '<path d="M17 5H9a4 4 0 0 0 0 8h6a4 4 0 0 1 0 8H5M12 1v22"/>',
  sound: '<path d="M4 9h4l5-5v16l-5-5H4zM17 8c3 2 3 6 0 8M20 4c5 4 5 12 0 16"/>',
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m12 12 7-7M12 1v3M1 12h3M12 20v3M20 12h3"/>',
  upload: '<path d="M12 16V2M7 7l5-5 5 5M3 15v6h18v-6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 8c0-4 7-3 6 1-.5 2-3 2-3 5M12 17v1"/>',
};
const icon = (name: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? icons.target}</svg>`;

export class UI {
  private root: HTMLElement;
  private category: Category = 'structures';
  private cameos = new Map<string, string>();
  private font?: NativeFont;
  private cursors?: NativeCursors;
  private cursorName: NativeCursorName = 'default';
  private cursorStarted = 0;
  private cursorStyle = '';
  private nativeLabels = new WeakMap<HTMLElement, string>();
  private cardElements = new Map<string, HTMLElement>();
  private mobile: boolean;
  private options!: NativeOptions;
  private tooltipsEnabled = true;
  private tooltips!: Tooltips;
  private assetStatus: AssetStatus = { phase: 'awaiting-source', detail: 'Choose your original game files to begin.', progress: null };
  private lastSelection = '';
  private lastEvent = -1;
  private lastMinimap = 0;
  private radarOnline = false;
  private loading = true;
  private mode: ControlMode = 'select';
  private assetSubmitting = false;
  private assetSourceEdited = false;
  private toastTimer = 0;
  private lastWinner: number | null = null;
  private previousFocus: HTMLElement | null = null;
  private keyHandler: (event: KeyboardEvent) => void;

  constructor(private game: GameAPI, private actions: UIActions, options: { mobile?: boolean; assetSource?: string } = {}) {
    const initialSource = assetSourceUrl(options.assetSource ?? DEFAULT_ASSET_URL);
    this.mobile = options.mobile ?? /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    document.documentElement.classList.toggle('mobile-controls', this.mobile);
    this.root = document.createElement('div'); this.root.id = 'command-ui';
    this.root.innerHTML = `
      <div class="field-overlay">
        <div class="notifications" id="notifications" aria-live="polite" aria-atomic="true"></div>
        <div class="pause-banner" id="pause-banner" hidden><strong>Game Paused</strong><button data-action="pause" class="primary-button">Resume</button></div>
        <section class="selection-panel" id="selection-panel" aria-label="Selection details"></section>
        <div class="victory-panel" id="victory-panel" hidden></div>
      </div>

      <aside class="build-sidebar" id="build-sidebar" aria-label="Production and radar">
        <div class="sidebar-topline"><span class="resource credits" data-tooltip="Available credits"><strong id="credits-value" aria-label="0 credits"></strong></span><button class="icon-button mobile-close" data-action="build-toggle" aria-label="Close build panel">${icon('close')}</button></div>
        <div class="sidebar-menu"><button data-action="help" data-tooltip="Briefing" aria-label="Open mission briefing">${icon('help')}</button><button data-action="settings" data-tooltip="Options · Esc" aria-label="Open options">${icon('settings')}</button></div>
        <div class="radar-section"><div class="radar-frame" id="radar-frame"><div class="radar-offline" aria-label="Radar offline"></div><canvas id="minimap" width="140" height="110" aria-label="Radar offline. Build an Airforce Command to activate." tabindex="0" role="button"></canvas></div></div>
        <div class="sidebar-tools"><button data-mode="repair" class="repair-tool" data-tooltip="Repair mode · K" aria-label="Repair mode" aria-pressed="false">${icon('wrench')}</button><button data-mode="sell" class="sell-tool" data-tooltip="Sell mode · L" aria-label="Sell mode" aria-pressed="false">${icon('sell')}</button></div>
        <div class="build-tabs" role="tablist" aria-label="Production categories">${CATEGORIES.map((category, i) => `<button role="tab" class="build-tab ${i === 0 ? 'active' : ''}" data-category="${category}" aria-selected="${i === 0}" aria-label="${CATEGORY_NAMES[category]}" data-tooltip="${CATEGORY_NAMES[category]} · ${['Q', 'W', 'E', 'R'][i]}">${icon(category)}<span>${CATEGORY_NAMES[category]}</span><i class="category-queue-dot" id="queue-dot-${category}"></i></button>`).join('')}</div>
        <div class="production-heading" hidden><span id="production-counter"></span><h3 id="category-name">Structures</h3><span id="category-count"></span></div>
        <div class="production-well"><div class="resource power" id="power-resource" data-tooltip="Power supply / demand"><span class="power-meter"><i id="power-fill"></i><b id="power-demand"></b></span><strong id="power-value"></strong></div><div class="build-grid" id="build-grid" role="tabpanel" aria-label="Available production"></div></div>
        <div class="sidebar-scroll"><button data-action="build-down" aria-label="Scroll production down" data-tooltip="Scroll down"></button><button data-action="build-up" aria-label="Scroll production up" data-tooltip="Scroll up"></button></div>
        <div class="queue-panel" id="queue-panel"><div class="queue-idle"></div></div>
      </aside>

      <div class="loading-screen" id="loading-screen" role="dialog" aria-modal="true" aria-labelledby="loading-title"><div class="loading-command"><div class="loading-insignia">★</div><h1 id="loading-title">RED ALERT <b>2</b></h1><p class="loading-operation">Your battlefield awaits.</p><div class="startup-map-choice"><label for="startup-map-select">Battlefield</label><select id="startup-map-select"><option value="">Field Command · Training battlefield</option>${MAP_CATALOG.map(entry => `<option value="${entry.id}" ${new URLSearchParams(location.search).get('map') === entry.id ? 'selected' : ''}>${escapeHTML(entry.name)} · ${entry.players} starts</option>`).join('')}</select><div><small>Skirmish: Allied command vs. Soviet AI</small><a href="/maps/">Open Map Viewer ↗</a></div></div><form id="startup-source-form" class="source-form" novalidate><label for="startup-asset-source">Game archive URL</label><p class="source-intro" id="startup-source-description">Use the prefilled archive URL, or enter a URL for your own copy of the game.</p><input id="startup-asset-source" name="asset-source" type="text" inputmode="url" enterkeyhint="go" autocomplete="url" spellcheck="false" aria-describedby="startup-source-description startup-source-hint startup-source-error" value="${escapeHTML(initialSource)}" /><small id="startup-source-hint">${SOURCE_HINT}</small><p id="startup-source-error" class="source-error" role="alert"></p><button class="primary-button asset-submit-button" type="submit"><span id="startup-submit-label">Load & play</span><kbd>Enter ↵</kbd></button></form><div class="loading-status" role="status" aria-live="polite"><strong id="loading-phase">Choose your game files</strong><div class="loading-track"><i id="loading-progress"></i></div><p id="loading-detail">No download starts until you press Enter or choose Load & play.</p></div><div class="loading-actions"><label class="secondary-button file-button">${icon('upload')} Import game files<input type="file" multiple id="startup-asset-import" accept=".exe,.zip,.mix" aria-label="Import local game installer or MIX files" /></label></div><small id="loading-note" role="status">${STORAGE_NOTE}</small><button class="primary-button runtime-reload" data-action="reload" hidden>Reload battlefield</button></div></div>

      <nav class="mobile-commandbar" aria-label="Mobile commands"><button class="active" data-mode="select" aria-label="Select units mode; cancel building placement">${icon('select')}<span>SELECT</span></button><button data-mode="pan" aria-label="Pan camera mode">${icon('pan')}<span>PAN</span></button><button data-mode="attack" aria-label="Attack move mode">${icon('target')}<span>ATTACK</span></button><button data-action="stop" aria-label="Stop selected units">${icon('stop')}<span>STOP</span></button><button class="mobile-build-button" data-action="build-toggle" aria-expanded="false">${icon('structures')}<span>BUILD</span><i id="mobile-ready-dot"></i></button></nav>
      <footer class="statusbar" aria-label="Advanced command bar"><button class="command-bar-toggle" data-action="command-toggle" aria-label="Toggle advanced command bar" aria-expanded="true"></button><div class="tactical-buttons">${COMMANDS.map(([command, label]) => `<button data-command="${command}" aria-label="${label}" data-tooltip="${label}"${command === 'planning' ? ' aria-pressed="false"' : ''}></button>`).join('')}</div></footer>

      ${optionsMarkup(`<div class="settings-content"><p class="settings-intro">Enter a URL for your own copy of the game, or use the prefilled archive URL. Saved game files are reused when available.</p><div class="asset-detail-status"><span class="eyebrow" id="asset-phase">CHOOSE GAME FILES</span><strong id="asset-detail">Waiting for your game archive URL</strong><div class="download-track"><i id="download-progress"></i></div><small id="asset-error" role="alert"></small></div><form id="settings-source-form" class="source-form" novalidate><label class="input-label" for="asset-source">GAME ARCHIVE URL</label><input id="asset-source" name="asset-source" type="text" inputmode="url" enterkeyhint="go" autocomplete="url" spellcheck="false" aria-describedby="settings-source-hint asset-error" value="${escapeHTML(initialSource)}" /><small id="settings-source-hint">${SOURCE_HINT}</small><div class="asset-buttons"><button class="primary-button asset-submit-button" type="submit">${icon('radar')} LOAD / RETRY <kbd>Enter ↵</kbd></button><label class="secondary-button file-button">${icon('upload')} IMPORT LOCAL FILE<input type="file" multiple id="asset-import" accept=".exe,.zip,.mix" aria-label="Import local game archive or MIX file" /></label></div></form><p class="settings-note">You can import a downloaded .exe or .zip archive, or select ra2.mix and language.mix together. Custom remote URLs must allow cross-origin downloads. Your files stay saved in this browser when storage is available.</p></div>`, `<div class="settings-content"><p class="settings-intro">Build an economy. Protect your foothold. Bring the fight to the enemy.</p><ol class="field-manual"><li><span>01</span><div><strong>Establish your base</strong><p>Build a Power Plant, then a Barracks and Ore Refinery. When a structure is ready, click its card and choose a clear tile near your base.</p></div></li><li><span>02</span><div><strong>Keep the credits flowing</strong><p>Ore miners automatically find ore and return it to a refinery. Build additional miners to expand your economy.</p></div></li><li><span>03</span><div><strong>Command your army</strong><p>Select friendly units and give a move or attack order. Scout the map, defend your miners, and destroy the enemy base.</p></div></li></ol><div class="controls-table"><div><span>Select / order / attack</span><kbd>Left click</kbd></div><div><span>Select a group</span><kbd>Left drag</kbd></div><div><span>Add to selection</span><kbd>Shift + click</kbd></div><div><span>Deselect / cancel</span><kbd>Right click</kbd></div><div><span>Pan camera</span><kbd>Arrows / middle or right drag</kbd></div><div><span>Zoom battlefield</span><kbd>Mouse wheel / + −</kbd></div><div><span>Attack move</span><kbd>Ctrl + Shift + click</kbd></div><div><span>Force fire / force move</span><kbd>Ctrl + click / Alt + click</kbd></div><div><span>Guard a unit or building</span><kbd>Ctrl + Alt + click</kbd></div><div><span>Options</span><kbd>Escape</kbd></div><section id="binding-help"></section><div><span>Assign / recall team</span><kbd>Ctrl + 1–9 / 1–9</kbd></div><div><span>Add team to selection</span><kbd>Shift + 1–9</kbd></div><div><span>Set / recall camera bookmark</span><kbd>Ctrl + F1–F4 / F1–F4</kbd></div></div><p class="mobile-help settings-note">On touch devices, use Select to tap units or drag a selection box. Tap terrain to move selected units. Pan mode drags the map, Attack issues attack-move orders, and a two-finger pinch zooms. Open Build to manage production. Tap Select to cancel building placement without losing your completed structure.</p></div>`)}`;
    document.querySelector('#app')!.append(this.root);
    this.options = new NativeOptions(this.el('settings-modal'), this.game, this.actions, {
      paint: (element,text) => this.nativeText(element,text), close: () => this.closeSettings(),
      tooltips: enabled => { if (enabled !== undefined) { this.tooltipsEnabled=enabled; this.tooltips?.setEnabled(enabled); } return this.tooltipsEnabled; },
      bindingsChanged: () => this.refreshBindingHints(),
    });
    this.tooltips = new Tooltips({
      paint: (element,text) => this.nativeText(element,text),
      allowed: element => !this.loading && (!this.isModalOpen() || !!element.closest('#settings-modal')),
      battlefield: (x,y) => this.actions.getBattlefieldTooltip?.(x,y) ?? null,
    });
    this.refreshBindingHints();
    this.root.addEventListener('click', event => this.handleClick(event));
    this.el('build-grid').addEventListener('scroll', () => this.updateScrollButtons(), { passive: true });
    this.root.addEventListener('contextmenu', event => {
      const command = (event.target as Element).closest<HTMLElement>('[data-command]')?.dataset.command as ControlCommand | undefined;
      if (command) { event.preventDefault(); if (!this.isModalOpen() && (command === 'team1' || command === 'team2')) this.actions.onCommand?.(command, { clear: true }); return; }
      const card = (event.target as Element).closest<HTMLElement>('[data-build]'); if (!card) return;
      event.preventDefault(); const def = this.game.defs[card.dataset.build!];
      const queue = this.game.state.sides[0].queues[def.category], active = queue[0];
      if (!active) return;
      if (active.type !== def.id) {
        const queued = queue.filter(item => item.type === def.id).at(-1);
        if (queued) this.game.cancelBuild(def.category, 0, queued.id);
      } else if (active.paused || active.ready) this.game.cancelBuild(def.category, 0, active.id);
      else this.game.toggleBuildPause(def.category);
      this.update();
    });
    this.el<HTMLSelectElement>('startup-map-select').addEventListener('change', event => {
      const id = (event.target as HTMLSelectElement).value, query = new URLSearchParams(location.search);
      if (id) query.set('map', id); else query.delete('map');
      location.assign(`/${query.size ? '?' + query.toString() : ''}`);
    });
    for (const [formId, inputId] of [['startup-source-form', 'startup-asset-source'], ['settings-source-form', 'asset-source']]) {
      this.el<HTMLFormElement>(formId).addEventListener('submit', event => {
        event.preventDefault(); event.stopPropagation(); this.submitAssetSource(this.el<HTMLInputElement>(inputId));
      });
      this.el<HTMLInputElement>(inputId).addEventListener('keydown', event => {
        if (event.key === 'Enter' && event.repeat) event.preventDefault();
      });
      this.el<HTMLInputElement>(inputId).addEventListener('input', event => {
        const sourceInput = event.target as HTMLInputElement; this.assetSourceEdited = true;
        const otherId = inputId === 'asset-source' ? 'startup-asset-source' : 'asset-source';
        this.el<HTMLInputElement>(otherId).value = sourceInput.value;
        sourceInput.removeAttribute('aria-invalid'); this.el<HTMLInputElement>(otherId).removeAttribute('aria-invalid');
        this.el('startup-source-error').textContent = ''; this.el('asset-error').textContent = this.assetStatus.cacheWarning ?? '';
        this.updateAssetSourceLabels();
      });
    }
    for (const id of ['asset-import', 'startup-asset-import']) this.el<HTMLInputElement>(id).addEventListener('change', event => {
      const input = event.target as HTMLInputElement, files = Array.from(input.files ?? []); input.value = '';
      if (!files.length || this.assetSubmitting) return;
      this.setAssetSubmitting(true); this.actions.onAssetImport(files);
    });
    const minimap = this.el<HTMLCanvasElement>('minimap');
    minimap.addEventListener('pointerdown', event => {
      if (!this.radarOnline || this.isModalOpen()) return;
      event.preventDefault();
      const rect = minimap.getBoundingClientRect(), state = this.game.state;
      const nx = (event.clientX - rect.left) / rect.width, ny = (event.clientY - rect.top) / rect.height;
      this.actions.onRadar?.(Math.max(0, Math.min(state.width - 1, (nx - .5 + ny) * state.width)), Math.max(0, Math.min(state.height - 1, (ny - nx + .5) * state.height)), { button: event.button, shift: event.shiftKey, ctrl: event.ctrlKey, alt: event.altKey });
    });
    minimap.addEventListener('contextmenu', event => event.preventDefault());
    minimap.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); this.centerBase(); } });
    this.keyHandler = event => this.onKey(event); document.addEventListener('keydown', this.keyHandler);
    this.setLoading(true); this.renderCards(); this.renderSelection(); this.update();
  }

  private el<T extends HTMLElement = HTMLElement>(id: string): T { return this.root.querySelector(`#${id}`)!; }
  private refreshBindingHints() {
    const supplied = this.actions.getBindings?.();
    const bindings = supplied?.length ? supplied : BINDING_DEFAULTS.map(row => ({ ...row, key: row.defaultKey }));
    const byId = new Map(bindings.map(row => [row.id as string, row]));
    const hint = (selector: string, id: string, label: string) => {
      const key = byId.get(id)?.key;
      this.root.querySelectorAll<HTMLElement>(selector).forEach(element => { element.dataset.tooltip = `${label}${key ? ` · ${key}` : ''}`; });
    };
    for (const mode of ['repair', 'sell']) hint(`[data-mode="${mode}"]`, mode, `${mode === 'repair' ? 'Repair' : 'Sell'} mode`);
    for (const category of CATEGORIES) hint(`[data-category="${category}"]`, category, CATEGORY_NAMES[category]);
    hint('[data-action="help"]', 'briefing', 'Briefing');
    for (const [command, id, label] of [['type','selectType','Select units of the same type'],['deploy','deploy','Deploy'],['guard','guard','Guard area'],['planning','planning','Planning mode']]) hint(`[data-command="${command}"]`, id, label);
    const help = this.el('binding-help');
    help.innerHTML = bindings.map(row => `<div><span>${escapeHTML(row.label)}</span><kbd>${escapeHTML(row.key ?? 'Unassigned')}</kbd></div>`).join('');
  }
  private selected() { return this.game.state.entities.filter(entity => entity.selected && entity.side === 0); }
  private centerBase() {
    const base = this.game.state.entities.find(entity => entity.side === 0 && /yard|conyard|construction/i.test(`${entity.type} ${this.game.defs[entity.type]?.name}`)) ?? this.game.state.entities.find(entity => entity.side === 0);
    if (base) this.actions.onCenter(base.x, base.y);
  }

  private handleClick(event: MouseEvent) {
    const target = (event.target as Element).closest<HTMLElement>('button, [data-action], [data-mode]');
    if (!target || !this.root.contains(target)) return;
    if (target.dataset.category) { this.selectCategory(target.dataset.category as Category); return; }
    if (target.dataset.command) {
      if (!this.isModalOpen()) this.actions.onCommand?.(target.dataset.command as ControlCommand, { shift: event.shiftKey, ctrl: event.ctrlKey });
      this.update(); return;
    }
    if (target.dataset.mode) {
      const requested = target.dataset.mode as ControlMode;
      const mode = (requested === 'repair' || requested === 'sell') && this.mode === requested ? 'select' : requested;
      this.setMode(mode); this.actions.onMode(mode); return;
    }
    if (target.dataset.superweapon) {
      const mode = target.dataset.superweapon === 'weather' ? 'weather' : 'chrono-source';
      this.actions.onMode(mode); this.setMode(mode); this.closeBuildPanel();
      this.showToast(mode === 'weather' ? 'Choose the lightning storm target.' : 'Choose the vehicles to chronoshift, then their destination.'); return;
    }
    if (target.dataset.build) {
      const type = target.dataset.build; const def = this.game.defs[type];
      const queue = this.game.state.sides[0].queues[def.category];
      const ready = queue.find(item => item.type === type && item.ready);
      if (queue[0]?.type === type && queue[0].paused) { this.game.toggleBuildPause(def.category); this.update(); return; }
      if (ready) { this.actions.onPlace(type); this.showToast(`Place ${def.name} near your base. ${this.mobile ? 'Select cancels.' : 'Escape cancels.'}`); this.closeBuildPanel(); }
      else {
        const available = this.game.canBuild(type);
        if (!available.ok) this.showToast(available.reason);
        else if (!this.game.build(type)) this.showToast('Production unavailable. Check credits and requirements.');
        else this.showToast(`${def.name} added to production.`);
      }
      this.update(); return;
    }
    switch (target.dataset.action) {
      case 'reload': location.reload(); break;
      case 'command-toggle': {
        const collapsed = this.root.querySelector('.statusbar')!.classList.toggle('collapsed');
        target.setAttribute('aria-expanded', String(!collapsed)); break;
      }
      case 'build-up': this.el('build-grid').scrollBy({ top: -100, behavior: 'smooth' }); break;
      case 'build-down': this.el('build-grid').scrollBy({ top: 100, behavior: 'smooth' }); break;
      case 'home': event.preventDefault(); this.centerBase(); break;
      case 'pause': this.game.state.paused = !this.game.state.paused; this.actions.onPause?.(this.game.state.paused); this.update(); break;
      case 'settings': this.openSettings('options'); break;
      case 'help': this.openSettings('briefing'); break;
      case 'close-settings': this.closeSettings(); break;
      case 'zoom-in': this.actions.onZoom(0.15); break;
      case 'zoom-out': this.actions.onZoom(-0.15); break;
      case 'stop': this.game.stop(this.selected().map(entity => entity.id)); this.showToast('Selected units holding position.'); break;
      case 'repair': for (const entity of this.selected()) this.game.repair(entity.id); break;
      case 'sell': for (const entity of this.selected()) this.game.sell(entity.id); this.lastSelection = ''; this.renderSelection(); break;
      case 'build-toggle': {
        const open = !document.documentElement.classList.contains('build-panel-open'); document.documentElement.classList.toggle('build-panel-open', open);
        this.root.querySelector('.mobile-build-button')?.setAttribute('aria-expanded', String(open)); break;
      }
      case 'queue-pause': this.game.toggleBuildPause(this.category); this.update(); break;
      case 'queue-cancel': this.game.cancelBuild(this.category); this.update(); break;
      case 'restart': this.closeSettings(); this.actions.onRestart(); this.lastSelection = ''; this.lastEvent = -1; this.lastWinner = null; this.el('victory-panel').hidden = true; this.showToast('New operation initialized. Good luck, commander.'); this.update(); break;
    }
  }

  private onKey(event: KeyboardEvent) {
    const modal = this.el('settings-modal');
    if (!modal.hidden) {
      event.stopPropagation();
      if (event.key === 'Escape') { event.preventDefault(); this.options.back(); }
      if (event.key === 'Tab') {
        const focusable = [...modal.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]')].filter(el => el.offsetParent !== null);
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      return;
    }
    if (this.loading) {
      event.stopPropagation();
      if (event.key === 'Tab') {
        const focusable = [...this.el('loading-screen').querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')].filter(el => el.offsetParent !== null);
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      return;
    }
  }

  selectCategory(category: Category) {
    if (this.isModalOpen()) return;
    this.category = category; this.renderCards(); this.update();
  }
  openOptions() { if (!this.loading) this.openSettings('options'); }
  openBriefing() { if (!this.loading) this.openSettings('briefing'); }
  isModalOpen() { return this.loading || !this.el('settings-modal').hidden; }

  private closeBuildPanel() { document.documentElement.classList.remove('build-panel-open'); this.root.querySelector('.mobile-build-button')?.setAttribute('aria-expanded', 'false'); }
  private openSettings(screen: OptionsScreen) {
    this.previousFocus = document.activeElement as HTMLElement;
    this.el('settings-modal').hidden = false;
    document.documentElement.classList.add('settings-open');
    this.tooltips.clear(); this.refreshBindingHints(); this.options.show(screen);
  }
  private closeSettings() {
    this.tooltips.clear();
    this.el('settings-modal').hidden = true; document.documentElement.classList.remove('settings-open');
    this.previousFocus?.focus({ preventScroll: true });
  }

  setLoading(loading: boolean) {
    this.tooltips?.clear(); this.loading = loading;
    if (loading && !this.el('settings-modal').hidden) this.closeSettings();
    this.el('loading-screen').classList.remove('runtime-error');
    this.root.querySelector<HTMLButtonElement>('.runtime-reload')!.hidden = true;
    this.el('loading-screen').hidden = !this.loading;
    document.documentElement.classList.toggle('assets-loading', this.loading);
    if (this.loading && this.el('settings-modal').hidden) this.el<HTMLInputElement>('startup-asset-source').focus({ preventScroll: true });
    else if (!this.loading && this.el('loading-screen').contains(document.activeElement)) document.querySelector<HTMLCanvasElement>('#game-canvas')?.focus({ preventScroll: true });
  }

  setAssetSource(source: string) {
    const displayed = assetSourceUrl(source);
    this.el<HTMLInputElement>('startup-asset-source').value = displayed;
    this.el<HTMLInputElement>('asset-source').value = displayed;
    this.assetSourceEdited = false; this.updateAssetSourceLabels();
  }

  private updateAssetSourceLabels() {
    const normalize = (source: string) => {
      try { return assetCacheKey(new URL(source, location.href).href); }
      catch { return source; }
    };
    const saved = !!this.assetStatus.ready && !!this.assetStatus.source && normalize(this.el<HTMLInputElement>('startup-asset-source').value.trim()) === normalize(this.assetStatus.source);
    const readyTitle = this.assetStatus.cacheWarning ? 'Game files are ready for this session' : 'Saved game files are ready';
    const readyHint = this.assetStatus.cacheWarning ? 'Press Enter to continue with the game files already loaded.' : 'Press Enter to continue with your saved game files.';
    this.el('startup-submit-label').textContent = saved ? 'Continue' : 'Load & play';
    this.el('startup-source-hint').textContent = saved ? `${readyTitle}. Press Enter to continue.` : SOURCE_HINT;
    if (this.loading && this.assetStatus.ready && !this.assetSubmitting) {
      this.el('loading-phase').textContent = saved ? readyTitle : 'Ready to load your game files';
      this.el('loading-detail').textContent = saved ? readyHint : 'Press Enter to load the URL above. Saved files for this source are reused when available.';
    }
  }

  private setAssetSubmitting(submitting: boolean) {
    this.assetSubmitting = submitting;
    for (const id of ['startup-asset-source', 'asset-source']) this.el<HTMLInputElement>(id).readOnly = submitting;
    for (const id of ['startup-asset-import', 'asset-import']) this.el<HTMLInputElement>(id).disabled = submitting;
    this.root.querySelectorAll<HTMLButtonElement>('.asset-submit-button').forEach(button => button.disabled = submitting);
    this.root.querySelectorAll<HTMLFormElement>('.source-form').forEach(form => form.setAttribute('aria-busy', String(submitting)));
  }

  private submitAssetSource(input: HTMLInputElement) {
    if (this.assetSubmitting) return;
    const source = input.value.trim();
    try {
      if (!source) throw new Error();
      const url = new URL(source, location.href);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      input.removeAttribute('aria-invalid');
      this.el('startup-source-error').textContent = ''; this.el('asset-error').textContent = this.assetStatus.cacheWarning ?? '';
      this.setAssetSource(url.href); this.setAssetSubmitting(true);
      this.el('loading-phase').textContent = 'Preparing your game files';
      this.el('loading-detail').textContent = 'Your request is starting…';
      this.actions.onAssetRetry(url.href);
    } catch {
      this.setAssetSubmitting(false); input.setAttribute('aria-invalid', 'true');
      const message = 'Enter a valid game archive URL to continue.';
      this.el('startup-source-error').textContent = message; this.el('asset-error').textContent = message;
      input.focus({ preventScroll: true });
    }
  }

  setChrome(name: string, imageURL: string) {
    this.root.style.setProperty(`--chrome-${name}`, `url("${imageURL}")`);
  }

  setFont(font: NativeFont) {
    this.font = font; this.nativeLabels = new WeakMap(); this.options.applyPreferences(); this.refreshBindingHints(); this.update();
  }
  setCursors(cursors: NativeCursors) {
    this.cursors = cursors;
    this.root.style.setProperty('--native-pointer', cursors.css('default'));
    this.root.classList.add('native-cursors'); this.paintCursor();
  }
  setCursor(name: NativeCursorName) {
    if (name !== this.cursorName) { this.cursorName = name; this.cursorStarted = performance.now(); }
    this.paintCursor();
  }
  private paintCursor() {
    if (!this.cursors || this.mobile) return;
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas'); if (!canvas) return;
    const style = this.isModalOpen() ? '' : this.cursors.css(this.cursorName, performance.now() - this.cursorStarted);
    if (style !== this.cursorStyle) { canvas.style.cursor = style; this.cursorStyle = style; }
  }
  private nativeText(element: HTMLElement, text: string, color?: readonly number[]) {
    const signature = `${text}:${color?.join(',') ?? 'yellow'}`;
    if (this.nativeLabels.get(element) === signature) return;
    element.setAttribute('aria-label', text);
    element.classList.toggle('legacy-native-text', !this.font);
    if (!this.font) element.textContent = text;
    else if (!text) element.replaceChildren();
    else {
      let canvas = element.querySelector('canvas');
      if (!canvas) { canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true'); element.replaceChildren(canvas); }
      this.font.draw(canvas, text, color);
    }
    this.nativeLabels.set(element, signature);
  }
  showRuntimeError(message: string) {
    this.closeSettings(); this.setLoading(true);
    this.el('loading-screen').classList.add('runtime-error');
    this.el('loading-phase').textContent = 'Battlefield stopped';
    this.el('loading-detail').textContent = message;
    const reload = this.root.querySelector<HTMLButtonElement>('.runtime-reload')!;
    reload.hidden = false; reload.focus({ preventScroll: true });
  }

  setCameo(type: string, imageURL: string) {
    if (!imageURL.trim()) throw new Error(`Original cameo is missing for ${type}.`);
    this.cameos.set(type, imageURL);
    const img = this.cardElements.get(type)?.querySelector('img');
    if (img) img.src = imageURL;
    else if (this.game.defs[type]?.category === this.category) this.renderCards();
    this.lastSelection = ''; this.renderSelection();
  }
  setZoom(zoom: number) { this.root.dataset.zoom = String(zoom); }
  setMode(mode: ControlMode) { this.mode = mode; this.root.querySelectorAll<HTMLElement>('[data-mode]').forEach(button => { const active = button.dataset.mode === mode; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); }); }
  showToast(text: string) {
    this.el('notifications').textContent = text; this.el('notifications').classList.add('visible'); window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.el('notifications').classList.remove('visible'), 4300);
  }

  setAssetStatus(status: AssetStatus) {
    this.assetStatus = status;
    const waiting = status.phase === 'awaiting-source';
    if (status.ready || status.error || waiting) this.setAssetSubmitting(false);
    const readyTitle = status.cacheWarning ? 'Game files are ready for this session' : 'Saved game files are ready';
    const readyHint = status.cacheWarning ? 'Press Enter to continue with the game files already loaded.' : 'Press Enter to continue with your saved game files.';
    const label = status.error ? 'Could not prepare game files' : status.ready && this.loading ? readyTitle : status.ready ? 'Battle control online' : waiting ? 'Ready when you are' : status.phase === 'download' ? 'Downloading game files' : status.phase === 'cache' ? 'Preparing saved game files' : status.phase === 'extract' ? 'Preparing game files' : status.phase === 'decode' ? 'Preparing battlefield' : 'Loading game files';
    this.el('loading-phase').textContent = label;
    this.el('loading-detail').textContent = status.ready && this.loading ? readyHint : waiting ? status.detail ?? 'Press Enter to start. You can edit the URL or import your own game files.' : status.error ?? status.detail ?? status.phase;
    this.el('startup-source-error').textContent = status.error ?? '';
    this.el('loading-progress').style.width = `${Math.max(0, Math.min(1, status.progress ?? 0)) * 100}%`;
    this.el('loading-progress').classList.toggle('indeterminate', status.progress == null && !status.error && !status.ready && !waiting && this.assetSubmitting);
    const progress = status.ready ? 100 : Math.max(0, Math.min(1, status.progress ?? 0)) * 100;
    this.el('asset-phase').textContent = status.phase.toUpperCase();
    this.el('asset-detail').textContent = status.error ? 'Could not prepare game files. Retry loading or import your files.' : status.detail ?? status.phase;
    this.el('download-progress').style.width = `${progress}%`;
    this.el('download-progress').classList.toggle('indeterminate', status.progress == null && !status.error && !status.ready && !waiting && this.assetSubmitting);
    this.el('asset-error').textContent = [status.error, status.cacheWarning].filter(Boolean).join(' ');
    this.el('loading-note').textContent = status.cacheWarning ?? STORAGE_NOTE;
    if (status.source && !this.assetSourceEdited && document.activeElement !== this.el('asset-source') && document.activeElement !== this.el('startup-asset-source')) this.setAssetSource(status.source);
    this.updateAssetSourceLabels();
  }

  private renderCards() {
    this.root.querySelectorAll<HTMLElement>('[data-category]').forEach(button => { const active = button.dataset.category === this.category; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
    const faction = this.game.state.sides[0]?.faction;
    const defs = Object.values(this.game.defs).filter(def => !def.mapOnly && def.category === this.category && (def.faction === faction || def.faction === 'both') && def.cost > 0 && def.id !== 'conyard' && this.cameos.has(def.id));
    if (faction === 'allied' && this.category === 'structures') defs.sort((a, b) => {
      const rank = (id: string) => { const index = ALLIED_STRUCTURE_ORDER.indexOf(id); return index < 0 ? 999 : index; };
      return rank(a.id) - rank(b.id);
    });
    this.el('category-name').textContent = CATEGORY_NAMES[this.category];
    this.el('build-grid').innerHTML = defs.map(def => `<button class="build-card" data-build="${escapeHTML(def.id)}" data-tooltip="${escapeHTML(def.name)}&#10;$${def.cost}" aria-label="Build ${escapeHTML(def.name)}, ${def.cost} credits"><div class="cameo"><img src="${escapeHTML(this.cameos.get(def.id)!)}" alt="${escapeHTML(def.name)}" draggable="false"/><span class="card-corner"></span><span class="card-queue"></span><span class="card-state"></span><span class="card-progress"></span></div><span class="card-requirement"></span></button>`).join('');
    if (this.category === 'defenses') this.el('build-grid').insertAdjacentHTML('beforeend', ['chronosphere', 'weather_control'].map(id => {
      const def = this.game.defs[id]; if (!def || !this.cameos.has(id)) return '';
      return `<button class="build-card superweapon-card" data-superweapon="${def.superweapon}" hidden disabled aria-label="${id === 'chronosphere' ? 'Activate Chronosphere' : 'Activate Lightning Storm'}"><div class="cameo"><img src="${this.cameos.get(id)}" alt=""/><span class="card-state"></span></div><span class="card-requirement"></span></button>`;
    }).join(''));
    this.cardElements.clear(); this.el('build-grid').querySelectorAll<HTMLElement>('[data-build]').forEach(card => this.cardElements.set(card.dataset.build!, card));
    this.updateCardVisibility();
    this.updateScrollButtons();
  }

  private updateCardVisibility(owned = this.game.state.entities.filter(entity => entity.side === 0 && entity.hp > 0 && !entity.selling && !entity.constructing && entity.transportId === undefined)) {
    const ownedTypes = new Set(owned.map(entity => entity.type)), side = this.game.state.sides[0];
    let visible = 0;
    for (const [type, card] of this.cardElements) {
      const def = this.game.defs[type], building = def.category === 'structures' || def.category === 'defenses';
      const queued = side.queues[def.category].some(item => item.type === type);
      // Capacity and funds do not lock technology. Keep paid/queued work accessible
      // when a prerequisite is lost, including buildings ready for placement.
      const unlocked = def.requires.every(required => ownedTypes.has(required))
        && owned.some(entity => def.factory ? entity.type === def.factory : this.game.defs[entity.type].producer?.includes(def.category));
      card.hidden = building && !unlocked && !queued;
      if (!card.hidden) visible++;
    }
    this.el('category-count').textContent = `${String(visible).padStart(2, '0')} AVAILABLE`;
  }

  private updateScrollButtons() {
    const grid = this.el('build-grid');
    this.root.querySelector<HTMLButtonElement>('[data-action="build-up"]')!.disabled = grid.scrollTop <= .5;
    this.root.querySelector<HTMLButtonElement>('[data-action="build-down"]')!.disabled = grid.scrollTop >= grid.scrollHeight - grid.clientHeight - .5;
  }

  private renderSelection() {
    const selected = this.selected(), inspection = selected.length === 1 && (selected[0].type === 'george' || selected[0].inspectedBy !== undefined || (selected[0].rank ?? 0) > 0);
    const panel = this.el('selection-panel');
    panel.classList.toggle('inspection-selection', inspection);
    if (!this.mobile && !inspection) { panel.hidden = true; return; }
    panel.hidden = !selected.length;
    const signature = selected.map(entity => `${entity.id}:${entity.type}`).join(',') + `:${inspection}`;
    if (signature === this.lastSelection && this.el('selection-panel').childElementCount) return;
    this.lastSelection = signature;
    this.el('selection-panel').hidden = !selected.length;
    if (!selected.length) {
      this.el('selection-panel').innerHTML = `<div class="briefing-icon">${icon('star')}</div><div class="briefing-copy"><span class="eyebrow">COMMANDER'S BRIEFING</span><h3>Expand your foothold.</h3><p>Keep your miners working. Build a strike force.<br/>The battlefield is yours to command.</p></div><button class="briefing-help" data-action="help" aria-label="Read the field manual">${icon('help')}</button>`; return;
    }
    const def = this.game.defs[selected[0].type], cameo = this.cameos.get(def.id);
    if (!cameo) { this.el('selection-panel').hidden = true; this.el('selection-panel').replaceChildren(); return; }
    const building = selected.length === 1 && (def.category === 'structures' || def.category === 'defenses');
    this.el('selection-panel').innerHTML = `<img class="selection-cameo" src="${escapeHTML(cameo)}" alt=""/><div class="selection-copy"><span class="eyebrow">${selected.length > 1 ? `${selected.length} UNITS SELECTED` : `${CATEGORY_NAMES[def.category]} / FRIENDLY`}</span><h3>${escapeHTML(selected.length > 1 ? 'Strike group' : def.name)}</h3><div class="selection-health"><i id="selection-health-fill"></i></div><span class="selection-status" id="selection-status"></span></div><div class="selection-actions">${building ? `<button data-action="repair" data-tooltip="Repair selected building" aria-label="Repair selected building">${icon('wrench')}</button><button data-action="sell" data-tooltip="Sell selected building" aria-label="Sell selected building">${icon('sell')}</button>` : `<button data-action="stop" data-tooltip="Stop selected units" aria-label="Stop selected units">${icon('stop')}</button><button data-mode="attack" data-tooltip="Attack-move mode" aria-label="Attack move mode">${icon('target')}</button>`}</div>`;
    if (selected.length === 1 && selected[0].type === 'george') panel.querySelector('[data-mode="attack"]')?.remove();
    if (inspection) {
      panel.querySelector('.selection-copy')!.insertAdjacentHTML('beforeend', '<progress class="inspection-progress" id="inspection-progress" max="1" value="0" aria-label="Continuous inspection progress"></progress><small class="inspection-help">3 cells · 10 continuous seconds · moving or leaving resets</small>');
      panel.dataset.tooltip = INSPECTION_HELP;
    } else delete panel.dataset.tooltip;
  }

  private drawMinimap() {
    const canvas = this.el<HTMLCanvasElement>('minimap'), c = canvas.getContext('2d')!;
    const state = this.game.state;
    const point = (x: number, y: number) => ({ x: ((x / state.width - y / state.height) / 2 + .5) * canvas.width, y: (x / state.width + y / state.height) / 2 * canvas.height });
    c.fillStyle = '#000'; c.fillRect(0, 0, canvas.width, canvas.height);
    const colors = { grass: '#747b37', water: '#294987', rock: '#455830', road: '#a6a18b', sand: '#a99c63' };
    for (let y = 0; y < state.height; y++) for (let x = 0; x < state.width; x++) {
      const index = y * state.width + x, tile = state.tiles[index];
      if (!tile || !state.explored[index]) continue;
      const p = point(x, y);
      c.globalAlpha = 1; c.fillStyle = tile.ore > 0 ? '#dfbd3c' : colors[tile.terrain]; c.fillRect(p.x, p.y, canvas.width / state.width + .5, canvas.height / state.height + .5);
    }
    c.globalAlpha = 1;
    for (const entity of state.entities) {
      if (!revealedEntity(state, this.game.defs, entity)) continue;
      const def = this.game.defs[entity.type]; if (!def) continue;
      const p = point(entity.x + def.footprint[0] / 2, entity.y + def.footprint[1] / 2);
      c.fillStyle = state.sides[entity.side]?.color ?? '#fff';
      c.fillRect(p.x - 1, p.y - 1, Math.max(2, def.footprint[0]), Math.max(2, def.footprint[1]));
    }
    const corners = this.actions.getCameraView?.();
    if (corners?.length) {
      c.strokeStyle = '#fff'; c.lineWidth = 1; c.beginPath();
      corners.forEach((corner, index) => { const p = point(corner.x, corner.y); if (index) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); });
      c.closePath(); c.stroke();
    }
  }

  private renderQueue() {
    const queue = this.game.state.sides[0].queues[this.category], active = queue[0];
    const panel = this.el('queue-panel');
    if (!this.mobile) { if (panel.childElementCount) panel.replaceChildren(); return; }
    if (!active) {
      if (!panel.querySelector('.queue-idle')) panel.innerHTML = '<div class="queue-idle"><span class="status-dot"></span> CONSTRUCTION QUEUE IDLE</div>';
      panel.classList.remove('has-production'); return;
    }
    panel.classList.add('has-production');
    // Keep controls mounted across progress, pause, ready, and queue changes.
    // Replacing the panel every update can detach a button between pointerdown
    // and pointerup, losing native clicks and keyboard focus.
    if (!panel.querySelector('.active-queue')) {
      panel.innerHTML = `<div class="active-queue"><div><span class="eyebrow"></span><strong></strong></div><div class="queue-buttons"><button data-action="queue-pause"></button><button data-action="queue-cancel" aria-label="Cancel last queued item and refund" data-tooltip="Cancel last item & refund">${icon('close')}</button></div></div><div class="queue-track"><i></i></div><span class="queue-total"></span>`;
    }
    panel.querySelector<HTMLElement>('.eyebrow')!.textContent = active.ready ? 'AWAITING DEPLOYMENT' : active.paused || active.blockedFunds || active.blockedPrerequisite ? 'PRODUCTION ON HOLD' : 'PRODUCTION IN PROGRESS';
    panel.querySelector<HTMLElement>('.active-queue strong')!.textContent = this.game.defs[active.type]?.name ?? active.type;
    const pauseButton = panel.querySelector<HTMLButtonElement>('[data-action="queue-pause"]')!;
    pauseButton.hidden = active.ready;
    pauseButton.setAttribute('aria-label', `${active.paused ? 'Resume' : 'Pause'} current production`);
    pauseButton.dataset.tooltip = `${active.paused ? 'Resume' : 'Pause'} production`;
    if (pauseButton.dataset.paused !== String(active.paused)) {
      pauseButton.innerHTML = icon(active.paused ? 'play' : 'pause');
      pauseButton.dataset.paused = String(active.paused);
    }
    panel.querySelector<HTMLElement>('.queue-track i')!.style.width = `${Math.max(0, Math.min(1, active.progress)) * 100}%`;
    panel.querySelector<HTMLElement>('.queue-total')!.textContent = active.blockedPrerequisite ?? (queue.length > 1 ? `${queue.length - 1} more in queue` : active.ready ? 'Click the highlighted card to place' : 'Production is automatic');
  }

  update() {
    const state = this.game.state, side = state.sides[0]; if (!side) return;
    const credits = visibleCredits(side.money);
    this.nativeText(this.el('credits-value'), String(credits), [184, 208, 232]);
    this.el('credits-value').setAttribute('aria-label', `${credits} credits`);
    this.el('power-value').innerHTML = `${side.power} <i>/ ${side.powerUsed}</i>`;
    this.el('power-resource').classList.toggle('low-power', side.power < side.powerUsed);
    const powerScale = Math.max(500, side.power, side.powerUsed) * 1.15;
    this.el('power-fill').style.height = `${side.power / powerScale * 100}%`;
    this.el('power-demand').style.bottom = `${side.powerUsed / powerScale * 100}%`;
    this.el('power-resource').dataset.tooltip = `Power: ${side.power} generated / ${side.powerUsed} used`;
    const radarOnline = side.power >= side.powerUsed && state.entities.some(entity => entity.side === 0 && entity.hp > 0 && !entity.constructing && !entity.selling && /^radar/.test(entity.type));
    this.radarOnline = radarOnline; this.el('radar-frame').classList.toggle('online', radarOnline);
    this.el('minimap').setAttribute('aria-label', radarOnline ? 'Tactical radar. Click to order selected units; with no selection, center the camera.' : 'Radar offline. Build an Airforce Command to activate.');

    this.el('pause-banner').hidden = this.loading || !state.paused || state.winner !== null;

    this.options?.update();

    const friendly = state.entities.filter(entity => entity.side === 0 && entity.hp > 0 && !entity.selling && !entity.constructing && entity.transportId === undefined);
    this.updateCardVisibility(friendly);
    let totalQueue = 0, hasReady = false;
    for (const category of CATEGORIES) {
      const queue = side.queues[category], ready = queue.some(item => item.ready); totalQueue += queue.length; hasReady ||= ready;
      const tab = this.root.querySelector(`[data-category="${category}"]`)!;
      tab.classList.toggle('category-ready', ready);
      tab.classList.toggle('category-unavailable', !friendly.some(entity => this.game.defs[entity.type]?.producer?.includes(category)));
    }
    const planning = !!this.actions.getPlanning?.(), planningButton = this.root.querySelector('[data-command="planning"]')!;
    planningButton.classList.toggle('active', planning); planningButton.setAttribute('aria-pressed', String(planning));
    this.el('production-counter').textContent = String(totalQueue).padStart(2, '0'); this.el('mobile-ready-dot').classList.toggle('visible', hasReady);
    for (const [type, card] of this.cardElements) {
      const def = this.game.defs[type], available = this.game.canBuild(type), queue = side.queues[def.category];
      const matching = queue.filter(item => item.type === type), ready = matching.some(item => item.ready), active = queue[0]?.type === type ? queue[0] : null;
      card.classList.toggle('unavailable', !available.ok && !ready); card.classList.toggle('producing', !!active && !ready); card.classList.toggle('ready', ready);
      card.setAttribute('aria-disabled', String(!available.ok && !ready));
      card.dataset.tooltip = `${def.name}\n$${formatMoney(def.cost)}${!available.ok ? `\n${available.reason}` : ''}`;
      this.nativeText(card.querySelector<HTMLElement>('.card-queue')!, matching.length > 1 ? String(matching.length) : '');
      this.nativeText(card.querySelector<HTMLElement>('.card-state')!, ready ? 'Ready' : active?.paused || active?.blockedFunds || active?.blockedPrerequisite ? 'On Hold' : '');
      card.querySelector<HTMLElement>('.card-progress')!.style.width = active ? `${active.progress * 100}%` : '0';
      card.style.setProperty('--build-progress', `${(active?.progress ?? 0) * 360}deg`);
      const reason = card.querySelector<HTMLElement>('.card-requirement')!;
      reason.textContent = active?.blockedPrerequisite ?? (!available.ok && !ready && !active ? available.reason : '');
    }

    for (const card of this.root.querySelectorAll<HTMLButtonElement>('[data-superweapon]')) {
      const building = state.entities.find(e => e.side === 0 && e.hp > 0 && !e.selling && !e.constructing && this.game.defs[e.type].superweapon === card.dataset.superweapon);
      card.hidden = !building;
      if (!building) continue;
      const def = this.game.defs[building.type], remaining = Math.max(0, Math.ceil(def.recharge! - (building.recharge ?? 0)));
      card.disabled = remaining > 0 || side.power < side.powerUsed;
      const label = side.power < side.powerUsed ? 'Low Power' : remaining ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : 'Ready';
      this.nativeText(card.querySelector<HTMLElement>('.card-state')!, label);
      card.dataset.tooltip = `${def.superweapon === 'weather' ? 'Lightning Storm' : 'Chronoshift'} · ${label}`;
      card.classList.toggle('ready', !card.disabled);
    }
    this.updateScrollButtons();
    this.paintCursor();
    this.renderQueue();
    this.renderSelection();
    const selected = this.selected();
    if (selected.length) {
      const totalHealth = selected.reduce((sum, entity) => sum + entity.hp, 0), maxHealth = selected.reduce((sum, entity) => sum + entity.maxHp, 0);
      const health = this.el('selection-health-fill'); if (health) { health.style.width = `${totalHealth / Math.max(1, maxHealth) * 100}%`; health.classList.toggle('damaged', totalHealth < maxHealth * 0.4); }
      const status = this.el('selection-status');
      if (status) status.textContent = selected.length === 1 ? `${Math.ceil(selected[0].hp)} / ${selected[0].maxHp} HP · ${selected[0].type === 'george' || selected[0].inspectedBy !== undefined || (selected[0].rank ?? 0) > 0 ? inspectionStatus(selected[0], state, this.game.defs) : selected[0].cargo > 0 ? `${Math.floor(selected[0].cargo)} ORE` : selected[0].order.toUpperCase()}` : `${Math.ceil(totalHealth)} HP · ${selected.length} UNITS`;
      const progress = this.root.querySelector<HTMLProgressElement>('#inspection-progress');
      if (progress) progress.value = selected[0].type === 'george' ? (selected[0].inspection?.elapsed ?? 0) / 10 : selected[0].inspectionProgress ?? 0;
    }
    const event = state.events.at(-1); if (event && event.id !== this.lastEvent) { this.lastEvent = event.id; this.showToast(event.text); }
    if (this.radarOnline && performance.now() - this.lastMinimap > 350) { this.drawMinimap(); this.lastMinimap = performance.now(); }
    if (state.winner !== null && state.winner !== this.lastWinner) {
      this.lastWinner = state.winner; const won = state.winner === 0;
      this.el('victory-panel').hidden = false; this.el('victory-panel').innerHTML = `<div class="victory-emblem">${icon('star')}</div><span class="eyebrow">OPERATION IRON HORIZON</span><h2>${won ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}</h2><p>${won ? 'The enemy command has fallen. The battlefield is yours.' : 'Our foothold has been lost. Regroup and return to the field.'}</p><div class="result-stats"><span><b>${side.kills}</b> ENEMY LOSSES</span><span><b>${String(Math.floor(state.time / 60)).padStart(2, '0')}:${String(Math.floor(state.time % 60)).padStart(2, '0')}</b> ELAPSED TIME</span></div><button class="primary-button" data-action="restart">NEW OPERATION ${icon('target')}</button>`;
    }
    if (state.winner === null && this.lastWinner !== null) { this.lastWinner = null; this.el('victory-panel').hidden = true; }
  }

  getBattlefieldRect(): DOMRect { return document.querySelector('#battlefield')!.getBoundingClientRect(); }
  destroy() { this.tooltips.destroy(); document.removeEventListener('keydown', this.keyHandler); window.clearTimeout(this.toastTimer); this.root.remove(); }
}
