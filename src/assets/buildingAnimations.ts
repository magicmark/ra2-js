import { nativeAnimationInterval, nativeNormalizedInterval, NATIVE_LOGIC_HZ, NATIVE_SPEED_INDEX, readArtSections } from './NativeAnimation';
export interface BuildingLoop { start: number; end: number; ticksPerFrame: number; normalized?: boolean }

/** Only the healthy, continuously looping art sections become idle animations. */
export function buildingLoops(bytes: Uint8Array | undefined): Map<string, BuildingLoop> {
  const sections = readArtSections(bytes);
  const loops = new Map<string, BuildingLoop>();
  for (const [name, art] of sections) {
    if (Number(art.loopcount) !== -1) continue;
    const start = Math.max(0, Number(art.loopstart ?? art.start ?? 0));
    const end = Number(art.loopend);
    // LoopEnd is exclusive. Rate is authored frames per 900 game ticks;
    // the engine truncates the tick delay rather than using fractional ticks.
    const ticksPerFrame = nativeAnimationInterval(Number(art.rate ?? 900)), normalized = /^(yes|true|1)$/i.test(art.normalized ?? '');
    if (Number.isInteger(start) && Number.isInteger(end) && end > start && ticksPerFrame > 0) loops.set(name, { start, end, ticksPerFrame, normalized });
  }
  return loops;
}

export function buildingLoopFrame(loop: BuildingLoop | undefined, time: number, frameCount: number, speedIndex = NATIVE_SPEED_INDEX): number {
  if (!loop) return 0;
  const end = Math.min(loop.end, frameCount), start = Math.min(loop.start, Math.max(0, end - 1));
  const count = end - start;
  if (count <= 1) return start;
  // The shared 30-frame reference makes pause and speed scaling consistent.
  const ticks = Math.max(0, Math.floor(time * NATIVE_LOGIC_HZ + 1e-7));
  const interval = loop.normalized ? nativeNormalizedInterval(loop.ticksPerFrame, speedIndex) : loop.ticksPerFrame;
  return start + Math.floor(ticks / interval) % count;
}
