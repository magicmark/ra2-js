import { vi } from 'vitest';
import { Game } from '../../src/game/Game';
import type { Entity, UnitDef } from '../../src/game/types';
import type { OriginalSprite, SpriteProvider } from '../../src/render/Renderer';

export function entity(overrides: Partial<Entity> = {}): Entity {
  return {
    id: 1,
    type: 'gi',
    x: 0,
    y: 0,
    side: 0,
    hp: 100,
    maxHp: 100,
    facing: 0,
    path: [],
    targetId: null,
    cooldown: 0,
    order: 'guard',
    cargo: 0,
    harvestTimer: 0,
    selected: false,
    anim: 0,
    ...overrides,
  };
}

export function definition(overrides: Partial<UnitDef> = {}): UnitDef {
  return {
    id: 'gi',
    name: 'Fixture',
    category: 'infantry',
    cost: 0,
    buildTime: 0,
    hp: 100,
    speed: 0,
    damage: 0,
    range: 0,
    fireRate: 0,
    sight: 0,
    footprint: [1, 1],
    power: 0,
    requires: [],
    description: '',
    sprite: '',
    cameo: '',
    faction: 'allied',
    ...overrides,
  };
}

export function spriteProvider(overrides: Partial<SpriteProvider> = {}): SpriteProvider {
  return {
    ready: true,
    setTheater: vi.fn(),
    getBuildingHeight: () => 2,
    getHarvestSprite: () => null,
    getPipSprite: () => null,
    getSprite: () => null,
    getInfantryFrame: () => null,
    getInfantrySequence: () => null,
    getAnimationSprite: () => null,
    getAnimationOpacity: () => 1,
    getVehicleSprite: () => null,
    getBuildingSprite: () => null,
    getTerrain: () => null,
    getOverlay: () => null,
    ...overrides,
  };
}

export function canvas(width = 640, height = 480): HTMLCanvasElement {
  // SAFETY: renderer tests replace GL; their canvas access is limited to these dimensions and bounds.
  return {
    width,
    height,
    getBoundingClientRect: () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      toJSON: () => ({}),
    }),
  } as HTMLCanvasElement;
}

export function sprite(
  width: number,
  height: number,
  extras: Partial<OriginalSprite> = {},
): OriginalSprite {
  return { source: canvas(width, height), width, height, ...extras };
}

export function tinyGame() {
  const game = new Game({ ai: false });
  Object.assign(game.state, {
    width: 1,
    height: 1,
    tiles: [{ terrain: 'grass', variant: 0, ore: 0 }],
    entities: [],
    effects: [],
    fog: new Uint8Array(1),
    explored: new Uint8Array(1),
  });
  Object.defineProperty(game, 'defs', { value: {} });
  Object.defineProperty(game, 'interpolation', { value: 1, writable: true });

  return game;
}

export function uiActions(
  overrides: Partial<import('../../src/ui/UI').UIActions> = {},
): import('../../src/ui/UI').UIActions {
  return {
    onPlace: vi.fn(),
    onCenter: vi.fn(),
    onZoom: vi.fn(),
    onMode: vi.fn(),
    onSound: vi.fn(),
    onAssetRetry: vi.fn(),
    onAssetImport: vi.fn(),
    onRestart: vi.fn(),
    ...overrides,
  };
}
