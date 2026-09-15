/** Measurements of imagegen's centered foundation, in source pixels.
 * Camera.project uses slope .5. Calibrate that projection at render time;
 * keep the authored PNG and the180x90 gameplay foundation unchanged.
 */
export const BUTCHERS_PROJECTION = {
  sourceGroundSlope: (0.5448129066862394 + 0.5431312546755684) / 2,
  targetGroundSlope: 0.5,
  frontCorner: { x: 700.1490630608799, y: 1034.627 },
  paintedWidth: 1165,
  gameWidth: 180,
} as const;

export const BUTCHERS_PROJECTION_Y =
  BUTCHERS_PROJECTION.targetGroundSlope / BUTCHERS_PROJECTION.sourceGroundSlope;
