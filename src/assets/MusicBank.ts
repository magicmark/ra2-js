import { readArtSections } from './NativeAnimation';
import { validateWave } from './AudioSample';

export interface MusicTrack {
  name: string;
  bytes: Uint8Array;
}

export type OriginalMusic = readonly MusicTrack[];

/** Missing selections can be rebuilt from an older cache's complete installer. */
export class MissingMusicError extends Error {}

function required(files: { get(name: string): Uint8Array | undefined }, name: string): Uint8Array {
  const bytes = files.get(name);

  if (!bytes)
    throw new MissingMusicError(
      `Missing original music asset: ${name}. Import the complete installer, or ra2.mix, language.mix and theme.mix.`,
    );

  return bytes;
}

/** theme.ini defaults Normal to yes; commented-out/missing sections are disabled. */
export function musicDefinitions(theme: Uint8Array): { name: string; sample: string }[] {
  const sections = readArtSections(theme),
    themes = sections.get('themes');

  if (!themes) throw new Error('Invalid original music theme.ini: missing Themes section');
  const selected = new Map<string, { name: string; sample: string }>();

  for (const name of Object.values(themes)) {
    const section = sections.get(name.toLowerCase());

    if (!name || !section || /^(no|false|0)$/i.test(section.normal ?? 'yes')) continue;
    const sample = section.sound?.replace(/\.wav$/i, '').toLowerCase();

    if (!sample || !/^[a-z0-9_-]+$/.test(sample))
      throw new Error(`Invalid original music Sound: ${name}`);
    selected.set(sample, { name, sample });
  }

  if (!selected.size) throw new Error('Invalid original music theme.ini: no gameplay themes');

  return [...selected.values()];
}

interface Archive {
  get(name: string): Uint8Array | undefined;
}

export function selectMusicFiles(
  archives: readonly Archive[],
): { name: string; bytes: Uint8Array }[] {
  const ordered = [...archives].reverse();

  const files = {
    get: (name: string) => ordered.map((archive) => archive.get(name)).find(Boolean),
  };

  const theme = required(files, 'theme.ini');

  return [
    { name: 'theme.ini', bytes: theme.slice() },
    ...musicDefinitions(theme).map(({ sample }) => ({
      name: `music/${sample}.wav`,
      bytes: required(files, `${sample}.wav`).slice(),
    })),
  ];
}

/** Retain encoded originals; playback decodes only the current track. */
export function prepareMusic(files: ReadonlyMap<string, Uint8Array>): OriginalMusic {
  return musicDefinitions(required(files, 'theme.ini')).map(({ name, sample }) => {
    const file = `music/${sample}.wav`,
      bytes = required(files, file);

    try {
      validateWave(bytes);
    } catch (error) {
      throw new Error(`${file}: ${error instanceof Error ? error.message : error}`);
    }

    return { name, bytes };
  });
}
