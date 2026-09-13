import type { AnimationDefinition, InfantryAnimationDefinition } from './types';

// Authored simulation timing for headless rules tests. Runtime replaces these
// records with metadata read from the strictly required original art files.
export const NATIVE_EFFECT_TIMINGS: Record<string, AnimationDefinition> = {
  PIFFPIFF: { frames: 12, ticksPerFrame: 1 },
  S_CLSN22: { frames: 13, ticksPerFrame: 1, normalized: true },
  XGRYSML2: { frames: 13, ticksPerFrame: 1 },
  HTRKPUFF: { frames: 15, ticksPerFrame: 1 },
  TWLT070: { frames: 26, ticksPerFrame: 1, normalized: true },
  S_BANG48: { frames: 23, ticksPerFrame: 1, normalized: true },
  S_BRNL58: { frames: 10, ticksPerFrame: 1, normalized: true },
  S_CLSN58: { frames: 21, ticksPerFrame: 1, normalized: true },
  S_TUMU60: { frames: 21, ticksPerFrame: 1, normalized: true },
};
export const NATIVE_INFANTRY_TIMINGS: Record<string, InfantryAnimationDefinition> = {
  gi: { fireFrame: 2, sequences: {
    FireUp: { frames: 6, ticksPerFrame: 1 }, DeployedFire: { frames: 6, ticksPerFrame: 1 },
    Deploy: { frames: 15, ticksPerFrame: 1 }, Undeploy: { frames: 2, ticksPerFrame: 1 },
  } },
  cons: { fireFrame: 6, sequences: { FireUp: { frames: 6, ticksPerFrame: 1 } } },
  rock: { fireFrame: 2, sequences: { FireFly: { frames: 6, ticksPerFrame: 1 } } },
};
