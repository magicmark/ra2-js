import type { Entity, GameState, UnitDef } from './types';

/** Original additions, separate from the roster verified against Westwood INIs. */
export const CUSTOM_UNIT_IDS = ['butchers', 'george'] as const;
export const INSPECTION_RULES = { radius: 3, seconds: 10, maxRank: 2, rankBonus: .1 } as const;
export const INSPECTION_HELP = 'George never attacks. Stop him within 3 cells of an own-side infantry unit or vehicle for 10 continuous seconds per promotion. Moving George or leaving range resets progress. One inspector per target; maximum Elite. Each rank adds 10% damage and durability.';
export const rankName = (entity: Entity): string => ['Recruit', 'Veteran', 'Elite'][entity.rank ?? 0];
export const rankMultiplier = (entity: Entity): number => 1 + Math.min(INSPECTION_RULES.maxRank, entity.rank ?? 0) * INSPECTION_RULES.rankBonus;
export function inspectionStatus(entity: Entity, state: GameState, defs: Record<string, UnitDef>): string {
  if (entity.type === 'george') {
    const target = state.entities.find(other => other.id === entity.inspection?.targetId);
    return target ? `Inspecting ${defs[target.type].name} · ${Math.floor((entity.inspection?.elapsed ?? 0) / INSPECTION_RULES.seconds * 100)}%`
      : entity.order === 'move' || entity.path.length ? 'Moving · inspection resets' : 'Inspector ready · stop within 3 cells';
  }
  return `${rankName(entity)}${entity.inspectedBy !== undefined ? ` · Inspection ${Math.floor((entity.inspectionProgress ?? 0) * 100)}%` : ''}`;
}
