import { isBuilding } from './definitions';
import type { GameState, UnitDef } from './types';

/** Shared placement verdicts drive both the command and the original cell mask. */
export function placementCells(state: GameState, defs: Record<string, UnitDef>, type: string, x: number, y: number, side = 0) {
  const def = defs[type];
  if (!def || !isBuilding(def) || !state.sides[side] || !Number.isInteger(x) || !Number.isInteger(y)) return [];
  const [width, height] = def.footprint, entities = state.entities.filter(entity => entity.hp > 0);
  const nearBase = entities.some(entity => {
    const other = defs[entity.type];
    if (entity.side !== side || entity.selling || !isBuilding(other)) return false;
    const dx = Math.max(entity.x - (x + width), x - (entity.x + other.footprint[0]), 0);
    const dy = Math.max(entity.y - (y + height), y - (entity.y + other.footprint[1]), 0);
    return Math.hypot(dx, dy) <= 4.5;
  });
  return Array.from({ length: width * height }, (_, index) => {
    const tx = x + index % width, ty = y + Math.floor(index / width);
    let valid = nearBase && tx >= 0 && ty >= 0 && tx < state.width && ty < state.height;
    if (valid) {
      const tile = state.tiles[ty * state.width + tx];
      valid = tile.terrain !== 'water' && tile.terrain !== 'rock' && tile.ore <= 0 && (side !== 0 || !!state.explored[ty * state.width + tx]);
    }
    if (valid) valid = !entities.some(entity => {
      const other = defs[entity.type];
      return isBuilding(other)
        ? tx < entity.x + other.footprint[0] && tx + 1 > entity.x && ty < entity.y + other.footprint[1] && ty + 1 > entity.y
        : entity.x > tx - .3 && entity.x < tx + 1.3 && entity.y > ty - .3 && entity.y < ty + 1.3;
    });
    return { x: tx, y: ty, valid };
  });
}
