/** Original rules.ini infantry IFVMode -> [FV] *TurretIndex. Unlisted
 * passengers (including dogs and custom infantry) retain the normal turret. */
interface PassengerTurrets {
  readonly [passenger: string]: number;
}

export const IFV_TURRETS: PassengerTurrets = {
  gi: 1,
  conscript: 1,
  spy: 1,
  sniper: 1,
  tanya: 1,
  engineer: 2,
  chrono_legionnaire: 3,
};

export const IFV_TURRET_FILES = [1, 2, 3].flatMap((index) => [
  `fvtur${index}.vxl`,
  `fvtur${index}.hva`,
]);
