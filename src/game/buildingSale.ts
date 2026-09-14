// rules.ini [General] BuildupTime=.06 authored minutes, 900 logic frames/minute.
// The simulation runs the retail logical frame stream at 30 frames/second.
export const BUILDING_SALE_SECONDS = .06 * 900 / 30;
export function buildingSaleFrame(progress: number, frames: number): number {
  return Math.max(0, frames - 1 - Math.floor(Math.max(0, Math.min(1, progress)) * frames));
}
