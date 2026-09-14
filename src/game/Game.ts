import { definitions, isBuilding } from './definitions';
import { createMap, MAP_SIZE } from './map';
import { initializeOreMines, updateOreMines } from './oreMines';
import { BUILDING_SALE_SECONDS } from './buildingSale';
import type { NativeMap } from './maps/nativeMap';
import { nativeGameMap } from './maps/gameMap';
import { NATIVE_STRUCTURE_SPECS } from './maps/theater';
import { findPath } from './pathfinding';
import { placementCells } from './placement';
import { turnFacing, type FacingTurn } from './facing';
import { nativeGameSpeedIndex } from './timing';
import { NATIVE_EFFECT_TIMINGS, NATIVE_INFANTRY_TIMINGS } from './combat';
import { CUSTOM_UNIT_IDS, INSPECTION_RULES, rankMultiplier, rankName } from './customUnits';
import { TESTING_FLAGS } from './testing';
import { nativeNormalizedInterval } from '../assets/NativeAnimation';
import type { AnimationDefinition, Category, Entity, GameAPI, GameState, InfantryAnimationDefinition, Side, UnitDef, Vec2 } from './types';

const CATEGORIES: Category[] = ['structures', 'defenses', 'infantry', 'vehicles'];
// One simulation second represents 30 authored logic frames; speed scales the
// accumulator, never the frame step or the input/render clock.
const STEP = 1 / 30;
const distance = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (n: number, low: number, high: number): number => Math.max(low, Math.min(high, n));
interface UnitMemory {
  destination?: Vec2;
  attackMove?: boolean;
  oreTarget?: Vec2;
  repath: number;
  stuck: number;
  idleTimer: number;
  holdPosition?: boolean;
  forceFire?: boolean;
  groundTarget?: Vec2;
  forceMove?: boolean;
  waypoints?: Vec2[];
  repairTimer?: number;
  escortId?: number;
  heading?: number; turretAim?: number; bodyTurn?: FacingTurn; turretTurn?: FacingTurn;
  turningBeforeMove?: boolean;
  avoidancePoint?: Vec2;
  detourRetryAt?: number;
  fireIntentAt?: number;
  burstIndex?: number;
  idleActionAt?: number;
  idleActionRandom?: number;
  idleActionPending?: string;
  idleActionTurning?: boolean;
}
export interface GameOptions { ai?: boolean; map?: NativeMap; automaticSovietWaves?: boolean }

/** Fixed-step, renderer-independent RTS rules. The UI can only command side 0. */
export class Game implements GameAPI {
  readonly defs: Record<string, UnitDef> = definitions;
  state!: GameState;
  readonly automaticSovietWaves: boolean;
  private readonly aiEnabled: boolean;
  private nativeMap?: NativeMap;
  private nextId = 1;
  private nextEventId = 1;
  private accumulator = 0;
  private visionTimer = 0;
  private aiTimer = 0;
  private nextAttack = 100;
  private commandFeedbackTicks = 0;
  private wave = 0;
  private memories = new Map<number, UnitMemory>();
  private repairs = new Set<number>();
  private blocked = new Uint8Array(MAP_SIZE * MAP_SIZE);
  private vision: Uint8Array[] = [];
  private effectAnimations = structuredClone(NATIVE_EFFECT_TIMINGS);
  private infantryAnimations = structuredClone(NATIVE_INFANTRY_TIMINGS);
  private combatRandomState = 0x524132;
  private localTools = { instantBuild: false, free: false };

  constructor(options: GameOptions = {}) {
    this.aiEnabled = options.ai !== false;
    this.automaticSovietWaves = options.automaticSovietWaves ?? TESTING_FLAGS.automaticSovietWaves;
    this.nativeMap = options.map;
    this.restart();
  }

  loadNativeMap(map: NativeMap): void { this.nativeMap = map; this.restart(); }

  get interpolation(): number { return clamp(this.accumulator / STEP, 0, 1); }
  get nativeGameSpeedIndex(): number { return nativeGameSpeedIndex(this.state.speed); }
  setGameSpeed(speed: number): void { if (Number.isFinite(speed)) this.state.speed = clamp(speed, .25, 4); }
  configureLocalTools(options: Partial<{ instantBuild: boolean; free: boolean }>): void {
    if (!import.meta.env.DEV) return;
    if (typeof options.instantBuild === 'boolean') this.localTools.instantBuild = options.instantBuild;
    if (typeof options.free === 'boolean') this.localTools.free = options.free;
  }
  placeLocalEnemy(type: string, x: number, y: number): Entity | undefined {
    if (!import.meta.env.DEV || this.state.winner !== null || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const def = this.defs[type], tx = Math.floor(x), ty = Math.floor(y);
    if (!def || isBuilding(def) || def.mapOnly || !this.isPassable(tx, ty) || this.mobileOccupies(tx, ty, -1)) return;
    const entity = this.spawn(type, 1, tx + .5, ty + .5);
    entity.order = 'guard';
    this.updateVision();
    return entity;
  }
  setAnimationDefinitions(effects: Record<string, AnimationDefinition>, infantry: Record<string, InfantryAnimationDefinition>): void {
    const valid = (definition: AnimationDefinition, allowEmpty = false) => definition && Number.isInteger(definition.frames) && definition.frames >= (allowEmpty ? 0 : 1)
      && Number.isInteger(definition.ticksPerFrame) && definition.ticksPerFrame >= (allowEmpty ? 0 : 1);
    for (const [name, definition] of Object.entries(effects)) if (!valid(definition)) throw new Error(`Invalid original animation timing: ${name}`);
    for (const [name, definition] of Object.entries(infantry)) {
      if (!definition || !Number.isInteger(definition.fireFrame) || definition.fireFrame < 0 || !definition.sequences
        || Object.values(definition.sequences).some(sequence => !valid(sequence, true))) throw new Error(`Invalid original infantry timing: ${name}`);
    }
    this.effectAnimations = structuredClone({ ...NATIVE_EFFECT_TIMINGS, ...Object.fromEntries(Object.entries(effects).map(([name, definition]) => [name.toUpperCase(), definition])) });
    this.infantryAnimations = structuredClone(Object.fromEntries(Object.entries(infantry).map(([name, definition]) => [name.toLowerCase(), definition])));
  }

  restart(): void {
    const speed = Number.isFinite(this.state?.speed) ? clamp(this.state.speed, .25, 4) : 1;
    this.nextId = 1;
    this.nextEventId = 1;
    this.accumulator = 0;
    this.visionTimer = 0;
    this.aiTimer = 2;
    this.nextAttack = 100;
    this.commandFeedbackTicks = 0;
    this.combatRandomState = 0x524132;
    this.wave = 0;
    this.memories.clear();
    this.repairs.clear();
    const side = (id: number, faction: 'allied' | 'soviet', name: string, color: string): Side => ({
      id, faction, name, color, money: 6000, power: 0, powerUsed: 0, kills: 0, defeated: false,
      queues: { structures: [], defenses: [], infantry: [], vehicles: [] },
    });
    const terrain = this.nativeMap ? nativeGameMap(this.nativeMap) : { width: MAP_SIZE, height: MAP_SIZE, tiles: createMap() };
    this.state = {
      ...terrain, nativeMap: this.nativeMap, entities: [],
      sides: [side(0, 'allied', 'Allied Command', '#2269d4'), side(1, 'soviet', 'Soviet AI', '#ff1919')],
      time: 0, paused: false, speed, winner: null, effects: [], events: [],
      fog: new Uint8Array(terrain.width * terrain.height), explored: new Uint8Array(terrain.width * terrain.height),
    };
    this.state.oreMines = initializeOreMines(this.state);
    this.vision = [this.state.fog, new Uint8Array(terrain.width * terrain.height)];
    if (this.nativeMap) {
      for (const [sideId, waypoint] of [[0, 0], [1, 3]]) {
        const start = this.nativeMap.starts.find(s => s.index === waypoint);
        if (!start) throw new Error(`Native skirmish requires starting waypoint ${waypoint}`);
        const x = start.x, y = start.y;
        const layout: [string, number, number][] = [
          ['conyard', -2, -2], [sideId ? 'power_soviet' : 'power', 3, -2],
          [sideId ? 'refinery_soviet' : 'refinery', -3, 4], [sideId ? 'barracks_soviet' : 'barracks', 4, 4],
          [sideId ? 'warminer' : 'miner', -4.5, 7.5], [sideId ? 'rhino' : 'grizzly', 5.5, 1.5],
          ...[3.5, 4.5, 5.5, 6.5].map(dx => [sideId ? 'conscript' : 'gi', dx, 3.5] as [string, number, number]),
        ];
        for (const [type, dx, dy] of layout) this.spawn(type, sideId, x + dx, y + dy);
      }
      for (const structure of this.nativeMap.structures) {
        const spec = NATIVE_STRUCTURE_SPECS[structure.type as keyof typeof NATIVE_STRUCTURE_SPECS];
        if (!spec) throw new Error(`Unsupported native gameplay structure: ${structure.type}`);
        const entity = this.spawn(spec.gameType, -1, structure.x, structure.y);
        entity.hp = entity.maxHp * structure.health / 256; entity.nativeType = structure.type;
      }
    } else {
    this.spawn('conyard', 0, 12, 39);
    this.spawn('power', 0, 17, 39);
    this.spawn('refinery', 0, 11, 45);
    this.spawn('barracks', 0, 18, 44);
    this.spawn('miner', 0, 10.5, 48.5);
    this.spawn('grizzly', 0, 19.5, 41.5);
    for (const [x, y] of [[17.5, 43.5], [18.5, 43.5], [19.5, 43.5], [20.5, 43.5]]) this.spawn('gi', 0, x, y);
    this.spawn('conyard', 1, 45, 14);
    this.spawn('power_soviet', 1, 50, 15);
    this.spawn('refinery_soviet', 1, 43, 20);
    this.spawn('barracks_soviet', 1, 49, 20);
    this.spawn('warminer', 1, 47.5, 20.5);
    this.spawn('rhino', 1, 48.5, 18.5);
    for (const [x, y] of [[48.5, 19.5], [49.5, 19.5], [50.5, 19.5], [51.5, 19.5]]) this.spawn('conscript', 1, x, y);
    }
    this.rebuildBlocked();
    this.updatePower();
    this.updateVision();
    this.notify('Battle control online. Build your base, harvest ore and destroy the Soviet base.', 'info');
  }

  tick(dt: number): void {
    if (this.state.paused || this.state.winner !== null || !Number.isFinite(dt) || dt <= 0) return;
    // A hidden browser tab cannot advance the entire battle when it returns.
    this.accumulator += Math.min(dt, 0.25) * clamp(this.state.speed, 0.25, 4);
    while (this.accumulator + 1e-9 >= STEP) {
      this.accumulator -= STEP;
      this.step(STEP);
      if (this.state.winner !== null) { this.accumulator = 0; break; }
    }
  }

  canBuild(type: string, sideId = 0): { ok: boolean; reason: string } {
    const def = this.defs[type], side = this.state.sides[sideId];
    if (!def || !side) return { ok: false, reason: 'Unknown unit or side' };
    if (def.mapOnly) return { ok: false, reason: 'Capture this neutral structure with an Engineer' };
    if (this.state.winner !== null || side.defeated) return { ok: false, reason: 'Battle has ended' };
    if (def.faction !== 'both' && def.faction !== side.faction) return { ok: false, reason: 'Unavailable to this faction' };
    const owned = this.state.entities.filter(e => e.side === sideId && e.hp > 0 && !e.selling);
    const missing = def.requires.find(id => !owned.some(e => e.type === id));
    if (missing) return { ok: false, reason: `Requires ${this.defs[missing].name}` };
    if (!owned.some(e => this.defs[e.type].producer?.includes(def.category)))
      return { ok: false, reason: `Requires ${def.category === 'infantry' ? 'Barracks' : def.category === 'vehicles' ? 'War Factory' : 'Construction Yard'}` };
    if (side.queues[def.category].length >= 8) return { ok: false, reason: 'Queue is full (8)' };
    const queuedUnits = side.queues.infantry.length + side.queues.vehicles.length;
    if (!isBuilding(def) && owned.filter(e => !isBuilding(this.defs[e.type])).length + queuedUnits >= 100)
      return { ok: false, reason: 'Unit limit reached (100)' };
    return { ok: true, reason: '' };
  }

  build(type: string, sideId = 0): boolean {
    const check = this.canBuild(type, sideId);
    if (!check.ok) {
      if (sideId === 0) this.notify(check.reason, 'warning');
      return false;
    }
    const def = this.defs[type], side = this.state.sides[sideId];
    side.queues[def.category].push({ id: this.nextId++, type, progress: 0, spent: 0, ready: false, paused: false });
    if (sideId === 0) this.notify(`${def.name}: construction started`, 'info');
    return true;
  }

  cancelBuild(category: Category, sideId = 0, itemId?: number): void {
    const side = this.state.sides[sideId];
    if (!side || !side.queues[category]) return;
    // Unstarted items cost nothing; canceling refunds only credits already spent.
    const queue = side.queues[category], index = itemId === undefined ? queue.length - 1 : queue.findIndex(item => item.id === itemId);
    const canceled = index >= 0 ? queue.splice(index, 1)[0] : undefined;
    if (canceled) {
      side.money += canceled.spent;
      if (sideId === 0) this.notify(`${this.defs[canceled.type].name} canceled. Credits refunded.`, 'info');
    }
  }

  toggleBuildPause(category: Category, sideId = 0): void {
    const item = this.state.sides[sideId]?.queues[category]?.[0];
    if (item && !item.ready) item.paused = !item.paused;
  }

  canPlace(type: string, x: number, y: number, sideId = 0): boolean {
    const cells = placementCells(this.state, this.defs, type, x, y, sideId);
    return cells.length > 0 && cells.every(cell => cell.valid);
  }

  place(type: string, x: number, y: number, sideId = 0): boolean {
    if (this.state.winner !== null) return false;
    const def = this.defs[type];
    if (!def) return false;
    const queue = this.state.sides[sideId]?.queues[def.category];
    const item = queue?.[0];
    if (!item || !item.ready || item.type !== type || !this.canPlace(type, x, y, sideId)) return false;
    queue.shift();
    const entity = this.spawn(type, sideId, x, y);
    this.rebuildBlocked();
    this.updatePower();
    this.updateVision();
    if (type === 'refinery' || type === 'refinery_soviet')
      this.spawnFrom(entity, sideId === 0 ? 'miner' : 'warminer');
    if (sideId === 0) this.notify(`${def.name} online`, 'success');
    return true;
  }

  select(ids: number[], additive = false): void {
    const wanted = new Set(ids);
    for (const entity of this.state.entities) {
      if (entity.side !== 0 || entity.hp <= 0 || entity.selling) { entity.selected = false; continue; }
      entity.selected = wanted.has(entity.id) || (additive && entity.selected);
      if (entity.selected) this.cancelInfantryIdle(entity);
    }
    if (this.state.entities.some(entity => entity.selected)) this.commandFeedbackTicks = 25;
  }

  /** User destinations for command feedback; A* navigation cells stay private. */
  commandPath(id: number): { points: Vec2[]; attack: boolean } | undefined {
    if (this.commandFeedbackTicks <= 0) return;
    const entity = this.state.entities.find(e => e.id === id && e.hp > 0);
    if (!entity) return;
    const memory = this.memories.get(id), def = this.defs[entity.type];
    if (memory?.groundTarget) return { points: [{ ...memory.groundTarget }], attack: true };
    const target = this.state.entities.find(e => e.id === entity.targetId && e.hp > 0);
    if (target) return { points: [this.center(target)], attack: true };
    if (isBuilding(def)) return entity.rally ? { points: [{ ...entity.rally }], attack: false } : undefined;
    const escort = this.state.entities.find(e => e.id === memory?.escortId && e.hp > 0 && e.side === entity.side);
    const destination = escort ? this.center(escort) : entity.order === 'move' ? memory?.destination
      : entity.order === 'harvest' ? memory?.oreTarget : entity.order === 'return' ? entity.path.at(-1) : undefined;
    if (!destination) return;
    return { points: [destination, ...(memory?.waypoints ?? [])].map(point => ({ ...point })), attack: false };
  }

  orderMove(ids: number[], x: number, y: number, attackMove = false): void {
    if (!Number.isFinite(x) || !Number.isFinite(y) || this.state.winner !== null) return;
    const own = this.commandable(ids, 0);
    for (const entity of own.filter(e => isBuilding(this.defs[e.type]))) entity.rally = this.constrain({ x, y });
    this.issueMove(own.filter(e => !isBuilding(this.defs[e.type])), this.constrain({ x, y }), attackMove);
    if (own.length) this.addOrderEffect(x, y, 0);
  }

  orderAttack(ids: number[], targetId: number, force = false): void {
    if (this.state.winner !== null) return;
    const target = this.state.entities.find(e => e.id === targetId && e.hp > 0 && !e.selling);
    if (!target || !this.visibleTo(target, 0)) return;
    const units = this.commandable(ids, 0).filter(e => e.type !== 'george');
    for (const entity of units) {
      const def = this.defs[entity.type];
      if ((!def.damage && entity.type !== 'engineer') || entity.id === targetId) continue;
      if (entity.type === 'engineer' && (!isBuilding(this.defs[target.type]) || target.side === entity.side && target.hp >= target.maxHp)) continue;
      if (target.side === entity.side && !force && entity.type !== 'engineer') continue;
      entity.order = 'attack';
      entity.targetId = targetId;
      entity.path = [];
      this.memories.set(entity.id, { repath: 0, stuck: 0, idleTimer: 0, forceFire: force });
    }
    if (units.length) this.addOrderEffect(target.x, target.y, 1);
  }

  orderHarvest(ids: number[], x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const tx = Math.floor(x), ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= this.state.width || ty >= this.state.height || this.state.winner !== null) return;
    const tile = this.state.tiles[ty * this.state.width + tx];
    if (tile.ore <= 0 || !this.state.explored[ty * this.state.width + tx]) return;
    for (const entity of this.commandable(ids, 0)) {
      if (!this.defs[entity.type].harvester) continue;
      entity.order = 'harvest';
      entity.targetId = null;
      entity.path = [];
      this.memories.set(entity.id, { oreTarget: { x: tx + 0.5, y: ty + 0.5 }, repath: 0, stuck: 0, idleTimer: 0 });
    }
    this.addOrderEffect(x, y, 0);
  }

  stop(ids: number[]): void {
    for (const entity of this.commandable(ids, 0)) {
      entity.path = [];
      entity.order = 'guard';
      entity.targetId = null;
      if (!entity.deployment) entity.infantryAnimation = undefined;
      this.memories.set(entity.id, { repath: 0, stuck: 0, idleTimer: 0, holdPosition: true });
    }
  }

  guard(ids: number[]): void {
    this.stop(ids);
    for (const entity of this.commandable(ids, 0)) this.memory(entity).holdPosition = false;
  }

  deploy(ids: number[]): void {
    for (const entity of this.commandable(ids, 0)) {
      if (this.defs[entity.type].deployedRange === undefined) continue;
      this.stop([entity.id]);
      this.beginDeployment(entity, !entity.deployed);
      entity.anim = 0;
    }
  }

  scatter(ids: number[]): void {
    const units = this.commandable(ids, 0).filter(e => !isBuilding(this.defs[e.type]));
    if (!units.length) return;
    const center = { x: units.reduce((sum, e) => sum + e.x, 0) / units.length, y: units.reduce((sum, e) => sum + e.y, 0) / units.length };
    for (const entity of units) {
      const angle = distance(entity, center) > 0.1 ? Math.atan2(entity.y - center.y, entity.x - center.x) : entity.id * 2.399963;
      this.issueMove([entity], this.constrain({ x: entity.x + Math.cos(angle) * 2, y: entity.y + Math.sin(angle) * 2 }), false);
    }
  }

  orderForceMove(ids: number[], x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y) || this.state.winner !== null) return;
    this.orderMove(ids, x, y);
    for (const entity of this.commandable(ids, 0)) {
      const memory = this.memory(entity); memory.forceMove = true;
      // A deliberate crush order must be allowed to end in the enemy's cell.
      if (this.defs[entity.type].crusher && this.isPassable(Math.floor(x), Math.floor(y))) {
        const destination = { x: Math.floor(x) + .5, y: Math.floor(y) + .5 };
        entity.path = this.path(entity, destination); memory.destination = destination;
      }
    }
  }

  orderGuard(ids: number[], x: number, y: number, escortId?: number): void {
    if (escortId !== undefined && !this.state.entities.some(e => e.id === escortId && e.side === 0 && e.hp > 0)) return;
    this.orderMove(ids.filter(id => id !== escortId), x, y, true);
    for (const entity of this.commandable(ids, 0)) if (entity.id !== escortId) this.memory(entity).escortId = escortId;
  }

  orderForceFire(ids: number[], x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y) || this.state.winner !== null) return;
    const point = this.constrain({ x, y });
    if (!this.state.explored[Math.floor(point.y) * this.state.width + Math.floor(point.x)]) return;
    const units = this.commandable(ids, 0).filter(e => e.type !== 'george' && this.defs[e.type].damage > 0);
    for (const entity of units) {
      this.stop([entity.id]);
      entity.order = 'attack';
      this.memory(entity).groundTarget = point;
    }
    if (units.length) this.addOrderEffect(point.x, point.y, 1);
  }

  orderWaypoints(ids: number[], points: Vec2[]): void {
    const route = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y)).slice(0, 32).map(p => this.constrain(p));
    if (!route.length || this.state.winner !== null) return;
    this.orderMove(ids, route[0].x, route[0].y);
    for (const entity of this.commandable(ids, 0)) {
      if (!isBuilding(this.defs[entity.type])) this.memory(entity).waypoints = route.slice(1);
    }
  }

  sell(id: number): boolean {
    const entity = this.state.entities.find(e => e.id === id && e.side === 0 && e.hp > 0 && !e.selling);
    if (!entity || !isBuilding(this.defs[entity.type]) || this.state.winner !== null) return false;
    if (this.defs[entity.type].mapOnly) return false;
    this.state.sides[0].money += Math.floor(this.defs[entity.type].cost * 0.5 * (entity.hp / entity.maxHp));
    entity.selling = { startedAt: this.state.time, duration: BUILDING_SALE_SECONDS };
    entity.selected = false; entity.targetId = null; entity.rally = undefined;
    this.repairs.delete(entity.id);
    for (const other of this.state.entities) if (other.targetId === entity.id) other.targetId = null;
    this.notify(`${this.defs[entity.type].name} sold`, 'info');
    this.updatePower();
    this.rebuildBlocked();
    this.updateVision();
    this.checkVictory();
    return true;
  }

  canRepair(id: number): boolean {
    const entity = this.state.entities.find(e => e.id === id && e.side === 0 && e.hp > 0 && !e.selling);
    return !!entity && isBuilding(this.defs[entity.type]) && this.state.winner === null
      && (this.repairs.has(id) || (entity.hp < entity.maxHp && (this.state.sides[0].money >= 1 || (import.meta.env.DEV && this.localTools.free))));
  }

  repair(id: number): boolean {
    const entity = this.state.entities.find(e => e.id === id && e.side === 0 && e.hp > 0 && !e.selling);
    if (!entity || !isBuilding(this.defs[entity.type]) || this.state.winner !== null) return false;
    if (this.repairs.has(id)) { this.repairs.delete(id); this.notify('Repair canceled', 'info'); return true; }
    if (!this.canRepair(id)) return false;
    this.repairs.add(id);
    this.notify(`Repairing ${this.defs[entity.type].name}`, 'info');
    return true;
  }

  private step(dt: number): void {
    this.state.time += dt;
    updateOreMines(this.state, this.defs);
    this.commandFeedbackTicks = Math.max(0, this.commandFeedbackTicks - 1);
    this.visionTimer -= dt;
    this.aiTimer -= dt;
    this.updatePower();
    this.updateQueues(dt);
    if (this.aiEnabled && this.aiTimer <= 0) { this.aiTimer = 2.5; this.updateAI(); }
    for (const effect of this.state.effects) effect.life -= dt;
    this.state.effects = this.state.effects.filter(effect => effect.life > 1e-9);
    // Entity removals are deferred so combat during a frame has stable iteration.
    for (const entity of [...this.state.entities]) {
      if (entity.hp <= 0) continue;
      if (entity.selling) continue;
      entity.previous = { x: entity.x, y: entity.y };
      entity.previousFacing = entity.facing;
      entity.previousTurretFacing = entity.turretFacing ?? entity.facing;
      const def = this.defs[entity.type];
      if (entity.type === 'tech_oil' && entity.side >= 0) {
        entity.harvestTimer += dt;
        if (entity.harvestTimer >= 100 / 30) { entity.harvestTimer -= 100 / 30; this.state.sides[entity.side].money += 20; }
      }
      entity.harvesting = false;
      entity.anim += dt;
      entity.cooldown = Math.max(0, entity.cooldown - dt - 1e-10);
      if (entity.type === 'george') {
        entity.targetId = null;
        if (entity.order === 'attack') entity.order = 'guard';
        this.memory(entity).groundTarget = undefined;
        this.cancelFireIntent(entity, this.memory(entity));
      }
      this.updateInfantryAnimation(entity);
      const memory = this.memory(entity);
      memory.repath -= dt;
      memory.idleTimer -= dt;
      if (memory.escortId !== undefined && !entity.targetId && memory.repath <= 0) {
        const escorted = this.state.entities.find(other => other.id === memory.escortId && other.hp > 0 && other.side === entity.side);
        if (!escorted) memory.escortId = undefined;
        else if (this.distanceToEntity(entity, escorted) > 3) {
          const destination = this.nearestReachableAround(entity, escorted);
          if (destination) {
            entity.path = this.path(entity, destination, true); entity.order = 'move';
            memory.destination = destination; memory.attackMove = true; memory.repath = .5;
          }
        }
      }
      if (this.repairs.has(entity.id)) this.tickRepair(entity, dt);
      if (def.harvester && (entity.order === 'harvest' || entity.order === 'return' || entity.order === 'idle')) this.tickHarvester(entity, dt);
      if (def.damage > 0 || entity.type === 'engineer') this.tickCombat(entity, dt);
      if (!isBuilding(def)) this.moveEntity(entity, dt);
      this.updateFacing(entity);
      this.updateInfantryIdle(entity);
    }
    const destroyed = this.state.entities.filter(e => e.hp <= 0);
    for (const entity of destroyed) this.removeEntity(entity, true);
    const sold = this.state.entities.filter(e => e.selling && this.state.time - e.selling.startedAt + 1e-9 >= e.selling.duration);
    for (const entity of sold) this.removeEntity(entity, false);
    this.updateInspections(dt);
    if (destroyed.length || sold.length) { this.rebuildBlocked(); this.updatePower(); }
    if (this.visionTimer <= 0 || destroyed.length || sold.length) { this.visionTimer = 0.25; this.updateVision(); }
    this.checkVictory();
  }

  private updateQueues(dt: number): void {
    for (const side of this.state.sides) {
      const lowPower = side.powerUsed > side.power;
      for (const category of CATEGORIES) {
        const queue = side.queues[category], item = queue[0];
        if (!item) continue;
        // New custom training depends on its living tech building throughout the
        // queue. A destroyed/sold shop holds paid progress until the shop is rebuilt.
        const missing = !item.ready && (CUSTOM_UNIT_IDS as readonly string[]).includes(item.type)
          ? this.defs[item.type].requires.find(required => !this.state.entities.some(e => e.side === side.id && e.hp > 0 && !e.selling && e.type === required)) : undefined;
        item.blockedPrerequisite = missing ? `Requires ${this.defs[missing].name}` : undefined;
        if (item.paused || item.ready || item.blockedPrerequisite) continue;
        const producer = this.state.entities.find(e => e.side === side.id && e.hp > 0 && !e.selling && this.defs[e.type].producer?.includes(category));
        if (!producer) continue;
        const def = this.defs[item.type];
        const productionRate = lowPower ? clamp(side.power / Math.max(1, side.powerUsed), .5, .8) : 1;
        const instant = import.meta.env.DEV && side.id === 0 && this.localTools.instantBuild;
        const free = import.meta.env.DEV && side.id === 0 && this.localTools.free;
        const requestedProgress = Math.min(1 - item.progress, instant ? 1 : dt / def.buildTime * productionRate);
        const requestedCost = free ? 0 : requestedProgress * def.cost;
        const payment = Math.min(Math.max(0, side.money), requestedCost);
        side.money = Math.max(0, side.money - payment);
        item.spent += payment;
        item.blockedFunds = payment + 1e-8 < requestedCost;
        item.progress = Math.min(1, item.progress + (def.cost > 0 && !free ? payment / def.cost : requestedProgress));
        if (item.progress < 1 - 1e-8) continue;
        item.progress = 1;
        if (isBuilding(def)) {
          item.ready = true;
          if (side.id === 0) this.notify(`${def.name} ready. Choose a location in your base.`, 'success');
        } else {
          const unit = this.spawnFrom(producer, item.type);
          if (!unit) continue; // Exit is blocked. Keep the paid unit until a cell opens.
          queue.shift();
          if (producer.rally && !def.harvester) this.issueMove([unit], producer.rally, false);
          if (side.id === 0) this.notify(`${def.name} ready`, 'success');
        }
      }
    }
  }

  private updateInspections(dt: number): void {
    const entities = this.state.entities, claimed = new Set<number>();
    for (const entity of entities) { entity.inspectedBy = undefined; entity.inspectionProgress = undefined; }
    for (const george of entities.filter(e => e.type === 'george').sort((a, b) => a.id - b.id)) {
      if (george.hp <= 0 || george.side < 0 || george.path.length || george.order === 'move' ||
        (george.previous && distance(george, george.previous) > 1e-6)) { george.inspection = undefined; continue; }
      const eligible = (target: Entity) => target.id !== george.id && target.type !== 'george' && target.side === george.side && target.side >= 0 && target.hp > 0
        && !isBuilding(this.defs[target.type]) && (target.rank ?? 0) < INSPECTION_RULES.maxRank && !claimed.has(target.id)
        && distance(george, target) <= INSPECTION_RULES.radius;
      const previous = george.inspection;
      const target = entities.find(e => e.id === previous?.targetId && eligible(e))
        ?? entities.filter(eligible).sort((a, b) => distance(george, a) - distance(george, b) || a.id - b.id)[0];
      if (!target) { george.inspection = undefined; continue; }
      claimed.add(target.id);
      const elapsed = (previous?.targetId === target.id ? previous.elapsed : 0) + dt;
      george.inspection = { targetId: target.id, elapsed };
      target.inspectedBy = george.id;
      target.inspectionProgress = Math.min(1, elapsed / INSPECTION_RULES.seconds);
      if (elapsed + 1e-9 < INSPECTION_RULES.seconds) continue;
      target.rank = Math.min(INSPECTION_RULES.maxRank, (target.rank ?? 0) + 1) as 1 | 2;
      target.promotedAt = this.state.time;
      george.inspection.elapsed = 0;
      target.inspectionProgress = 0;
      if (target.side === 0) this.notify(`${this.defs[target.type].name} promoted to ${rankName(target)}`, 'success');
      if (target.rank === INSPECTION_RULES.maxRank) {
        george.inspection = undefined; target.inspectedBy = undefined; target.inspectionProgress = undefined;
      }
    }
  }

  private tickRepair(entity: Entity, dt: number): void {
    const side = this.state.sides[entity.side], def = this.defs[entity.type], memory = this.memory(entity);
    // RepairRate=.016 authored minutes (900 frames/minute), RepairStep=8.
    memory.repairTimer = (memory.repairTimer ?? 0) + dt;
    if (memory.repairTimer < .48) return;
    memory.repairTimer -= .48;
    const hp = Math.min(entity.maxHp - entity.hp, 8);
    const price = import.meta.env.DEV && entity.side === 0 && this.localTools.free ? 0 : hp / entity.maxHp * def.cost * .15;
    if (hp <= 0) { this.repairs.delete(entity.id); return; }
    if (side.money < price) return;
    side.money -= price;
    entity.hp += hp;
  }

  private updatePower(): void {
    for (const side of this.state.sides) { side.power = 0; side.powerUsed = 0; }
    for (const entity of this.state.entities) {
      if (entity.hp <= 0 || entity.selling) continue;
      const power = this.defs[entity.type].power, side = this.state.sides[entity.side];
      if (!side) continue;
      if (power > 0) side.power += power;
      else side.powerUsed -= power;
    }
  }

  private issueMove(units: Entity[], destination: Vec2, attackMove: boolean): void {
    const assigned = new Set<number>();
    // Give the nearest units the nearest formation cells. Distinct destinations
    // preserve selection formations and prevent every tank sharing one tile.
    const sorted = [...units].sort((a, b) => distance(a, destination) - distance(b, destination));
    for (const entity of sorted) {
      const moving = entity.previous ? distance(entity, entity.previous) > 1e-6 : entity.path.length > 0;
      const target = this.nearestOpen(destination, entity.id, assigned, 12);
      if (!target) continue;
      const index = Math.floor(target.y) * this.state.width + Math.floor(target.x);
      assigned.add(index);
      entity.order = 'move';
      if (entity.deployed) this.beginDeployment(entity, false);
      else if (!entity.deployment) entity.infantryAnimation = undefined;
      entity.targetId = null;
      entity.path = this.path(entity, target);
      this.memories.set(entity.id, { destination: target, attackMove: entity.type !== 'george' && attackMove, repath: 1, stuck: 0, idleTimer: 0, turningBeforeMove: !moving && !!this.defs[entity.type].rot });
    }
  }

  private moveEntity(entity: Entity, dt: number): void {
    const memory = this.memory(entity), def = this.defs[entity.type];
    if (entity.deployed || entity.deployment) return;
    if (memory.avoidancePoint && !entity.path.includes(memory.avoidancePoint)) memory.avoidancePoint = undefined;
    if (!entity.path.length) {
      if (entity.order === 'move' && memory.destination) {
        if (distance(entity, memory.destination) < 0.2) {
          const next = memory.waypoints?.shift();
          if (next) {
            const remaining = memory.waypoints;
            this.issueMove([entity], next, !!memory.attackMove);
            this.memory(entity).waypoints = remaining;
            return;
          }
          entity.order = 'guard';
          memory.destination = undefined;
          memory.attackMove = false;
        } else if (memory.repath <= 0) {
          entity.path = this.path(entity, memory.destination);
          memory.repath = 1.2;
        }
      }
      return;
    }
    const next = entity.path[0];
    // New buildings can invalidate an existing route; do not walk through them.
    if (!this.isPassable(Math.floor(next.x), Math.floor(next.y))) {
      entity.path = [];
      memory.repath = 0;
      return;
    }
    const dx = next.x - entity.x, dy = next.y - entity.y, d = Math.hypot(dx, dy);
    if ((def.category === 'vehicles' && def.rot || memory.turningBeforeMove) && d > 1e-6) {
      const heading = Math.atan2(dy, dx), delta = heading - entity.facing;
      if (Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta))) > Math.PI * 2 / 65536) {
        // A cell boundary can consume part of a frame before reaching a bend.
        // Finish that translation first; the next logic frame starts the turn.
        if (!entity.previous || distance(entity, entity.previous) <= 1e-6) memory.heading = heading;
        return;
      }
      memory.heading = heading;
      memory.turningBeforeMove = false;
    }
    const travel = def.speed * dt;
    const amount = Math.min(d, travel), nx = entity.x + (d > 0 ? dx / d * amount : 0), ny = entity.y + (d > 0 ? dy / d * amount : 0);
    // Cell-center spacing is also enforced during travel, not just at orders.
    if (memory.forceMove && def.crusher) {
      for (const other of this.state.entities) {
        if (other.side !== entity.side && other.hp > 0 && this.defs[other.type].category === 'infantry' && Math.hypot(other.x - nx, other.y - ny) < 0.48) {
          other.hp = 0;
          this.state.sides[entity.side].kills++;
        }
      }
    }
    const collision = this.state.entities.find(other => other.id !== entity.id && other.hp > 0 && !isBuilding(this.defs[other.type]) && Math.hypot(other.x - nx, other.y - ny) < 0.48);
    if (collision) {
      memory.stuck += dt;
      if (def.category === 'vehicles') {
        // Commit to a short clear detour. Re-aiming at the original path point
        // after every tiny sidestep made crowded traffic oscillate in place.
        if (memory.stuck > .15 && !memory.avoidancePoint && d > .001 && (memory.detourRetryAt ?? 0) <= this.state.time) {
          // A failed route search must not repeat every logic frame in a crowd.
          memory.detourRetryAt = this.state.time + .5;
          const forward = Math.atan2(dy, dx);
          for (const turn of [Math.PI / 3, -Math.PI / 3, Math.PI / 2, -Math.PI / 2, Math.PI * 2 / 3, -Math.PI * 2 / 3]) {
            const angle = forward + turn, detour = { x: entity.x + Math.cos(angle), y: entity.y + Math.sin(angle) };
            let clear = true, previous = { x: Math.floor(entity.x), y: Math.floor(entity.y) };
            for (let step = 1; step <= 10; step++) {
              const px = entity.x + (detour.x - entity.x) * step / 10, py = entity.y + (detour.y - entity.y) * step / 10;
              const tx = Math.floor(px), ty = Math.floor(py);
              if (!this.isPassable(tx, ty) || (tx !== previous.x && ty !== previous.y && (!this.isPassable(tx, previous.y) || !this.isPassable(previous.x, ty))) ||
                this.state.entities.some(other => other.id !== entity.id && other.hp > 0 && !isBuilding(this.defs[other.type]) && Math.hypot(other.x - px, other.y - py) < .49)) { clear = false; break; }
              previous = { x: tx, y: ty };
            }
            if (!clear) continue;
            const final = entity.path[entity.path.length - 1];
            const onward = this.path({ ...entity, ...detour }, final, true);
            if (!onward.length && distance(detour, final) > .2) break;
            entity.path = [detour, ...onward]; memory.avoidancePoint = detour; memory.stuck = 0;
            // A collision stopped translation before this new route was chosen.
            // Depart like a stationary order, rather than sliding while turning.
            memory.turningBeforeMove = !!def.rot;
            break;
          }
        }
      } else {
        // A* works in cells, while units may meet partway through one. A short
        // collision-safe sidestep lets opposing traffic separate before rerouting.
        if (memory.stuck > 0.15 && d > 0.001) {
          const forward = Math.atan2(dy, dx);
          for (const turn of [Math.PI / 3, -Math.PI / 3, Math.PI / 2, -Math.PI / 2, Math.PI * 2 / 3, -Math.PI * 2 / 3]) {
            const angle = forward + turn;
            const px = entity.x + Math.cos(angle) * amount, py = entity.y + Math.sin(angle) * amount;
            const tx = Math.floor(px), ty = Math.floor(py), sx = Math.floor(entity.x), sy = Math.floor(entity.y);
            if (!this.isPassable(tx, ty) || (tx !== sx && ty !== sy && (!this.isPassable(tx, sy) || !this.isPassable(sx, ty)))) continue;
            if (this.state.entities.some(other => other.id !== entity.id && other.hp > 0 && !isBuilding(this.defs[other.type]) && Math.hypot(other.x - px, other.y - py) < 0.48)) continue;
            entity.x = px;
            entity.y = py;
            memory.heading = angle;
            break;
          }
        }
      }
      if (memory.stuck > 0.6) {
        const final = entity.path[entity.path.length - 1];
        // Occupied destination may be a halted formation member or a dock user.
        const freeFinal = this.nearestOpen(final, entity.id, undefined, 3);
        if (freeFinal) {
          const replacement = this.path(entity, freeFinal, true);
          if (replacement.length) {
            entity.path = replacement; memory.avoidancePoint = undefined;
            if (def.category === 'vehicles') memory.turningBeforeMove = !!def.rot;
            if (entity.order === 'move') memory.destination = freeFinal;
          }
        }
        memory.repath = 0.7;
        memory.stuck = 0;
      }
      return;
    }
    memory.stuck = 0;
    entity.x = nx;
    entity.y = ny;
    if (d > 0.001) memory.heading = Math.atan2(dy, dx);
    if (d <= amount + 1e-6) {
      const reached = entity.path.shift();
      if (reached === memory.avoidancePoint) memory.avoidancePoint = undefined;
      // Spend the rest of this frame on the next path segment. Dropping that
      // fraction made every cell boundary a visible brake/acceleration pulse.
      if (entity.path.length && travel - amount > 1e-8 && def.speed > 0) this.moveEntity(entity, (travel - amount) / def.speed);
    }
  }

  private tickHarvester(entity: Entity, dt: number): void {
    const def = this.defs[entity.type], memory = this.memory(entity), capacity = def.capacity ?? 700;
    const refineries = this.state.entities.filter(e => e.side === entity.side && e.hp > 0 && !e.selling && (e.type === 'refinery' || e.type === 'refinery_soviet'));
    if (!refineries.length) { entity.path = []; memory.oreTarget = undefined; return; }
    if (entity.cargo >= capacity) entity.order = 'return';
    if (entity.order === 'return') {
      const nearest = refineries.sort((a, b) => this.distanceToEntity(entity, a) - this.distanceToEntity(entity, b))[0];
      if (this.distanceToEntity(entity, nearest) < 1.1) {
        entity.harvestTimer += dt;
        entity.path = [];
        if (entity.harvestTimer >= 1.1) {
          this.state.sides[entity.side].money += entity.cargo;
          entity.cargo = 0;
          entity.harvestTimer = 0;
          entity.order = 'harvest';
          memory.oreTarget = undefined;
          memory.repath = 0;
        }
      } else if (memory.repath <= 0 || !entity.path.length) {
        const dock = this.nearestReachableAround(entity, nearest);
        if (dock) entity.path = this.path(entity, dock, true);
        memory.repath = 2;
      }
      return;
    }
    entity.order = 'harvest';
    if (memory.oreTarget) {
      const tile = this.state.tiles[Math.floor(memory.oreTarget.y) * this.state.width + Math.floor(memory.oreTarget.x)];
      if (!tile || tile.ore <= 0) memory.oreTarget = undefined;
    }
    if (!memory.oreTarget && memory.repath <= 0) {
      const ore = this.findOre(entity);
      if (!ore) {
        if (entity.cargo > 0) entity.order = 'return';
        memory.repath = 3;
        return;
      }
      memory.oreTarget = ore;
      entity.path = this.path(entity, ore, true);
      memory.repath = 2;
    }
    if (!memory.oreTarget) return;
    if (distance(entity, memory.oreTarget) <= 0.75) {
      entity.harvesting = true;
      entity.path = [];
      entity.harvestTimer += dt;
      if (entity.harvestTimer >= 0.3) {
        entity.harvestTimer = 0;
        const tile = this.state.tiles[Math.floor(memory.oreTarget.y) * this.state.width + Math.floor(memory.oreTarget.x)];
        const amount = Math.min(tile.ore, capacity - entity.cargo, 24);
        tile.ore -= amount;
        entity.cargo += amount;
        if (entity.cargo >= capacity || tile.ore <= 0) {
          memory.oreTarget = undefined;
          memory.repath = 0;
          if (entity.cargo >= capacity) entity.order = 'return';
        }
      }
    } else if (!entity.path.length && memory.repath <= 0) {
      entity.path = this.path(entity, memory.oreTarget, true);
      memory.repath = 2;
      if (!entity.path.length) memory.oreTarget = undefined;
    }
  }

  private findOre(entity: Entity): Vec2 | undefined {
    const candidates: { point: Vec2; distance: number }[] = [];
    for (let y = 0; y < this.state.height; y++) {
      for (let x = 0; x < this.state.width; x++) {
        if (this.state.tiles[y * this.state.width + x].ore <= 0 || !this.isPassable(x, y)) continue;
        const point = { x: x + 0.5, y: y + 0.5 };
        const crowded = this.state.entities.some(other => {
          if (other.id === entity.id || !this.defs[other.type].harvester) return false;
          const reserved = this.memories.get(other.id)?.oreTarget;
          return distance(other, point) < 0.9 || (!!reserved && distance(reserved, point) < 0.9);
        });
        if (!crowded) candidates.push({ point, distance: distance(entity, point) });
      }
    }
    candidates.sort((a, b) => a.distance - b.distance);
    for (const candidate of candidates) {
      if (distance(entity, candidate.point) < 0.75 || this.path(entity, candidate.point).length) return candidate.point;
    }
    return undefined;
  }

  private tickCombat(entity: Entity, _dt: number): void {
    if (entity.type === 'george') return;
    const def = this.defs[entity.type], memory = this.memory(entity);
    if (entity.deployment) return;
    const range = entity.deployed ? def.deployedRange ?? def.range : def.range;
    const damage = entity.deployed ? def.deployedDamage ?? def.damage : def.damage;
    const fireRate = entity.deployed ? def.deployedFireRate ?? def.fireRate : def.fireRate;
    const verses = entity.deployed ? def.deployedVerses ?? def.verses : def.verses;
    if (memory.groundTarget) {
      const to = memory.groundTarget, center = this.center(entity);
      if (distance(center, to) > range) this.cancelFireIntent(entity, memory);
      if (distance(center, to) <= range) {
        entity.path = [];
        const aim = Math.atan2(to.y - center.y, to.x - center.x);
        if (def.turret) memory.turretAim = aim; else memory.heading = aim;
        if (entity.cooldown <= 0 && this.isAimed(entity, aim)) {
          const hit = this.state.entities.find(e => e.id !== entity.id && e.hp > 0 && this.distanceToEntity(to, e) < 0.5);
          this.fireProjectile(entity, to, hit, damage, verses, fireRate);
        }
      } else if (!isBuilding(def) && !entity.deployed && memory.repath <= 0) {
        const target = this.nearestOpen(to, entity.id, undefined, 8);
        if (target) entity.path = this.path(entity, target, true);
        memory.repath = 0.8;
      }
      return;
    }
    let target = entity.targetId === null ? undefined : this.state.entities.find(other => other.id === entity.targetId && other.hp > 0 && !other.selling && (memory.forceFire || other.side !== entity.side || entity.type === 'engineer' && isBuilding(this.defs[other.type]) && other.hp < other.maxHp));
    // Straight move orders are obeyed; attack-move is the explicit engage option.
    if (entity.order === 'move' && !memory.attackMove) return;
    if (!target && entity.targetId !== null) {
      this.cancelFireIntent(entity, memory);
      entity.targetId = null;
    }
    if (target && !this.visibleTo(target, entity.side)) {
      this.cancelFireIntent(entity, memory);
      entity.targetId = null;
      target = undefined;
      entity.path = [];
      if (entity.order === 'attack') entity.order = 'guard';
    }
    if (!target && entity.type !== 'engineer' && memory.idleTimer <= 0) {
      memory.idleTimer = 0.35;
      const candidates = this.state.entities.filter(other => other.side >= 0 && other.side !== entity.side && other.hp > 0 && !other.selling && this.visibleTo(other, entity.side) && this.distanceToEntity(entity, other) <= (isBuilding(def) || def.harvester || entity.deployed || memory.holdPosition ? range : def.sight));
      candidates.sort((a, b) => this.distanceToEntity(entity, a) - this.distanceToEntity(entity, b));
      target = candidates[0];
      entity.targetId = target?.id ?? null;
    }
    if (!target) {
      this.cancelFireIntent(entity, memory);
      if (entity.order === 'attack') entity.order = 'guard';
      return;
    }
    const d = this.distanceToEntity(this.center(entity), target);
    if (d > range) this.cancelFireIntent(entity, memory);
    if (entity.type === 'engineer' && isBuilding(this.defs[target.type]) && d <= 0.9) {
      const repairing = target.side === entity.side;
      if (target.type === 'tech_oil' && target.side === -1) this.state.sides[entity.side].money += 1000;
      target.side = entity.side;
      target.selected = false;
      target.hp = repairing ? target.maxHp : Math.max(target.hp, target.maxHp * 0.3);
      target.targetId = null;
      entity.hp = 0;
      this.removeEntity(entity, false);
      this.notify(`${this.defs[target.type].name} ${repairing ? 'repaired' : 'captured'}`, entity.side === 0 ? 'success' : 'warning');
      this.updatePower();
      return;
    }
    if (d <= range && entity.type !== 'engineer') {
      // Harvesters continue their economic route while their gun defends them.
      if (!def.harvester) entity.path = [];
      const center = this.center(entity), to = this.center(target);
      const aim = Math.atan2(to.y - center.y, to.x - center.x);
      if (def.turret) memory.turretAim = aim; else memory.heading = aim;
      if (entity.cooldown > 0 || damage <= 0 || !this.isAimed(entity, aim)) return;
      this.fireProjectile(entity, to, target, damage, verses, fireRate);
      if (target.hp <= 0) entity.targetId = null;
    } else if (!isBuilding(def) && !def.harvester && !entity.deployed && !memory.holdPosition && memory.repath <= 0) {
      this.cancelFireIntent(entity, memory);
      // Guard units pursue within their sight but do not run across the map.
      if (entity.order !== 'attack' && d > def.sight + 1) { entity.targetId = null; return; }
      const firingPoint = this.nearestFiringPosition(entity, target, entity.type === 'engineer' ? 0.7 : range * 0.85);
      if (firingPoint) entity.path = this.path(entity, firingPoint, true);
      memory.repath = 0.8;
    }
  }

  private cancelFireIntent(entity: Entity, memory: UnitMemory): void {
    memory.fireIntentAt = undefined;
    if (!entity.deployment && entity.infantryAnimation && ['FireUp', 'FireFly', 'DeployedFire'].includes(entity.infantryAnimation.sequence)) entity.infantryAnimation = undefined;
  }

  private animationInterval(definition: AnimationDefinition): number {
    return definition.normalized ? nativeNormalizedInterval(definition.ticksPerFrame, this.nativeGameSpeedIndex) : definition.ticksPerFrame;
  }
  private beginDeployment(entity: Entity, target: boolean): void {
    entity.deployed = target;
    entity.deployment = { startedAt: this.state.time, target };
    entity.infantryAnimation = { sequence: target ? 'Deploy' : 'Undeploy', startedAt: this.state.time };
  }
  private updateInfantryAnimation(entity: Entity): void {
    if (!entity.infantryAnimation) return;
    const { sequence, startedAt } = entity.infantryAnimation;
    const definition = this.infantryAnimations[this.defs[entity.type].sprite]?.sequences[sequence];
    if (!definition) throw new Error(`Missing original infantry timing: ${entity.type} ${sequence}`);
    if (this.state.time + 1e-9 < startedAt + definition.frames * this.animationInterval(definition) * STEP) return;
    entity.infantryAnimation = undefined;
    if (sequence === 'Deploy' || sequence === 'Undeploy') entity.deployment = undefined;
  }
  private cancelInfantryIdle(entity: Entity): void {
    const memory = this.memory(entity);
    if (entity.infantryAnimation?.sequence.startsWith('Idle')) entity.infantryAnimation = undefined;
    if (memory.idleActionTurning) { memory.heading = entity.facing; memory.bodyTurn = undefined; }
    memory.idleActionPending = undefined; memory.idleActionTurning = false; memory.idleActionAt = undefined;
  }
  private updateInfantryIdle(entity: Entity): void {
    const def = this.defs[entity.type];
    // Airborne rocketeers already use Hover; their grounded Idle frames do not
    // belong in flight. Custom infantry has its own authored animation system.
    if (def.category !== 'infantry' || entity.type === 'rocketeer' || entity.type === 'george') return;
    const memory = this.memory(entity), definition = this.infantryAnimations[def.sprite];
    const eligible = !entity.selected && entity.hp > 0 && !entity.deployed && !entity.deployment && !entity.path.length && entity.targetId === null
      && !memory.groundTarget && memory.fireIntentAt === undefined && ['idle', 'guard'].includes(entity.order)
      && (!entity.previous || distance(entity, entity.previous) < 1e-7);
    if (!eligible) { this.cancelInfantryIdle(entity); return; }
    if (!definition?.sequences.Idle1 || !definition.sequences.Idle2) return;
    const frequency = definition.idleFrequency ?? .15;
    if (!Number.isFinite(frequency) || frequency <= 0) return;
    const random = (min: number, max: number) => {
      let state = memory.idleActionRandom ?? (Math.imul(entity.id, 0x9e3779b9) >>> 0);
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      memory.idleActionRandom = state >>> 0;
      return min + memory.idleActionRandom % (max - min + 1);
    };
    // Retail game.exe 0x503e00: random delay [450,1800] * the rules.ini
    // IdleActionFrequency. A separate stream keeps cosmetic idles out of combat.
    if (memory.idleActionAt === undefined) memory.idleActionAt = this.state.time + random(Math.floor(frequency * 450), Math.floor(frequency * 1800)) * STEP;
    if (entity.infantryAnimation) return;
    if (memory.idleActionPending) {
      const delta = (memory.heading ?? entity.facing) - entity.facing;
      if (Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta))) > Math.PI * 2 / 65536) return;
      entity.infantryAnimation = { sequence: memory.idleActionPending, startedAt: this.state.time };
      memory.idleActionPending = undefined; memory.idleActionTurning = false;
      return;
    }
    if (this.state.time + 1e-9 < memory.idleActionAt) return;
    memory.idleActionAt = this.state.time + random(Math.floor(frequency * 450), Math.floor(frequency * 1800)) * STEP;
    // Original switch at 0x5040f8: 3/11 each Idle1/Idle2, 4/11 turn, 1/11 wait.
    const choice = random(0, 10), sequence = [3, 4, 5].includes(choice) ? 'Idle1' : [1, 2, 7].includes(choice) ? 'Idle2' : undefined;
    if (sequence) {
      const facing = definition.sequences[sequence].facing;
      memory.heading = facing === undefined ? entity.facing : (5 - facing) * Math.PI / 4;
      memory.idleActionPending = sequence; memory.idleActionTurning = true;
    } else if (choice !== 0) { memory.heading = random(0, 7) * Math.PI / 4; memory.idleActionTurning = true; }
  }
  private randomCombatValue(): number {
    // Stable match randomness for reproducible simulation; this does not claim
    // the original executable's seed or complete PRNG stream.
    let value = this.combatRandomState;
    value ^= value << 13; value ^= value >>> 17; value ^= value << 5;
    this.combatRandomState = value >>> 0;
    return this.combatRandomState;
  }
  private randomCombatFrames(min: number, max: number): number { return min + this.randomCombatValue() % (max - min + 1); }
  private addAnimation(animation: string, point: Vec2, side: number, kind: 'impact' | 'explosion', damage?: number): void {
    const name = animation.toUpperCase(), definition = this.effectAnimations[name];
    if (!definition) throw new Error(`Missing original animation timing: ${name}`);
    const animationTicksPerFrame = this.animationInterval(definition), life = definition.frames * animationTicksPerFrame * STEP;
    this.state.effects.push({ kind, ...point, side, animation: name, animationTicksPerFrame, startedAt: this.state.time, life, maxLife: life, damage });
  }
  private fireProjectile(entity: Entity, to: Vec2, target: Entity | undefined, damage: number, verses: number[] | undefined, fireRate: number): void {
    if (entity.type === 'george') return;
    damage *= rankMultiplier(entity);
    const def = this.defs[entity.type], memory = this.memory(entity);
    if (def.category === 'infantry') {
      const sequence = entity.deployed ? 'DeployedFire' : entity.type === 'rocketeer' ? 'FireFly' : 'FireUp';
      const infantry = this.infantryAnimations[def.sprite], definition = infantry?.sequences[sequence];
      if (!definition) throw new Error(`Missing original infantry timing: ${def.sprite} ${sequence}`);
      if (memory.fireIntentAt === undefined) {
        memory.fireIntentAt = this.state.time;
        entity.infantryAnimation = { sequence, startedAt: this.state.time };
      }
      if (this.state.time + 1e-9 < memory.fireIntentAt + infantry.fireFrame * this.animationInterval(definition) * STEP) return;
      memory.fireIntentAt = undefined;
    }
    entity.firedAt = this.state.time;
    const burst = def.burst ?? 1, nextBurstIndex = (memory.burstIndex ?? 0) + 1;
    entity.cooldown = nextBurstIndex < burst ? this.randomCombatFrames(3, 5) * STEP : fireRate + this.randomCombatFrames(0, 2) * STEP;
    memory.burstIndex = nextBurstIndex % burst;
    this.state.effects.push({ kind: 'shot', ...this.center(entity), to: { ...to }, life: .16, maxLife: .16, side: entity.side, startedAt: this.state.time, damage });
    if (target) this.damageTarget(entity, target, damage, verses);
    if (def.impact) this.addAnimation(def.impact, to, entity.side, 'impact', damage);
  }

  private isAimed(entity: Entity, target: number): boolean {
    if (!this.defs[entity.type].turret) return true;
    const delta = target - (entity.turretFacing ?? entity.facing);
    return Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta))) <= Math.PI / 32;
  }

  private updateFacing(entity: Entity): void {
    const memory = this.memory(entity), def = this.defs[entity.type];
    const body = turnFacing(entity.facing, memory.heading ?? entity.facing, def.rot ?? 0, memory.bodyTurn);
    entity.facing = body.facing; memory.bodyTurn = body.turn;
    if (def.turret) {
      if (!entity.targetId && !memory.groundTarget && entity.path.length) memory.turretAim = memory.heading;
      const turret = turnFacing(entity.turretFacing ?? entity.facing, memory.turretAim ?? entity.turretFacing ?? entity.facing, def.rot ?? 0, memory.turretTurn);
      entity.turretFacing = turret.facing; memory.turretTurn = turret.turn;
    }
  }

  private damageTarget(attacker: Entity, target: Entity, damage: number, verses?: number[]): void {
    const armorOrder = ['none', 'flak', 'plate', 'light', 'medium', 'heavy', 'wood', 'steel', 'concrete', 'special_1', 'special_2'];
    const multiplier = verses?.[armorOrder.indexOf(this.defs[target.type].armor ?? 'none')] ?? 1;
    target.hp = Math.max(0, target.hp - damage * multiplier / rankMultiplier(target));
    if (target.hp <= 0 && target.side !== attacker.side) this.state.sides[attacker.side].kills++;
  }

  private nearestFiringPosition(entity: Entity, target: Entity, range: number): Vec2 | undefined {
    const c = this.center(target), radius = Math.ceil(range + Math.max(...this.defs[target.type].footprint));
    const candidates: Vec2[] = [];
    for (let y = Math.floor(c.y) - radius; y <= Math.floor(c.y) + radius; y++)
      for (let x = Math.floor(c.x) - radius; x <= Math.floor(c.x) + radius; x++) {
        const p = { x: x + 0.5, y: y + 0.5 };
        if (this.isPassable(x, y) && !this.mobileOccupies(x, y, entity.id) && this.distanceToEntity(p, target) <= range) candidates.push(p);
      }
    candidates.sort((a, b) => distance(entity, a) - distance(entity, b));
    for (const candidate of candidates.slice(0, 32))
      if (distance(entity, candidate) < 0.2 || this.path(entity, candidate).length) return candidate;
    return undefined;
  }

  private updateAI(): void {
    const side = this.state.sides[1];
    if (side.defeated) return;
    const owns = (type: string) => this.state.entities.some(e => e.side === 1 && e.type === type && e.hp > 0);
    const count = (type: string) => this.state.entities.filter(e => e.side === 1 && e.type === type && e.hp > 0).length;
    for (const category of ['structures', 'defenses'] as Category[]) {
      const ready = side.queues[category][0];
      if (ready?.ready) {
        const location = this.findAIPlacement(ready.type);
        if (location) this.place(ready.type, location.x, location.y, 1);
      }
    }
    if (!side.queues.structures.length) {
      let wanted: string | undefined;
      if (!owns('power_soviet') || side.power - side.powerUsed < 60) wanted = 'power_soviet';
      else if (!owns('refinery_soviet')) wanted = 'refinery_soviet';
      else if (!owns('barracks_soviet')) wanted = 'barracks_soviet';
      else if (!owns('warfactory_soviet')) wanted = 'warfactory_soviet';
      else if (!owns('radar_soviet') && count('warminer') >= 2) wanted = 'radar_soviet';
      else if (count('refinery_soviet') < 2 && side.money > 3200) wanted = 'refinery_soviet';
      if (wanted && this.canBuild(wanted, 1).ok) this.build(wanted, 1);
    }
    if (count('sentry') < 3 && !side.queues.defenses.length && side.money > 2200 && this.canBuild('sentry', 1).ok) this.build('sentry', 1);
    const army = this.state.entities.filter(e => e.side === 1 && !isBuilding(this.defs[e.type]) && !this.defs[e.type].harvester);
    const reserve = count('warminer') < 2 ? 1600 : 1100;
    if (side.money > reserve && side.queues.infantry.length < 2 && army.length < 26 && this.canBuild('conscript', 1).ok) this.build('conscript', 1);
    if (side.queues.vehicles.length < 1 && owns('warfactory_soviet')) {
      const wanted = count('warminer') < 2 ? 'warminer' : this.wave % 3 === 2 && count('flak') < 3 ? 'flak' : 'rhino';
      if (army.length < 28 && side.money > (wanted === 'warminer' ? 1400 : 1100) && this.canBuild(wanted, 1).ok) this.build(wanted, 1);
    }
    // Every wave assembles a fresh task force; previous attackers keep fighting.
    if (this.automaticSovietWaves && this.state.time >= this.nextAttack) {
      const attackers = army.filter(e => e.order === 'guard' || e.order === 'idle');
      if (attackers.length >= 4) {
        this.wave++;
        const playerBase = this.state.entities.find(e => e.side === 0 && isBuilding(this.defs[e.type]) && !this.defs[e.type].mapOnly && e.hp > 0);
        const destination = this.nativeMap && playerBase ? this.center(playerBase) : { x: 16 + (this.wave % 3) * 2, y: 42 };
        this.issueMove(attackers.slice(0, Math.min(12, 4 + this.wave * 2)), destination, true);
        this.notify('Warning: Soviet strike force approaching.', 'warning');
      }
      this.nextAttack = this.state.time + Math.max(45, 85 - this.wave * 6);
    }
    // Paid repairs keep AI finances honest; attack pressure can exhaust its bank.
    if (side.money > 300) {
      for (const e of this.state.entities)
        if (e.side === 1 && isBuilding(this.defs[e.type]) && e.hp < e.maxHp * 0.8) this.repairs.add(e.id);
    }
  }

  private findAIPlacement(type: string): Vec2 | undefined {
    const nativeStart = this.nativeMap?.starts.find(s => s.index === 3);
    const anchor = nativeStart ?? (type === 'sentry' ? { x: 42, y: 25 } : { x: 47, y: 17 });
    const candidates: Vec2[] = [];
    for (let y = nativeStart ? Math.max(1, anchor.y - 22) : 4; y < (nativeStart ? Math.min(this.state.height - 1, anchor.y + 23) : 31); y++)
      for (let x = nativeStart ? Math.max(1, anchor.x - 22) : 34; x < (nativeStart ? Math.min(this.state.width - 1, anchor.x + 23) : 59); x++) if (this.canPlace(type, x, y, 1)) candidates.push({ x, y });
    candidates.sort((a, b) => distance(a, anchor) - distance(b, anchor));
    return candidates[0];
  }

  private spawn(type: string, side: number, x: number, y: number): Entity {
    const def = this.defs[type];
    const entity: Entity = {
      id: this.nextId++, type, side, x, y, hp: def.hp, maxHp: def.hp, facing: side === 0 ? -Math.PI / 4 : Math.PI * 0.75,
      path: [], targetId: null, cooldown: 0, order: def.harvester ? 'harvest' : 'guard', cargo: 0, harvestTimer: 0, selected: false, anim: 0,
      previous: { x, y }, previousFacing: side === 0 ? -Math.PI / 4 : Math.PI * .75,
      ...(def.turret ? { turretFacing: side === 0 ? -Math.PI / 4 : Math.PI * .75, previousTurretFacing: side === 0 ? -Math.PI / 4 : Math.PI * .75 } : {}),
    };
    this.state.entities.push(entity);
    if (side === 1 && def.producer?.some(category => category === 'infantry' || category === 'vehicles'))
      entity.rally = this.nativeMap ? { x: x + def.footprint[0] / 2, y: y + def.footprint[1] + 2.5 } : { x: 46.5, y: 27.5 };
    return entity;
  }

  private spawnFrom(producer: Entity, type: string): Entity | undefined {
    const def = this.defs[producer.type];
    const target = { x: producer.x + def.footprint[0] * 0.5, y: producer.y + def.footprint[1] + 0.5 };
    const location = this.nearestOpen(target, -1, undefined, 7);
    if (!location) return undefined;
    return this.spawn(type, producer.side, location.x, location.y);
  }

  private removeEntity(entity: Entity, explosion: boolean): void {
    if (explosion) {
      const choices = this.defs[entity.type].deathAnimations;
      if (choices?.length) this.addAnimation(choices[this.randomCombatValue() % choices.length], this.center(entity), entity.side, 'explosion');
      else this.state.effects.push({ kind: 'explosion', ...this.center(entity), life: 0.65, maxLife: 0.65, side: entity.side });
      if (entity.side === 0) this.notify(`${this.defs[entity.type].name} lost`, 'warning');
    }
    this.state.entities = this.state.entities.filter(e => e.id !== entity.id);
    this.memories.delete(entity.id);
    this.repairs.delete(entity.id);
    for (const other of this.state.entities) if (other.targetId === entity.id) other.targetId = null;
  }

  private rebuildBlocked(): void {
    this.blocked = new Uint8Array(this.state.width * this.state.height);
    for (const entity of this.state.entities) {
      const def = this.defs[entity.type];
      if (!isBuilding(def) || entity.hp <= 0) continue;
      for (let y = Math.floor(entity.y); y < entity.y + def.footprint[1]; y++)
        for (let x = Math.floor(entity.x); x < entity.x + def.footprint[0]; x++)
          if (x >= 0 && y >= 0 && x < this.state.width && y < this.state.height) this.blocked[y * this.state.width + x] = 1;
    }
  }

  private isPassable(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.state.width || y >= this.state.height) return false;
    const index = y * this.state.width + x, terrain = this.state.tiles[index].terrain;
    return !this.blocked[index] && terrain !== 'water' && terrain !== 'rock';
  }

  private mobileOccupies(x: number, y: number, except: number): boolean {
    return this.state.entities.some(e => e.id !== except && e.hp > 0 && !isBuilding(this.defs[e.type]) && Math.floor(e.x) === x && Math.floor(e.y) === y);
  }

  private path(entity: Entity, destination: Vec2, avoidUnits = false): Vec2[] {
    const occupied = new Set<number>();
    if (avoidUnits)
      for (const other of this.state.entities)
        if (other.id !== entity.id && other.hp > 0 && !isBuilding(this.defs[other.type])) occupied.add(Math.floor(other.y) * this.state.width + Math.floor(other.x));
    return findPath(this.state.width, this.state.height, entity, destination, (x, y) => this.isPassable(x, y) && !occupied.has(y * this.state.width + x));
  }

  private nearestOpen(destination: Vec2, entityId: number, reserved?: Set<number>, maxRadius = 10): Vec2 | undefined {
    const cx = Math.floor(destination.x), cy = Math.floor(destination.y);
    for (let radius = 0; radius <= maxRadius; radius++) {
      const points: Vec2[] = [];
      for (let dy = -radius; dy <= radius; dy++)
        for (let dx = -radius; dx <= radius; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
          const x = cx + dx, y = cy + dy;
          if (!this.isPassable(x, y) || reserved?.has(y * this.state.width + x) || this.mobileOccupies(x, y, entityId)) continue;
          points.push({ x: x + 0.5, y: y + 0.5 });
        }
      if (points.length) return points.sort((a, b) => distance(a, destination) - distance(b, destination))[0];
    }
    return undefined;
  }

  private nearestReachableAround(entity: Entity, building: Entity): Vec2 | undefined {
    const def = this.defs[building.type], points: Vec2[] = [], bx = Math.floor(building.x), by = Math.floor(building.y);
    for (let y = by - 1; y <= by + def.footprint[1]; y++)
      for (let x = bx - 1; x <= bx + def.footprint[0]; x++)
        if (this.isPassable(x, y) && !this.mobileOccupies(x, y, entity.id)) points.push({ x: x + 0.5, y: y + 0.5 });
    points.sort((a, b) => distance(entity, a) - distance(entity, b));
    return points.find(p => distance(entity, p) < 0.2 || this.path(entity, p, true).length > 0);
  }

  private updateVision(): void {
    for (const fog of this.vision) fog.fill(0);
    for (const entity of this.state.entities) {
      if (entity.hp <= 0 || entity.selling) continue;
      const radius = this.defs[entity.type].sight, center = this.center(entity), fog = this.vision[entity.side];
      if (!fog) continue;
      for (let y = Math.max(0, Math.floor(center.y - radius)); y <= Math.min(this.state.height - 1, Math.ceil(center.y + radius)); y++)
        for (let x = Math.max(0, Math.floor(center.x - radius)); x <= Math.min(this.state.width - 1, Math.ceil(center.x + radius)); x++)
          if (Math.hypot(x + 0.5 - center.x, y + 0.5 - center.y) <= radius) fog[y * this.state.width + x] = 1;
    }
    for (let i = 0; i < this.state.fog.length; i++) if (this.state.fog[i]) this.state.explored[i] = 1;
  }

  private visibleTo(entity: Entity, side: number): boolean {
    const fog = this.vision[side], def = this.defs[entity.type];
    if (!fog) return false;
    // The renderer reveals a structure as soon as any foundation cell is seen.
    // Center-only checks rejected visible buildings at an engineer's sight edge.
    if (isBuilding(def)) {
      for (let y = Math.floor(entity.y); y < entity.y + def.footprint[1]; y++)
        for (let x = Math.floor(entity.x); x < entity.x + def.footprint[0]; x++)
          if (x >= 0 && y >= 0 && x < this.state.width && y < this.state.height && fog[y * this.state.width + x]) return true;
      return false;
    }
    const c = this.center(entity);
    return !!fog[Math.floor(c.y) * this.state.width + Math.floor(c.x)];
  }

  private checkVictory(): void {
    if (this.state.winner !== null) return;
    for (const side of this.state.sides) {
      if (!this.state.entities.some(e => e.side === side.id && e.hp > 0 && isBuilding(this.defs[e.type]) && !this.defs[e.type].mapOnly)) side.defeated = true;
    }
    const surviving = this.state.sides.filter(side => !side.defeated);
    if (surviving.length < this.state.sides.length) {
      this.state.winner = surviving[0]?.id ?? 1;
      this.notify(this.state.winner === 0 ? 'Mission accomplished. Soviet base eliminated.' : 'Mission failed. Your base has been destroyed.', this.state.winner === 0 ? 'success' : 'warning');
    }
  }

  private commandable(ids: number[], side: number): Entity[] {
    const set = new Set(ids);
    return this.state.entities.filter(e => e.side === side && e.hp > 0 && !e.selling && set.has(e.id));
  }
  private center(entity: Entity): Vec2 {
    const def = this.defs[entity.type];
    return isBuilding(def) ? { x: entity.x + def.footprint[0] / 2, y: entity.y + def.footprint[1] / 2 } : { x: entity.x, y: entity.y };
  }
  private distanceToEntity(point: Vec2, entity: Entity): number {
    const def = this.defs[entity.type];
    if (!isBuilding(def)) return distance(point, entity);
    return Math.hypot(Math.max(entity.x - point.x, point.x - (entity.x + def.footprint[0]), 0), Math.max(entity.y - point.y, point.y - (entity.y + def.footprint[1]), 0));
  }
  private memory(entity: Entity): UnitMemory {
    let memory = this.memories.get(entity.id);
    if (!memory) { memory = { repath: 0, stuck: 0, idleTimer: 0 }; this.memories.set(entity.id, memory); }
    return memory;
  }
  private constrain(point: Vec2): Vec2 {
    return { x: clamp(point.x, 0, this.state.width - 0.001), y: clamp(point.y, 0, this.state.height - 0.001) };
  }
  private notify(text: string, kind: 'info' | 'warning' | 'success'): void {
    this.state.events.push({ id: this.nextEventId++, text, kind, time: this.state.time });
    if (this.state.events.length > 40) this.state.events.shift();
  }
  private addOrderEffect(x: number, y: number, side: number): void {
    // Supplied RA2 DrawActionLines uses a shared 25-logic-frame feedback timer.
    this.commandFeedbackTicks = 25;
    this.state.effects.push({ kind: 'order', x, y, life: 0.7, maxLife: 0.7, side });
  }
}
