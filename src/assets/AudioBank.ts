import { readArtSections } from './NativeAnimation';
import { audioBagWave, decodeWave, readAudioIndex, type DecodedAudioSample } from './AudioSample';

/** Original rules.ini weapon Report names for the weapons this game simulates. */
export const WEAPON_SOUNDS: Readonly<Record<string, string>> = {
  gi: 'GIAttack', conscript: 'ConscriptAttack', rocketeer: 'RocketeerAttack',
  grizzly: 'GrizzlyTankAttack', rhino: 'RhinoTankAttack', ifv: 'SeawolfAttack',
  flak: 'FlakTrackAttackGround', warminer: 'WarMinerAttack', pillbox: 'PillboxAttack',
  sentry: 'SentryGunAttack', patriot: 'PatriotAttack', prism_tower: 'PrismTowerAttack',
  prism_tank: 'PrismTankAttack', mirage_tank: 'MirageTankAttack', harrier: 'IntruderAttack',
  nighthawk: 'BlackOpsAttack', destroyer: 'DestroyerAttack', aegis: 'AegisAttack',
  hornet: 'HornetAttack', dolphin: 'DolphinAttack', attack_dog: 'DogAttack',
  tanya: 'TanyaAttack', chrono_legionnaire: 'ChronoLegionAttack', sniper: 'SniperAttack',
};
export const IFV_SOUNDS: Readonly<Record<string, string>> = {
  gi: 'IFVAttackGround', spy: 'IFVAttackGround', sniper: 'SniperAttack',
  tanya: 'SealAttack', chrono_legionnaire: 'ChronoLegionAttack',
};
export const EVA_SOUNDS = ['EVA_ConstructionComplete', 'EVA_UnitReady', 'EVA_UnitLost',
  'EVA_UnitPromoted', 'EVA_MissionAccomplished', 'EVA_MissionFailed'] as const;
export const EFFECT_SOUNDS = [...new Set(['MenuClick', 'MenuScold', 'CommandBar', 'Explosion01',
  'GIAttackDeployed', 'FlakTrackAttackAir', ...Object.values(WEAPON_SOUNDS), ...Object.values(IFV_SOUNDS)])];
export interface SoundDefinition { samples: string[]; volume: number; speech: boolean }
export interface OriginalSound { samples: DecodedAudioSample[]; volume: number; speech: boolean }
export type OriginalSounds = ReadonlyMap<string, OriginalSound>;

export function soundDefinitions(sound: Uint8Array, eva: Uint8Array): Map<string, SoundDefinition> {
  const effects = readArtSections(sound), voices = readArtSections(eva), result = new Map<string, SoundDefinition>();
  const names = (value: string | undefined, cue: string) => {
    const samples = value?.trim().split(/\s+/).map(name => name.replace(/^\$/, '').replace(/\.wav$/i, '').toLowerCase());
    if (!samples?.length || samples.some(name => !/^[a-z0-9_]+$/.test(name))) throw new Error(`Missing or invalid original sound definition: ${cue}`);
    return samples;
  };
  for (const cue of EFFECT_SOUNDS) {
    const section = effects.get(cue.toLowerCase()), volume = Number(section?.volume ?? 100);
    if (!Number.isFinite(volume) || volume < 0 || volume > 100) throw new Error(`Invalid original sound volume: ${cue}`);
    result.set(cue, { samples: names(section?.sounds, cue), volume: volume / 100, speech: false });
  }
  // The playable commander/UI is Allied. Do not announce generic success as construction complete.
  for (const cue of EVA_SOUNDS) result.set(cue, { samples: names(voices.get(cue.toLowerCase())?.allied, cue), volume: 1, speech: true });
  return result;
}

interface Archive { get(name: string): Uint8Array | undefined }
/** Select just consumed samples; keep the full BAG in the reusable MIX stage. */
export function selectAudioFiles(archives: readonly Archive[]): { name: string; bytes: Uint8Array }[] {
  const ordered = [...archives].reverse();
  const get = (name: string) => ordered.map(archive => archive.get(name)).find(Boolean);
  const sound = get('sound.ini'), eva = get('eva.ini');
  if (!sound || !eva) throw new Error('Missing original sound.ini or eva.ini. Import complete game MIX files.');
  const banks = ordered.flatMap(archive => {
    const index = archive.get('audio.idx'), bag = archive.get('audio.bag');
    return index && bag ? [{ index: new Map(readAudioIndex(index).map(entry => [entry.name, entry])), bag }] : [];
  });
  const samples = new Set([...soundDefinitions(sound, eva).values()].flatMap(cue => cue.samples));
  return [...samples].map(sample => {
    let bytes = get(`${sample}.wav`);
    if (!bytes) for (const bank of banks) {
      const entry = bank.index.get(sample);
      if (entry) { bytes = audioBagWave(entry, bank.bag); break; }
    }
    if (!bytes) throw new Error(`Missing original audio sample: ${sample}.wav. Import complete game MIX files.`);
    return { name: `audio/${sample}.wav`, bytes: bytes.slice() };
  });
}

export function prepareSounds(files: ReadonlyMap<string, Uint8Array>): OriginalSounds {
  const required = (name: string) => {
    const bytes = files.get(name);
    if (!bytes) throw new Error(`Missing original sound asset: ${name}. Import complete game MIX files.`);
    return bytes;
  };
  const definitions = soundDefinitions(required('sound.ini'), required('eva.ini'));
  const decoded = new Map<string, DecodedAudioSample>();
  return new Map([...definitions].map(([name, cue]) => [name, { ...cue, samples: cue.samples.map(sample => {
    const file = `audio/${sample}.wav`;
    if (!decoded.has(file)) {
      try { decoded.set(file, decodeWave(required(file))); }
      catch (error) { throw new Error(`${file}: ${error instanceof Error ? error.message : error}`); }
    }
    return decoded.get(file)!;
  }) }]));
}
