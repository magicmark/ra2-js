import type { AnimationDefinition, InfantryAnimationDefinition } from './types';

// Authored simulation timing for headless rules tests. Runtime replaces these
// records with metadata read from the strictly required original art files.
export const NATIVE_EFFECT_TIMINGS: Record<string, AnimationDefinition> = {
  WCLBOLT1: { frames: 3, ticksPerFrame: 1 },
  WCLBOLT2: { frames: 3, ticksPerFrame: 1 },
  WCLBOLT3: { frames: 3, ticksPerFrame: 1 },
  CHRONOFD: { frames: 17, ticksPerFrame: 3 },
  CHRONOTG: { frames: 17, ticksPerFrame: 3 },
  WARPIN: { frames: 10, ticksPerFrame: 7 },
  WARPOUT: { frames: 21, ticksPerFrame: 7 },
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
  snipe: { fireFrame: 5, sequences: { FireUp: { frames: 6, ticksPerFrame: 1 } } },
  adog: { fireFrame: 6, sequences: { FireUp: { frames: 6, ticksPerFrame: 1 } } },
  spy: { fireFrame: 1, sequences: { FireUp: { frames: 1, ticksPerFrame: 1 } } },
  tany: { fireFrame: 3, sequences: { FireUp: { frames: 6, ticksPerFrame: 1 }, WetAttack: { frames: 6, ticksPerFrame: 1 } } },
  cleg: { fireFrame: 2, sequences: { FireUp: { frames: 6, ticksPerFrame: 1 } } },
  gi: { fireFrame: 2, sequences: {
    FireUp: { frames: 6, ticksPerFrame: 1 }, DeployedFire: { frames: 6, ticksPerFrame: 1 },
    Deploy: { frames: 15, ticksPerFrame: 1 }, Undeploy: { frames: 2, ticksPerFrame: 1 },
    Idle1: { frames: 15, ticksPerFrame: 3, normalized: true, facing: 4 }, Idle2: { frames: 14, ticksPerFrame: 3, normalized: true, facing: 6 },
  } },
  cons: { fireFrame: 6, sequences: { FireUp: { frames: 6, ticksPerFrame: 1 }, Idle1: { frames: 15, ticksPerFrame: 3, normalized: true, facing: 2 }, Idle2: { frames: 14, ticksPerFrame: 3, normalized: true, facing: 6 } } },
  engineer: { fireFrame: 2, sequences: { Idle1: { frames: 15, ticksPerFrame: 3, normalized: true, facing: 2 }, Idle2: { frames: 14, ticksPerFrame: 3, normalized: true, facing: 6 } } },
  rock: { fireFrame: 2, sequences: { FireFly: { frames: 6, ticksPerFrame: 1 } } },
};
