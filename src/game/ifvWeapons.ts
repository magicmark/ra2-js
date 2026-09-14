import type { UnitDef } from './types';

/** Passenger weapon modes for the British roster; the empty IFV keeps its missiles. */
export const IFV_WEAPONS: Record<string, Partial<UnitDef>> = {
  // rules.ini [FV] Weapon3=CRM60
  gi: {"burst": 1, "damage": 20, "range": 6.0, "fireRate": 0.5, "verses": [1.0, 1.0, 0.7, 0.6, 0.4, 0.4, 0.75, 0.5, 0.25, 1.0, 1.0], "targets": ["land", "water"]},
  // rules.ini [FV] Weapon3=CRM60
  spy: {"burst": 1, "damage": 20, "range": 6.0, "fireRate": 0.5, "verses": [1.0, 1.0, 0.7, 0.6, 0.4, 0.4, 0.75, 0.5, 0.25, 1.0, 1.0], "targets": ["land", "water"]},
  // rules.ini [FV] Weapon6=AWPE
  sniper: {"burst": 1, "damage": 125, "range": 14.0, "fireRate": 2.0, "verses": [2.0, 1.0, 1.0, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 1.0], "targets": ["infantry"]},
  // rules.ini [FV] Weapon5=CRMP5
  tanya: {"burst": 1, "damage": 125, "range": 6.0, "fireRate": 0.6666666666666666, "verses": [1.0, 1.0, 1.0, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 1.0, 1.0], "targets": ["land", "water"]},
  // rules.ini [FV] Weapon11=CRNeutronRifle
  chrono_legionnaire: {"burst": 1, "damage": 10, "range": 6.0, "fireRate": 4.0, "verses": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], "targets": ["land", "water"], "ability": "chrono"},
  engineer: { damage: 0 },
};
