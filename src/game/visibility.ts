import type { Entity, GameState, UnitDef } from './types';

/** Exploration permanently reveals contacts; current vision still drives fog. */
export function revealedEntity(state: GameState, defs: Record<string, UnitDef>, entity: Entity): boolean {
  if (entity.transportId !== undefined || entity.hp <= 0) return false;
  if (entity.side === 0 || entity.revealed) return true;
  const def = defs[entity.type];
  for (let y = Math.floor(entity.y); y < entity.y + def.footprint[1]; y++)
    for (let x = Math.floor(entity.x); x < entity.x + def.footprint[0]; x++)
      if (x >= 0 && y >= 0 && x < state.width && y < state.height && state.explored[y * state.width + x]) return true;
  return false;
}
