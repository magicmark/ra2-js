import { isBuilding } from '../game/definitions';
import type { Category, Entity, GameAPI, Vec2 } from '../game/types';
import type { NativeCursorName } from '../assets/NativeCursor';
import type { Renderer } from '../render/Renderer';
import { BINDING_DEFAULTS, type BindingId, type BindingInfo, type BindingResult } from './bindings';
export { GAME_SPEED_STEPS, SCROLL_RATE_STEPS, type BindingId, type BindingInfo, type BindingResult } from './bindings';

export type ControlMode = 'select' | 'pan' | 'attack' | 'repair' | 'sell' | 'chrono-source' | 'chrono-destination' | 'weather';
export type ControlCommand = 'team1' | 'team2' | 'type' | 'deploy' | 'guard' | 'planning';
export interface ControlCallbacks {
  toast(text: string): void; zoom(value: number): void; mode(value: ControlMode): void; ack(): void;
  category?(category: Category): void; options?(): void; briefing?(): void; enabled?(): boolean; cursor?(name: NativeCursorName): void;
}
export const detectMobile = () => new URLSearchParams(location.search).get('force_mobile') === '1' || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && matchMedia('(pointer: coarse)').matches);

/** Retail RA2 mouse/keyboard commands; touch adds explicit pan/attack buttons. */
export class Controls {
  mode: ControlMode = 'select';
  private chronoSource?: Vec2;
  private keys = new Set<string>();
  private pointers = new Map<number, Vec2>();
  private start: Vec2 | null = null;
  private last: Vec2 | null = null;
  private moved = false;
  private button = 0;
  private pinchDistance = 0;
  private pinchCenter: Vec2 | null = null;
  private multiTouch = false;
  private groups = new Map<string, number[]>();
  private bookmarks = new Map<string, Vec2>();
  private lastClick = { id: -1, time: -Infinity };
  private lastTypeTime = -Infinity;
  private lastGroup = { key: '', time: -Infinity };
  private followId: number | null = null;
  private hover: Vec2 | null = null;
  private modifiers = { ctrl: false, shift: false, alt: false };
  private lastCursor: NativeCursorName | null = null;
  private lastCameraZoom: number | null = null;
  private healthBand = 0;
  private selectionHistory: number[][] = [];
  private waypointOrders = new Map<number, Vec2[]>();
  private planningMode = false;
  private scrollMultiplier = 1;
  private bindings = new Map<BindingId, string>(BINDING_DEFAULTS.map(binding => [binding.id, binding.defaultKey.toLowerCase()]));
  private state: GameAPI['state'];

  constructor(readonly renderer: Renderer, readonly game: GameAPI, readonly mobile: boolean, readonly callbacks: ControlCallbacks) {
    this.state = game.state;
    this.loadBindings();
    const canvas = renderer.canvas;
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('pointerdown', e => this.down(e));
    canvas.addEventListener('pointermove', e => this.move(e));
    canvas.addEventListener('pointerup', e => this.up(e));
    canvas.addEventListener('pointerleave', () => { this.hover = null; this.updateCursor(); });
    canvas.addEventListener('pointercancel', () => this.cancelGesture());
    canvas.addEventListener('wheel', e => {
      if (!this.enabled()) return;
      e.preventDefault(); this.followId = null;
      this.renderer.camera.setZoom(this.renderer.camera.zoom * Math.exp(-e.deltaY * .0015), this.local(e));
      this.callbacks.zoom(this.renderer.camera.zoom);
    }, { passive: false });
    window.addEventListener('keydown', e => this.key(e));
    window.addEventListener('keyup', e => {
      const key = e.key.toLowerCase(); this.keys.delete(key); this.trackModifiers(e); this.updateCursor();
      if (key === this.bindings.get('planning') && !this.planningMode) this.commitWaypoints();
    });
    window.addEventListener('blur', () => { this.keys.clear(); this.waypointOrders.clear(); this.cancelGesture(); this.hover = null; this.modifiers = { ctrl: false, shift: false, alt: false }; this.updateCursor(); });
  }

  private enabled(): boolean {
    return this.callbacks.enabled?.() !== false && !document.documentElement.classList.contains('settings-open') && !document.body.classList.contains('settings-open');
  }
  private local(e: PointerEvent | WheelEvent): Vec2 { const r = this.renderer.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  private ownUnits(): Entity[] { return this.game.state.entities.filter(e => e.side === 0 && e.hp > 0 && e.transportId === undefined && !isBuilding(this.game.defs[e.type])); }
  private ids(): number[] { return this.game.state.entities.filter(e => e.selected && e.side === 0).map(e => e.id); }
  private engineerRepair(target: Entity | null | undefined): boolean {
    return !!target && !target.selling && target.side === 0 && target.hp < target.maxHp && isBuilding(this.game.defs[target.type])
      && this.game.state.entities.some(entity => entity.selected && entity.side === 0 && entity.hp > 0 && entity.type === 'engineer');
  }
  private select(ids: number[], additive = false): void {
    const previous = this.ids();
    this.game.select(ids, additive);
    if (previous.length && previous.join(',') !== this.ids().join(',')) this.selectionHistory.push(previous);
    if (this.selectionHistory.length > 64) this.selectionHistory.shift();
    this.followId = null;
  }
  private cancelGesture(): void {
    this.pointers.clear(); this.start = null; this.last = null; this.multiTouch = false;
    this.pinchCenter = null; this.renderer.selectionBox = null;
  }
  get scrollRate(): number { return this.scrollMultiplier; }
  setScrollRate(multiplier: number): void {
    if (Number.isFinite(multiplier)) this.scrollMultiplier = Math.max(.25, Math.min(3, multiplier));
  }
  getBindings(): BindingInfo[] {
    return BINDING_DEFAULTS.map(binding => ({ ...binding, key: this.bindings.get(binding.id)?.toUpperCase() ?? null }));
  }
  inspectBinding(id: string, value: string): BindingResult {
    if (!BINDING_DEFAULTS.some(binding => binding.id === id)) return { ok: false, reason: 'Unknown command.' };
    const key = value.trim().toLowerCase();
    if (!/^[a-z?]$/.test(key)) return { ok: false, reason: 'Choose a letter A–Z or ?. Team, bookmark, navigation, and browser keys stay reserved.' };
    const conflict = BINDING_DEFAULTS.find(binding => binding.id !== id && this.bindings.get(binding.id) === key);
    return { ok: true, ...(conflict ? { conflict: { id: conflict.id, label: conflict.label } } : {}) };
  }
  assignBinding(id: string, value: string): BindingResult {
    const result = this.inspectBinding(id, value);
    if (!result.ok) return result;
    if (result.conflict) this.bindings.delete(result.conflict.id);
    this.bindings.set(id as BindingId, value.trim().toLowerCase());
    this.keys.clear(); this.waypointOrders.clear();
    this.saveBindings();
    return { ...result, ...(result.conflict ? { replaced: result.conflict.id } : {}) };
  }
  resetBindings(): void {
    this.bindings = new Map(BINDING_DEFAULTS.map(binding => [binding.id, binding.defaultKey.toLowerCase()]));
    this.keys.clear(); this.waypointOrders.clear();
    this.saveBindings();
  }
  private loadBindings(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const saved = JSON.parse(localStorage.getItem('ra2-keyboard-bindings:v1') ?? 'null');
      if (saved?.version !== 1 || !saved.bindings || typeof saved.bindings !== 'object') return;
      const restored = new Map<BindingId, string>(), seen = new Set<string>();
      for (const binding of BINDING_DEFAULTS) {
        const value: unknown = saved.bindings[binding.id];
        if (value === null) continue;
        if (typeof value !== 'string' || !/^[a-z?]$/.test(value) || seen.has(value)) return;
        restored.set(binding.id, value); seen.add(value);
      }
      this.bindings = restored;
    } catch { /* Browser storage may be disabled; native defaults remain usable. */ }
  }
  private saveBindings(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem('ra2-keyboard-bindings:v1', JSON.stringify({ version: 1,
        bindings: Object.fromEntries(BINDING_DEFAULTS.map(binding => [binding.id, this.bindings.get(binding.id) ?? null])) }));
    } catch { /* Binding changes remain active for this session without storage. */ }
  }
  get cursor(): NativeCursorName {
    if (!this.enabled() || this.mobile || !this.hover) return 'default';
    const { camera } = this.renderer, p = this.hover;
    if (!this.pointers.size) {
      const horizontal = p.x < 12 ? 'w' : p.x > camera.width - 12 ? 'e' : '';
      const vertical = p.y < 12 ? 'n' : p.y > camera.height - 12 ? 's' : '';
      if (horizontal || vertical) {
        const direction = `${vertical}${horizontal}`;
        const state = this.game.state;
        const wanted = camera.constrainedPosition(state.width, state.height,
          camera.x + (horizontal === 'w' ? -1 : horizontal === 'e' ? 1 : 0) / camera.zoom,
          camera.y + (vertical === 'n' ? -1 : vertical === 's' ? 1 : 0) / camera.zoom, state.nativeMap);
        const blocked = Math.hypot(wanted.x - camera.x, wanted.y - camera.y) < 1e-6;
        return `scroll-${direction}${blocked ? '-blocked' : ''}` as NativeCursorName;
      }
    }
    if (this.mode === 'pan' || this.pointers.size && (this.button === 1 || this.button === 2)) return 'pan';
    if (['chrono-source', 'chrono-destination', 'weather'].includes(this.mode)) return 'attack';
    const target = this.renderer.pick(p.x, p.y), own = target?.side === 0;
    if (this.mode === 'repair') return target && this.game.canRepair(target.id) ? 'repair' : 'repair-blocked';
    if (this.mode === 'sell') return own && target && isBuilding(this.game.defs[target.type]) ? 'sell' : 'sell-blocked';
    const point = camera.world(p.x, p.y), x = Math.floor(point.x), y = Math.floor(point.y), state = this.game.state;
    const inside = x >= 0 && y >= 0 && x < state.width && y < state.height;
    const tile = inside ? state.tiles[y * state.width + x] : undefined;
    const selected = state.entities.filter(entity => entity.selected && entity.side === 0 && entity.hp > 0 && entity.transportId === undefined);
    const movers = selected.map(e => this.game.defs[e.type]).filter(def => !isBuilding(def));
    const airborne = movers.some(def => def.movement === 'air');
    const terrainAllowed = !!tile && (movers.length ? movers.some(def => def.movement === 'air' || (def.movement === 'water' ? tile.terrain === 'water' : tile.terrain !== 'rock' && (def.movement === 'amphibious' || tile.terrain !== 'water'))) : tile.terrain !== 'water' && tile.terrain !== 'rock');
    const clear = terrainAllowed && (airborne || !state.entities.some(entity => {
      const def = this.game.defs[entity.type];
      return entity.hp > 0 && isBuilding(def) && x >= entity.x && x < entity.x + def.footprint[0] && y >= entity.y && y < entity.y + def.footprint[1];
    }));
    if (this.renderer.placement) return this.game.canPlace(this.renderer.placement, x, y) ? 'deploy' : 'deploy-blocked';
    const mobile = selected.some(entity => !isBuilding(this.game.defs[entity.type]));
    const armed = selected.some(entity => this.game.defs[entity.type].damage > 0);
    const { ctrl, shift, alt } = this.modifiers;
    if (mobile && ctrl && alt) return 'guard';
    if (mobile && ctrl && shift || this.mode === 'attack') return clear ? 'attackmove' : 'attackmove-blocked';
    if (armed && ctrl) return 'attack';
    if (mobile && alt) return clear ? 'move' : 'move-blocked';
    if (this.engineerRepair(target)) return 'repair';
    if (target && !own && isBuilding(this.game.defs[target.type]) && selected.some(entity => entity.type === 'engineer' || this.game.defs[entity.type].ability === 'spy')) return 'enter';
    if (target && own && this.game.defs[target.type].passengers && selected.some(e => e.id !== target.id)) return 'enter';
    if (target && own) return target.selected && this.game.defs[target.type].deployedRange !== undefined ? 'deploy' : 'select';
    if (target && selected.length && !own && armed) return 'attack';
    return mobile ? clear ? 'move' : 'move-blocked' : 'default';
  }
  private updateCursor(): void {
    const cursor = this.cursor;
    if (cursor !== this.lastCursor) { this.lastCursor = cursor; this.callbacks.cursor?.(cursor); }
  }
  private trackModifiers(e: PointerEvent | KeyboardEvent): void {
    this.modifiers = { ctrl: e.ctrlKey || ('metaKey' in e && e.metaKey), shift: e.shiftKey, alt: e.altKey };
  }
  setMode(mode: ControlMode): void {
    if (mode !== 'pan') this.cancelPlacement();
    if (mode !== 'chrono-destination') this.chronoSource = undefined;
    this.mode = mode; this.callbacks.mode(mode);
    if (!this.callbacks.cursor) this.renderer.canvas.style.cursor = mode === 'pan' ? 'grab' : mode === 'attack' || mode === 'repair' || mode === 'sell' ? 'crosshair' : 'default';
    this.updateCursor();
  }
  setPlacement(type: string): void {
    this.setMode('select'); this.renderer.placement = type;
    this.callbacks.toast(`Place ${this.game.defs[type].name} near your base. Green tiles are valid.`);
    if (!this.callbacks.cursor) this.renderer.canvas.style.cursor = 'crosshair'; this.updateCursor();
  }
  cancelPlacement(): void { this.renderer.placement = null; if (!this.callbacks.cursor) this.renderer.canvas.style.cursor = 'default'; this.updateCursor(); }

  radarOrder(x: number, y: number, modifiers: { button?: number; shift?: boolean; ctrl?: boolean; alt?: boolean } = {}): void {
    if (!this.enabled() || !Number.isFinite(x) || !Number.isFinite(y)) return;
    if (modifiers.button === 2) {
      if (this.renderer.placement || this.mode !== 'select') this.setMode('select');
      else this.select([]);
      return;
    }
    if (this.superweaponClick({ x, y })) return;
    this.followId = null;
    const ids = this.ids(), s = this.game.state;
    if (!ids.length || ['pan', 'repair', 'sell'].includes(this.mode) || this.renderer.placement) { this.renderer.camera.center(x, y); return; }
    const target = s.entities.find(entity => {
      if (entity.hp <= 0) return false;
      const def = this.game.defs[entity.type];
      return isBuilding(def) ? x >= entity.x && x < entity.x + def.footprint[0] && y >= entity.y && y < entity.y + def.footprint[1] : Math.hypot(x - entity.x, y - entity.y) < .6;
    });
    if (target?.side === 0 && !modifiers.ctrl && !modifiers.alt && this.game.enterTransport?.(ids, target.id)) return;
    if (modifiers.ctrl && modifiers.alt) this.game.orderGuard(ids, x, y, target?.side === 0 ? target.id : undefined);
    else if (modifiers.ctrl && modifiers.shift) this.game.orderMove(ids, x, y, true);
    else if (modifiers.ctrl) { if (target) this.game.orderAttack(ids, target.id, true); else this.game.orderForceFire(ids, x, y); }
    else if (modifiers.alt) this.game.orderForceMove(ids, x, y);
    else if (this.planning) { this.queueWaypoint(ids, { x, y }); return; }
    else if (target && (target.side !== 0 || this.engineerRepair(target))) this.game.orderAttack(ids, target.id);
    else if (x >= 0 && y >= 0 && x < s.width && y < s.height && s.tiles[Math.floor(y) * s.width + Math.floor(x)].ore > 0 && s.entities.some(entity => ids.includes(entity.id) && this.game.defs[entity.type].harvester)) this.game.orderHarvest(ids, x, y);
    else this.game.orderMove(ids, x, y, this.mode === 'attack');
    this.callbacks.ack(); if (this.mode === 'attack') this.setMode('select');
  }

  private down(e: PointerEvent): void {
    if (e.target !== this.renderer.canvas || !this.enabled()) return;
    e.preventDefault(); this.renderer.canvas.focus({ preventScroll: true }); this.renderer.canvas.setPointerCapture(e.pointerId);
    this.trackModifiers(e);
    const p = this.local(e); this.hover = e.pointerType === 'touch' ? null : p; this.pointers.set(e.pointerId, p); this.renderer.pointer = p;
    this.followId = null;
    if (this.pointers.size === 2) {
      this.multiTouch = true; this.renderer.selectionBox = null;
      const [a, b] = [...this.pointers.values()];
      this.pinchDistance = Math.hypot(a.x - b.x, a.y - b.y); this.pinchCenter = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; return;
    }
    this.start = p; this.last = p; this.moved = false; this.button = e.button;
  }
  private move(e: PointerEvent): void {
    if (!this.enabled()) return;
    const p = this.local(e); this.renderer.pointer = p; this.renderer.hoverId = this.renderer.pick(p.x, p.y)?.id ?? null;
    this.hover = e.pointerType === 'touch' ? null : p; this.trackModifiers(e); this.updateCursor();
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, p);
    if (this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y), center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (this.pinchDistance > 0) this.renderer.camera.setZoom(this.renderer.camera.zoom * d / this.pinchDistance, this.pinchCenter ?? center);
      if (this.pinchCenter) this.renderer.camera.pan(center.x - this.pinchCenter.x, center.y - this.pinchCenter.y);
      this.pinchDistance = d; this.pinchCenter = center; this.callbacks.zoom(this.renderer.camera.zoom); return;
    }
    if (!this.start || !this.last || this.multiTouch) return;
    if (Math.hypot(p.x - this.start.x, p.y - this.start.y) > 5) this.moved = true;
    if (this.moved) {
      if (this.mode === 'pan' || this.button === 1 || this.button === 2) this.renderer.camera.pan(p.x - this.last.x, p.y - this.last.y);
      else if (!this.renderer.placement && this.mode === 'select') this.renderer.selectionBox = { from: this.start, to: p };
    }
    this.last = p;
  }
  private up(e: PointerEvent): void {
    this.trackModifiers(e);
    const p = this.local(e); this.pointers.delete(e.pointerId);
    if (!this.enabled()) { this.cancelGesture(); return; }
    if (this.multiTouch) {
      if (!this.pointers.size) this.cancelGesture();
      return;
    }
    if (!this.start) return;
    if (this.renderer.selectionBox) {
      const { from, to } = this.renderer.selectionBox, minX = Math.min(from.x, to.x), maxX = Math.max(from.x, to.x), minY = Math.min(from.y, to.y), maxY = Math.max(from.y, to.y);
      const ids = this.ownUnits().filter(entity => { const q = this.renderer.entityPoint(entity); return q.x >= minX && q.x <= maxX && q.y >= minY && q.y <= maxY; }).map(e => e.id);
      this.select(ids, e.shiftKey); if (ids.length) this.callbacks.ack();
    } else if (!this.moved && e.button !== 1) this.click(p, e);
    this.renderer.selectionBox = null; this.start = null; this.last = null; this.updateCursor();
  }
  private click(p: Vec2, e: PointerEvent): void {
    if (e.button === 2) {
      if (this.renderer.placement || this.mode !== 'select') this.setMode('select');
      else this.select([]);
      if (!this.planning) this.waypointOrders.clear(); return;
    }
    const w = this.renderer.camera.world(p.x, p.y), x = Math.floor(w.x), y = Math.floor(w.y), s = this.game.state;
    if (this.superweaponClick(w)) return;
    if (this.renderer.placement) {
      if (this.game.place(this.renderer.placement, x, y)) { this.callbacks.ack(); this.cancelPlacement(); }
      else this.callbacks.toast('Cannot place here. Use clear ground close to your base.');
      return;
    }
    if (this.mode === 'pan') return;
    const entity = this.renderer.pick(p.x, p.y), ids = this.ids();
    if (this.mode === 'repair' || this.mode === 'sell') {
      if (entity && entity.side === 0) {
        const done = this.mode === 'repair' ? this.game.repair(entity.id) : this.game.sell(entity.id);
        if (done) this.callbacks.ack();
      }
      return;
    }
    if (ids.length && e.ctrlKey && e.altKey) this.game.orderGuard(ids, w.x, w.y, entity?.side === 0 ? entity.id : undefined);
    else if (ids.length && e.ctrlKey && e.shiftKey) this.game.orderMove(ids, w.x, w.y, true);
    else if (ids.length && e.ctrlKey) {
      if (entity) this.game.orderAttack(ids, entity.id, true);
      else this.game.orderForceFire(ids, w.x, w.y);
    } else if (ids.length && e.altKey) this.game.orderForceMove(ids, w.x, w.y);
    else if (entity?.side === 0 && this.game.enterTransport?.(ids, entity.id)) { this.callbacks.ack(); return; }
    else if (entity && this.engineerRepair(entity)) this.game.orderAttack(ids, entity.id);
    else if (entity && entity.side === 0 && this.mode !== 'attack') {
      const now = performance.now(), double = this.lastClick.id === entity.id && now - this.lastClick.time < 320;
      if (e.shiftKey && entity.selected) this.select(ids.filter(id => id !== entity.id));
      else if (double && this.game.defs[entity.type].deployedRange === undefined) this.select(this.ownUnits().filter(other => other.type === entity.type && this.renderer.visible(other)).map(other => other.id), e.shiftKey);
      else if (entity.selected && !e.shiftKey && (this.game.defs[entity.type].deployedRange !== undefined || entity.type === 'mcv' || this.game.defs[entity.type].passengers)) this.game.deploy([entity.id]);
      else this.select([entity.id], e.shiftKey);
      this.lastClick = { id: entity.id, time: now }; this.callbacks.ack(); return;
    } else if (ids.length) {
      if (this.planning) {
        this.queueWaypoint(ids, w); return;
      }
      if (entity && entity.side !== 0) this.game.orderAttack(ids, entity.id);
      else if (x >= 0 && y >= 0 && x < s.width && y < s.height && s.tiles[y * s.width + x].ore > 0 && ids.some(id => this.game.defs[s.entities.find(entity => entity.id === id)!.type].harvester)) this.game.orderHarvest(ids, x, y);
      else this.game.orderMove(ids, w.x, w.y, this.mode === 'attack');
    } else { this.select([]); return; }
    this.callbacks.ack(); if (this.mode === 'attack') this.setMode('select');
  }
  private superweaponClick(point: Vec2): boolean {
    if (!['chrono-source', 'chrono-destination', 'weather'].includes(this.mode)) return false;
    if (this.mode === 'chrono-source') {
      this.chronoSource = { ...point }; this.setMode('chrono-destination');
      this.callbacks.toast('Choose the Chronosphere destination. Right click cancels.'); return true;
    }
    const success = this.game.activateSuperweapon?.(this.mode === 'weather' ? 'weather' : 'chronosphere', point, this.chronoSource);
    if (success) this.setMode('select');
    else this.callbacks.toast('Choose an explored, valid target. The weapon must be charged and powered.');
    return true;
  }
  get planning(): boolean { const key = this.bindings.get('planning'); return this.planningMode || (key !== undefined && this.keys.has(key)); }

  private queueWaypoint(ids: number[], point: Vec2): void {
    for (const id of ids) {
      const route = this.waypointOrders.get(id) ?? [];
      if (route.length < 32) route.push(point);
      this.waypointOrders.set(id, route);
    }
    this.callbacks.toast(this.planningMode ? 'Waypoint set. Turn off planning to move.' : 'Waypoint set. Release Z to move.');
  }

  executeCommand(command: ControlCommand, options: { shift?: boolean; ctrl?: boolean; clear?: boolean } = {}): void {
    if (!this.enabled()) return;
    const ids = this.ids();
    if (command === 'deploy') { this.game.deploy(ids); this.callbacks.ack(); }
    else if (command === 'guard') { this.game.guard(ids); this.callbacks.toast('Guarding current area.'); }
    else if (command === 'planning') {
      this.planningMode = !this.planningMode;
      if (!this.planningMode) this.commitWaypoints();
      this.callbacks.toast(this.planningMode ? 'Planning: click destinations, then turn off planning to move.' : 'Waypoint orders issued.');
    } else if (command === 'type') {
      const types = new Set(this.game.state.entities.filter(e => e.selected).map(e => e.type)), now = performance.now(), all = now - this.lastTypeTime < 400;
      this.select(this.ownUnits().filter(e => types.has(e.type) && (all || this.renderer.visible(e))).map(e => e.id), options.shift);
      this.lastTypeTime = now; this.callbacks.ack();
    } else {
      const key = command === 'team1' ? '1' : '2';
      if (options.clear) { this.groups.delete(key); this.callbacks.toast(`Control group ${key} disbanded.`); }
      else this.selectGroup(key, !!options.ctrl || (!this.groups.has(key) && ids.length > 0), !!options.shift);
    }
  }

  private selectGroup(key: string, assign: boolean, additive: boolean): void {
    if (assign) { this.groups.set(key, this.ids()); this.callbacks.toast(`Control group ${key} assigned.`); }
    else {
      const group = this.groups.get(key);
      if (group) {
        this.select(group, additive); const now = performance.now();
        if (this.lastGroup.key === key && now - this.lastGroup.time < 400) this.centerSelection();
        this.lastGroup = { key, time: now };
      }
    }
  }

  private commitWaypoints(): void {
    if (this.enabled()) for (const [id, route] of this.waypointOrders) this.game.orderWaypoints([id], route);
    this.waypointOrders.clear();
  }

  private key(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    if (!this.enabled() || target?.closest('input,select,textarea,[contenteditable="true"],[role="dialog"],dialog[open]')) { this.keys.clear(); return; }
    if (target?.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
    const key = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
    // Browser shortcuts remain native unless the combination is an RA2 command.
    if ((ctrl && !/^[1-9]$/.test(key) && !/^f[1-4]$/.test(key) && !['control', 'shift', 'alt'].includes(key)) || (e.altKey && key !== 'alt')) return;
    this.keys.add(key); this.trackModifiers(e); this.updateCursor();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();
    if (e.repeat) return;
    const ids = this.ids();
    const command = [...this.bindings].find(([, binding]) => binding === key)?.[0];
    if (key === 'escape') { e.preventDefault(); if (this.renderer.placement || this.mode !== 'select') this.setMode('select'); else { this.keys.clear(); this.callbacks.options?.(); } }
    else if (command === 'stop') { this.game.stop(ids); this.callbacks.toast('Units stopped.'); }
    else if (command === 'guard') this.executeCommand('guard');
    else if (command === 'scatter') { this.game.scatter(ids); this.callbacks.ack(); }
    else if (command === 'deploy') this.executeCommand('deploy');
    else if (command === 'repair' || command === 'sell') this.setMode(this.mode === command ? 'select' : command);
    else if (command === 'selectAll') { this.select(this.ownUnits().map(e => e.id)); this.callbacks.ack(); }
    else if (command === 'selectType') this.executeCommand('type', { shift: e.shiftKey });
    else if (command === 'next') {
      const units = this.ownUnits().sort((a, b) => a.id - b.id);
      const next = units.find(unit => unit.id > (ids.at(-1) ?? -1)) ?? units[0];
      if (next) this.select([next.id]);
    } else if (command === 'previous') {
      const previous = this.selectionHistory.pop(); if (previous) this.game.select(previous);
    } else if (command === 'health') {
      const units = this.ownUnits();
      for (let attempt = 0; attempt < 3; attempt++) {
        const band = this.healthBand; this.healthBand = (this.healthBand + 1) % 3;
        const members = units.filter(e => (e.hp / e.maxHp > .5 ? 0 : e.hp / e.maxHp > .25 ? 1 : 2) === band);
        if (members.length) { this.select(members.map(e => e.id)); break; }
      }
    } else if (command === 'follow') { this.followId = this.followId === ids[0] ? null : ids[0] ?? null; }
    else if (command === 'home') {
      const yard = this.game.state.entities.find(e => e.side === 0 && e.type === 'conyard');
      if (yard) { const [w, h] = this.game.defs[yard.type].footprint; this.followId = null; this.renderer.camera.center(yard.x + w / 2, yard.y + h / 2); }
    } else if (command === 'structures' || command === 'defenses' || command === 'infantry' || command === 'vehicles') this.callbacks.category?.(command);
    else if (/^f[1-4]$/.test(key)) {
      e.preventDefault(); const camera = this.renderer.camera;
      if (ctrl) { this.bookmarks.set(key, { x: camera.x, y: camera.y }); this.callbacks.toast(`Bookmark ${key.toUpperCase()} set.`); }
      else { const point = this.bookmarks.get(key); if (point) { this.followId = null; camera.x = point.x; camera.y = point.y; } }
    } else if (/^[1-9]$/.test(key)) {
      e.preventDefault();
      this.selectGroup(key, ctrl, e.shiftKey);
    } else if (key === '+' || key === '=' || key === '-') {
      this.renderer.camera.setZoom(this.renderer.camera.zoom * (key === '-' ? .85 : 1.15)); this.callbacks.zoom(this.renderer.camera.zoom);
    } else if (command === 'briefing') this.callbacks.briefing?.();
  }
  private centerSelection(): void {
    const entities = this.game.state.entities.filter(e => e.selected && e.side === 0);
    if (entities.length) this.renderer.camera.center(entities.reduce((sum, e) => sum + e.x, 0) / entities.length, entities.reduce((sum, e) => sum + e.y, 0) / entities.length);
  }
  tick(dt: number): void {
    if (this.state !== this.game.state) {
      this.state = this.game.state; this.planningMode = false; this.groups.clear(); this.bookmarks.clear(); this.selectionHistory = []; this.followId = null; this.waypointOrders.clear(); this.keys.clear(); this.cancelGesture(); this.setMode('select');
    }
    if (!this.enabled()) { this.keys.clear(); this.updateCursor(); return; }
    const speed = 500 * this.scrollMultiplier * Math.min(dt, .25), camera = this.renderer.camera;
    let dx = 0, dy = 0;
    if (this.keys.has('arrowleft')) dx += speed;
    if (this.keys.has('arrowright')) dx -= speed;
    if (this.keys.has('arrowup')) dy += speed;
    if (this.keys.has('arrowdown')) dy -= speed;
    if (!this.mobile && this.hover && !this.pointers.size) {
      if (this.hover.x < 12) dx += speed; else if (this.hover.x > camera.width - 12) dx -= speed;
      if (this.hover.y < 12) dy += speed; else if (this.hover.y > camera.height - 12) dy -= speed;
    }
    if (dx || dy) { this.followId = null; camera.pan(dx, dy); }
    if (this.followId !== null) {
      const unit = this.game.state.entities.find(e => e.id === this.followId && e.hp > 0);
      if (unit) {
        const previous = unit.previous ?? unit, alpha = this.game.interpolation;
        camera.center(previous.x + (unit.x - previous.x) * alpha, previous.y + (unit.y - previous.y) * alpha);
      } else this.followId = null;
    }
    camera.constrain(this.game.state.width, this.game.state.height, this.game.state.nativeMap);
    if (this.lastCameraZoom !== camera.zoom) { this.callbacks.zoom(camera.zoom); this.lastCameraZoom = camera.zoom; }
    this.updateCursor();
  }
}
