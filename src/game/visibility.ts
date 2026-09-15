import type { Entity, GameState, UnitDef } from './types';
import { isBuilding } from './definitions';

/** Remember discovered structures; mobile contacts require current sight. */
export function revealedEntity(state: GameState, defs: Record<string, UnitDef>, entity: Entity): boolean {
  if (entity.transportId !== undefined || entity.hp <= 0) return false;
  if (entity.side === 0) return true;
  const def = defs[entity.type];
  if (!isBuilding(def)) {
    const x = Math.floor(entity.x), y = Math.floor(entity.y);
    return x >= 0 && y >= 0 && x < state.width && y < state.height && !!state.fog[y * state.width + x];
  }
  if (entity.revealed) return true;
  for (let y = Math.floor(entity.y); y < entity.y + def.footprint[1]; y++)
    for (let x = Math.floor(entity.x); x < entity.x + def.footprint[0]; x++)
      if (x >= 0 && y >= 0 && x < state.width && y < state.height && state.explored[y * state.width + x]) return true;
  return false;
}
