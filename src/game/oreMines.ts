import type { GameState, UnitDef, Vec2 } from './types';

// Retail rules.ini [TIBTRE01]: AnimationRate=3, AnimationProbability=.003,
// SpawnsTiberium=yes. Its theater SHP has 11 frames plus 11 shadow frames.
export const ORE_MINE_ANIMATION = { frames: 11, ticksPerFrame: 3, probability: .003 } as const;
export const DEFAULT_ORE_MINES: readonly Vec2[] = [[8, 51], [22, 51], [54, 11], [40, 8], [20, 27], [44, 39]].map(([x, y]) => ({ x, y }));
export interface OreMine extends Vec2 { animationStartedAt?: number; randomState: number; fieldCells: number[]; initialOre: number }
export function initializeOreMines(state: GameState): OreMine[] {
  const positions = state.nativeMap ? state.nativeMap.terrain.filter(t => t.type.toUpperCase() === 'TIBTRE01') : DEFAULT_ORE_MINES;
  return positions.map(({ x, y }) => {
    const tile = state.tiles[y * state.width + x];
    if (tile) { tile.terrain = 'rock'; tile.ore = 0; if (tile.nativeArt) tile.nativeArt.terrain = 'rock'; }
    const fieldCells: number[] = [];
    for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
      if (Math.hypot(dx, dy) > 5 || x + dx < 0 || x + dx >= state.width || y + dy < 0 || y + dy >= state.height) continue;
      const i = (y + dy) * state.width + x + dx;
      if (state.tiles[i].ore > 0) fieldCells.push(i);
    }
    return { x, y, randomState: (Math.imul(x + 1, 73856093) ^ Math.imul(y + 1, 19349663)) >>> 0, fieldCells, initialOre: fieldCells.reduce((sum, i) => sum + state.tiles[i].ore, 0) };
  });
}
function random(mine: OreMine): number {
  let n = mine.randomState; n ^= n << 13; n ^= n >>> 17; n ^= n << 5; mine.randomState = n >>> 0;
  return mine.randomState / 4294967296;
}
export function oreMineFrame(mine: OreMine | undefined, time: number): number {
  return mine?.animationStartedAt === undefined ? 0 : Math.min(ORE_MINE_ANIMATION.frames - 1, Math.floor((time - mine.animationStartedAt) * 30 / ORE_MINE_ANIMATION.ticksPerFrame));
}
/** Called once per fixed logical tick, independent of browser frame rate. */
export function updateOreMines(state: GameState, defs: Record<string, UnitDef>): void {
  for (const mine of state.oreMines ?? []) {
    // User-requested activation gate: idle until the surrounding field has
    // at most one quarter of its starting ore. The retail random cycle then
    // supplies its original occasional motion instead of a continuous loop.
    if (mine.fieldCells.reduce((sum, i) => sum + state.tiles[i].ore, 0) > mine.initialOre * .25) {
      mine.animationStartedAt = undefined;
      continue;
    }
    if (mine.animationStartedAt === undefined) {
      if (random(mine) < ORE_MINE_ANIMATION.probability) mine.animationStartedAt = state.time;
      continue;
    }
    if (state.time - mine.animationStartedAt < ORE_MINE_ANIMATION.frames * ORE_MINE_ANIMATION.ticksPerFrame / 30) continue;
    mine.animationStartedAt = undefined;
    const choices: Vec2[] = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = mine.x + dx, y = mine.y + dy;
      if (x < 0 || y < 0 || x >= state.width || y >= state.height || (!dx && !dy)) continue;
      const tile = state.tiles[y * state.width + x];
      if (!['grass', 'sand'].includes(tile.terrain) || tile.ore >= 1200) continue;
      if (state.entities.some(e => {
        if (e.hp <= 0) return false;
        const def = defs[e.type], building = def && (def.category === 'structures' || def.category === 'defenses');
        const left = building ? e.x : Math.floor(e.x), top = building ? e.y : Math.floor(e.y), [w, h] = building ? def.footprint : [1, 1];
        return x >= left && x < left + w && y >= top && y < top + h;
      })) continue;
      choices.push({ x, y });
    }
    if (!choices.length) continue;
    const p = choices[Math.floor(random(mine) * choices.length)], tile = state.tiles[p.y * state.width + p.x];
    tile.ore = Math.min(1200, tile.ore + 100);
  }
}
