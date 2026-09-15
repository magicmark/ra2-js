export const LOGIC_FRAMES_PER_SECOND = 30;

// Reciprocal native frame-delay ratios against index 2. Native index 0 is
// unlimited; this browser implementation explicitly caps that position at 4x.
export const GAME_SPEED_STEPS = [1 / 3, 2 / 5, 1 / 2, 2 / 3, 1, 2, 4] as const;

// Start at the existing Faster setting: 60 logic frames per wall-clock second.
// Authored movement and production rates remain on the 30-frame reference clock.
export const DEFAULT_GAME_SPEED = 2;

export function nativeGameSpeedIndex(speed: number): number {
  const position = GAME_SPEED_STEPS.findIndex((value) => Math.abs(value - speed) < 1e-8);

  return position < 0 ? 2 : 6 - position;
}
