import type { Entity } from './types';

// rules.ini VeteranROF=.6; EliteAbilities are cumulative with VeteranAbilities.
const ROF_RANK: Record<string, number> = {
  gi: 1, conscript: 1, rocketeer: 1, tanya: 1, chrono_legionnaire: 1,
  destroyer: 1, aegis: 1, carrier: 1, dolphin: 1, attack_dog: 1,
  grizzly: 2, ifv: 2, rhino: 2, flak: 2, warminer: 2, prism_tank: 2, mirage_tank: 2,
  nighthawk: 2, harrier: 2, sniper: 2, transport: 2,
};

export const rankFireRateMultiplier = (entity: Entity): number =>
  (entity.rank ?? 0) >= (ROF_RANK[entity.type] ?? Infinity) ? .6 : 1;

// Project healing cadence: the retail INI lists SELF_HEAL but no amount/interval.
export const ELITE_HEAL = { hp: 5, seconds: 3 } as const;
