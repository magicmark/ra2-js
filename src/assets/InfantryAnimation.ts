import {
  nativeNormalizedInterval,
  NATIVE_LOGIC_HZ,
  NATIVE_SPEED_INDEX,
  type ArtSections,
  type NativeAnimationDefinition,
} from './NativeAnimation';

export interface InfantrySequence extends NativeAnimationDefinition {
  start: number;
  stride: number;
  facing?: number;
}

export interface InfantryArt {
  sequences: Record<string, InfantrySequence>;
  fireFrame: number;
}

interface SequenceIntervals {
  [action: string]: number;
}

const intervals: SequenceIntervals = {
  Ready: 1,
  Walk: 3,
  FireUp: 1,
  Deploy: 1,
  Deployed: 1,
  DeployedFire: 1,
  Undeploy: 1,
  Fly: 1,
  Hover: 2,
  FireFly: 1,
  Idle1: 3,
  Idle2: 3,
  Swim: 3,
  Tread: 3,
  WetAttack: 1,
};

const loops = new Set(['Ready', 'Walk', 'Deployed', 'Fly', 'Hover', 'Swim', 'Tread']);

/** Only sequences consumed by this roster are required and exposed. */
export function infantryArt(art: ArtSections, sprite: string): InfantryArt {
  const type = art.get(sprite),
    sequence = art.get(type?.sequence?.toLowerCase() ?? '');

  if (!sequence) throw new Error(`Missing original infantry Sequence: ${sprite}`);

  const names =
    sprite === 'rock'
      ? ['Fly', 'Hover', 'FireFly']
      : sprite === 'gi'
        ? ['Ready', 'Walk', 'FireUp', 'Deploy', 'Deployed', 'DeployedFire', 'Undeploy']
        : sprite === 'engineer'
          ? ['Ready', 'Walk']
          : ['Ready', 'Walk', 'FireUp'];

  if (sprite === 'tany') names.push('Swim', 'Tread', 'WetAttack');
  const sequences: Record<string, InfantrySequence> = {};

  for (const name of [
    ...names,
    ...['Idle1', 'Idle2'].filter((name) => sequence[name.toLowerCase()]),
  ]) {
    const fields = sequence[name.toLowerCase()]?.split(',').map((value) => value.trim());
    const values = fields?.slice(0, 3).map(Number);

    if (
      !values ||
      values.length !== 3 ||
      values.some((value) => !Number.isInteger(value) || value < 0) ||
      values[1] < 1
    ) {
      throw new Error(`Invalid original infantry sequence: ${sprite}.${name}`);
    }

    const facing = fields?.[3]
      ? ['N', 'NW', 'W', 'SW', 'S', 'SE', 'E', 'NE'].indexOf(fields[3].toUpperCase())
      : -1;

    sequences[name] = {
      start: values[0],
      frames: values[1],
      stride: values[2],
      ticksPerFrame: intervals[name],
      normalized: name === 'Hover' || name.startsWith('Idle'),
    };

    if (facing >= 0) sequences[name].facing = facing;
  }

  const fireFrame = Number(type?.fireup ?? 0);

  if (!Number.isInteger(fireFrame) || fireFrame < 0)
    throw new Error(`Invalid original infantry FireUp: ${sprite}`);

  return { sequences, fireFrame };
}

export function infantrySequenceFrame(
  sequence: InfantrySequence,
  action: string,
  facing: number,
  ageSeconds: number,
  speedIndex = NATIVE_SPEED_INDEX,
): number {
  const tick = Math.max(0, Math.floor(ageSeconds * NATIVE_LOGIC_HZ + 1e-7));

  const interval = sequence.normalized
    ? nativeNormalizedInterval(sequence.ticksPerFrame, speedIndex)
    : sequence.ticksPerFrame;

  const age = Math.floor(tick / interval);
  const phase = loops.has(action) ? age % sequence.frames : Math.min(sequence.frames - 1, age);

  return sequence.start + (((Math.round(facing) % 8) + 8) % 8) * sequence.stride + phase;
}
