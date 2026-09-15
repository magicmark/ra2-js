import type { Entity, GameState, UnitDef } from './types';

/** Original additions, separate from the roster verified against Westwood INIs. */
export const CUSTOM_UNIT_IDS = ['butchers', 'george'] as const;

export const INSPECTION_RULES = { radius: 3, seconds: 3, maxRank: 2, rankBonus: 0.1 } as const;

export const INSPECTION_HELP =
  'George is an autonomous civilian and cannot be selected or commanded. He wanders, pauses near friendly infantry or vehicles for 3 seconds to inspect them, then resumes walking. Inspections never upgrade units. George never attacks.';

export const rankName = (entity: Entity): string =>
  ['Recruit', 'Veteran', 'Elite'][entity.rank ?? 0];

export const rankMultiplier = (entity: Entity): number =>
  1 + Math.min(INSPECTION_RULES.maxRank, entity.rank ?? 0) * INSPECTION_RULES.rankBonus;

export function inspectionStatus(
  entity: Entity,
  state: GameState,
  defs: Record<string, UnitDef>,
): string {
  if (entity.type === 'george') {
    const target = state.entities.find((other) => other.id === entity.inspection?.targetId);

    return target
      ? `Inspecting ${defs[target.type].name} · ${Math.floor(((entity.inspection?.elapsed ?? 0) / INSPECTION_RULES.seconds) * 100)}%`
      : 'Wandering · autonomous civilian';
  }

  return `${rankName(entity)}${entity.inspectedBy !== undefined ? ` · Inspection ${Math.floor((entity.inspectionProgress ?? 0) * 100)}%` : ''}`;
}
