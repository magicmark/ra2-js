/** Authored animation data; timing follows the supplied RA2 executable audit. */
export type ArtSections = Map<string, Record<string, string>>;

export const NATIVE_LOGIC_HZ = 30;

export const NATIVE_SPEED_INDEX = 2;

export function readArtSections(bytes: Uint8Array | undefined): ArtSections {
  const sections: ArtSections = new Map();
  let section: Record<string, string> | undefined;

  for (const raw of new TextDecoder().decode(bytes).split(/\r?\n/)) {
    const line = raw.split(';')[0].split('//')[0].trim(),
      header = /^\[([^\]]+)\]$/.exec(line);

    if (header) {
      const name = header[1].toLowerCase();
      section = sections.get(name) ?? {};
      sections.set(name, section);
    } else if (section && line.includes('=')) {
      const index = line.indexOf('=');
      section[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
    }
  }

  return sections;
}

const normalizedIntervals = [
  [2, 2, 1, 1, 1, 1, 1, 1],
  [3, 3, 3, 2, 2, 2, 1, 1],
  [5, 4, 4, 3, 3, 2, 2, 1],
  [7, 6, 5, 4, 4, 4, 3, 2],
];

/** Rate is converted to integer ticks before optional native normalization. */
export function nativeAnimationInterval(
  rate = 900,
  normalized = false,
  speedIndex = NATIVE_SPEED_INDEX,
): number {
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  const interval = Math.floor(900 / rate);

  return normalized ? nativeNormalizedInterval(interval, speedIndex) : interval;
}

export function nativeNormalizedInterval(
  interval: number,
  speedIndex = NATIVE_SPEED_INDEX,
): number {
  if (interval === 0) return 0;

  if (!Number.isInteger(speedIndex) || speedIndex < 0 || speedIndex > 7)
    throw new Error('Invalid native animation speed index');

  return interval <= 4
    ? normalizedIntervals[interval - 1][speedIndex]
    : Math.floor((interval * 8) / (speedIndex + 1));
}

export function artAnimationInterval(
  art: Record<string, string> | undefined,
  speedIndex = NATIVE_SPEED_INDEX,
): number {
  return nativeAnimationInterval(
    Number(art?.rate ?? 900),
    /^(yes|true|1)$/i.test(art?.normalized ?? ''),
    speedIndex,
  );
}

export interface NativeAnimationDefinition {
  frames: number;
  ticksPerFrame: number;
  normalized?: boolean;
}

export function nativeAnimationFrame(
  animation: NativeAnimationDefinition,
  ageSeconds: number,
  speedIndex = NATIVE_SPEED_INDEX,
): number {
  const ticks = Math.max(0, Math.floor(ageSeconds * NATIVE_LOGIC_HZ + 1e-7));

  const interval = animation.normalized
    ? nativeNormalizedInterval(animation.ticksPerFrame, speedIndex)
    : animation.ticksPerFrame;

  return interval > 0 ? Math.min(animation.frames - 1, Math.floor(ticks / interval)) : 0;
}
