import type { NativeMap } from './maps/nativeMap';
import type { OreMine } from './oreMines';

export type Category = 'structures' | 'defenses' | 'infantry' | 'vehicles';
export type Vec2 = { x: number; y: number };
export interface UnitDef {
  id: string; name: string; category: Category; cost: number; buildTime: number;
  hp: number; speed: number; damage: number; range: number; fireRate: number;
  sight: number; footprint: [number, number]; power: number; requires: string[];
  description: string; sprite: string; cameo: string; faction: 'allied' | 'soviet' | 'both';
  harvester?: boolean; capacity?: number; producer?: Category[];
  armor?: string; verses?: number[]; burst?: number;
  impact?: string; deathAnimations?: string[];
  deployedDamage?: number; deployedRange?: number; deployedFireRate?: number; deployedVerses?: number[];
  crusher?: boolean; nativeSpeed?: number; rot?: number; turret?: boolean;
  mapOnly?: boolean;
  factory?: string;
  movement?: 'land' | 'air' | 'water' | 'amphibious' | 'teleport';
  targets?: ('land' | 'air' | 'water' | 'infantry')[];
  powered?: boolean; buildLimit?: number;
  adjacent?: number; baseNormal?: boolean;
  passengers?: number; infantryOnly?: boolean; size?: number;
  ability?: 'spy' | 'tanya' | 'chrono' | 'mirage' | 'prism' | 'carrier';
  superweapon?: 'chronosphere' | 'weather';
  recharge?: number; ammo?: number;
}
export interface Entity extends Vec2 {
  id: number; type: string; side: number; hp: number; maxHp: number;
  facing: number; path: Vec2[]; targetId: number | null; cooldown: number;
  order: 'idle' | 'move' | 'attack' | 'harvest' | 'return' | 'guard';
  cargo: number; harvestTimer: number; harvesting?: boolean; selected: boolean;
  rally?: Vec2; anim: number; deployed?: boolean;
  firedAt?: number;
  infantryAnimation?: { sequence: string; startedAt: number };
  deployment?: { startedAt: number; target: boolean };
  selling?: { startedAt: number; duration: number };
  constructing?: { startedAt: number; duration: number };
  passengers?: Entity[]; transportId?: number;
  recharge?: number; ammo?: number; rearm?: number; homeId?: number;
  disabledUntil?: number; infiltrated?: boolean;
  revealed?: boolean;
  previous?: Vec2; previousFacing?: number; turretFacing?: number; previousTurretFacing?: number;
  nativeType?: string;
  rank?: 0 | 1 | 2;
  promotedAt?: number;
  inspection?: { targetId: number; elapsed: number };
  inspectedBy?: number;
  inspectionProgress?: number;
}
export interface Tile { terrain: 'grass' | 'water' | 'rock' | 'road' | 'sand'; ore: number; variant: number; nativeArt?: { tileIndex: number; subTile: number; terrain: Tile['terrain'] } }
export interface BuildItem { id: number; type: string; progress: number; spent: number; ready: boolean; paused: boolean; blockedFunds?: boolean; blockedPrerequisite?: string }
export interface Side {
  id: number; name: string; faction: 'allied' | 'soviet'; color: string;
  money: number; power: number; powerUsed: number; kills: number;
  queues: Record<Category, BuildItem[]>; defeated: boolean;
}
export interface AnimationDefinition { frames: number; ticksPerFrame: number; normalized?: boolean; facing?: number }
export interface InfantryAnimationDefinition { sequences: Record<string, AnimationDefinition>; fireFrame: number; idleFrequency?: number }
export interface Effect extends Vec2 {
  kind: 'shot' | 'impact' | 'explosion' | 'order' | 'smoke'; life: number; maxLife: number; to?: Vec2; side?: number;
  sourceType?: string; passengerType?: string; deployed?: boolean; airTarget?: boolean;
  animation?: string; animationTicksPerFrame?: number; startedAt?: number; damage?: number;
}
export interface GameEvent { id: number; text: string; kind: 'info' | 'warning' | 'success'; time: number; sound?: string }
export interface GameState {
  nativeMap?: NativeMap;
  oreMines?: OreMine[];
  width: number; height: number; tiles: Tile[]; entities: Entity[]; sides: Side[];
  time: number; paused: boolean; speed: number; winner: number | null;
  effects: Effect[]; events: GameEvent[]; fog: Uint8Array; explored: Uint8Array;
}
export interface GameAPI {
  state: GameState; defs: Record<string, UnitDef>;
  readonly interpolation: number;
  readonly nativeGameSpeedIndex: number;
  setGameSpeed(speed: number): void;
  setAnimationDefinitions(effects: Record<string, AnimationDefinition>, infantry: Record<string, InfantryAnimationDefinition>): void;
  commandPath(id: number): { points: Vec2[]; attack: boolean } | undefined;
  tick(dt: number): void;
  build(type: string, side?: number): boolean;
  cancelBuild(category: Category, side?: number, itemId?: number): void;
  toggleBuildPause(category: Category, side?: number): void;
  canBuild(type: string, side?: number): { ok: boolean; reason: string };
  canPlace(type: string, x: number, y: number, side?: number): boolean;
  place(type: string, x: number, y: number, side?: number): boolean;
  select(ids: number[], additive?: boolean): void;
  orderMove(ids: number[], x: number, y: number, attackMove?: boolean): void;
  orderAttack(ids: number[], targetId: number, force?: boolean): void;
  orderForceFire(ids: number[], x: number, y: number): void;
  orderForceMove(ids: number[], x: number, y: number): void;
  orderGuard(ids: number[], x: number, y: number, escortId?: number): void;
  orderWaypoints(ids: number[], points: Vec2[]): void;
  guard(ids: number[]): void;
  scatter(ids: number[]): void;
  deploy(ids: number[]): void;
  orderHarvest(ids: number[], x: number, y: number): void;
  stop(ids: number[]): void;
  enterTransport?(ids: number[], targetId: number): boolean;
  activateSuperweapon?(type: 'chronosphere' | 'weather', destination: Vec2, source?: Vec2, side?: number): boolean;
  sell(id: number): boolean;
  repair(id: number): boolean;
  canRepair(id: number): boolean;
  restart(): void;
  loadNativeMap(map: NativeMap): void;
}
