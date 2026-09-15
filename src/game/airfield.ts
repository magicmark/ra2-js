import type { Vec2 } from './types';

// Original art.ini [GAAIRC] DockingOffset0..3, relative to the foundation
// centre. Westwood uses 256 leptons per cell; the tower occupies the west column.
export const AIRFIELD_DOCKING_OFFSETS = [
  { x: 0, y: -0.5 },
  { x: 0, y: 0.5 },
  { x: 1, y: -0.5 },
  { x: 1, y: 0.5 },
] as const;

// Original rules.ini [AudioVisual] PoseDir=2 (screen east).
export const AIRFIELD_PARKING_FACING = -Math.PI / 4;

export function airfieldPad(center: Vec2, index: number): Vec2 {
  const offset = AIRFIELD_DOCKING_OFFSETS[index];

  return { x: center.x + offset.x, y: center.y + offset.y };
}
