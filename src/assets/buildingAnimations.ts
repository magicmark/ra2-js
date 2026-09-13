export interface BuildingLoop { start: number; end: number; ticksPerFrame: number }

/** Only the healthy, continuously looping art sections become idle animations. */
export function buildingLoops(bytes: Uint8Array | undefined): Map<string, BuildingLoop> {
  const sections = new Map<string, Record<string, string>>();
  let section: Record<string, string> | undefined;
  for (const raw of new TextDecoder().decode(bytes).split(/\r?\n/)) {
    const line = raw.split(';')[0].trim();
    const header = /^\[([^\]]+)\]$/.exec(line);
    if (header) { const name = header[1].toLowerCase(); section = sections.get(name) ?? {}; sections.set(name, section); }
    else if (section && line.includes('=')) { const index = line.indexOf('='); section[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim(); }
  }
  const loops = new Map<string, BuildingLoop>();
  for (const [name, art] of sections) {
    if (Number(art.loopcount) !== -1) continue;
    const start = Math.max(0, Number(art.loopstart ?? art.start ?? 0));
    const end = Number(art.loopend), rate = Number(art.rate ?? 900);
    // LoopEnd is exclusive. Rate is authored frames per 900 game ticks;
    // the engine truncates the tick delay rather than using fractional ticks.
    const ticksPerFrame = rate > 0 ? Math.floor(900 / rate) : 0;
    if (Number.isInteger(start) && Number.isInteger(end) && end > start && ticksPerFrame > 0) loops.set(name, { start, end, ticksPerFrame });
  }
  return loops;
}

export function buildingLoopFrame(loop: BuildingLoop | undefined, time: number, frameCount: number): number {
  if (!loop) return 0;
  const end = Math.min(loop.end, frameCount), start = Math.min(loop.start, Math.max(0, end - 1));
  const count = end - start;
  if (count <= 1) return start;
  // This recreation's normal simulation second represents 60 logic ticks.
  // Simulation time also makes pause and the game-speed setting consistent.
  const ticks = Math.max(0, Math.floor(time * 60 + 1e-7));
  return start + Math.floor(ticks / loop.ticksPerFrame) % count;
}
