import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { EFFECT_SOUNDS, EVA_SOUNDS, prepareSounds, selectAudioFiles, soundDefinitions } from './AudioBank';
import { testAudioFiles } from './asset-test-fixtures';
import { MixArchive } from './formats';
import { NESTED_MIXES } from './catalog';

it('selects only referenced originals, preserves authored volume, and requires every consumed sample', () => {
  const files = new Map(testAudioFiles().map(file => [file.name, file.bytes]));
  const archive = { get: (name: string) => files.get(name === 'fixture.wav' ? 'audio/fixture.wav' : name) };
  const selected = selectAudioFiles([archive]); expect(selected.map(file => file.name)).toEqual(['audio/fixture.wav']);
  const sounds = prepareSounds(files); expect(sounds.size).toBe(EFFECT_SOUNDS.length + EVA_SOUNDS.length);
  expect(sounds.get('MenuClick')?.volume).toBe(.6); expect(sounds.get('EVA_UnitReady')?.speech).toBe(true);
  expect(sounds.get('MenuClick')?.samples[0]).toBe(sounds.get('CommandBar')?.samples[0]);
  files.delete('audio/fixture.wav'); expect(() => prepareSounds(files)).toThrow('audio/fixture.wav');
  expect(() => selectAudioFiles([archive])).toThrow('Missing original audio sample');
});

it('rejects missing definitions, malformed authored volume and corrupt audio', () => {
  const files = new Map(testAudioFiles().map(file => [file.name, file.bytes]));
  const original = files.get('sound.ini')!;
  expect(() => soundDefinitions(new Uint8Array(), files.get('eva.ini')!)).toThrow('MenuClick');
  const badVolume = new TextEncoder().encode(new TextDecoder().decode(original).replace('Volume=60', 'Volume=NaN'));
  expect(() => soundDefinitions(badVolume, files.get('eva.ini')!)).toThrow('volume');
  files.set('audio/fixture.wav', new Uint8Array(12)); expect(() => prepareSounds(files)).toThrow('audio/fixture.wav');
});

it.skipIf(!process.env.RA2_ASSET_DIR)('selects and decodes the consumed sounds from original encrypted MIX archives', () => {
  const archives: MixArchive[] = [];
  const visit = (name: string, bytes: Uint8Array) => { const mix = new MixArchive(bytes, name); archives.push(mix); for (const child of NESTED_MIXES) { const data = mix.get(child); if (data) visit(name + '/' + child, data); } };
  for (const name of ['ra2.mix', 'language.mix']) visit(name, readFileSync(join(process.env.RA2_ASSET_DIR!, name)));
  const get = (name: string) => [...archives].reverse().map(archive => archive.get(name)).find(Boolean)!;
  const selected = selectAudioFiles(archives);
  const bank = prepareSounds(new Map([...selected.map(file => [file.name, file.bytes] as const), ['sound.ini', get('sound.ini')], ['eva.ini', get('eva.ini')]]));
  expect(bank.get('MenuClick')?.volume).toBe(.6); expect(bank.get('MenuScold')?.volume).toBe(.4);
  expect(soundDefinitions(get('sound.ini'), get('eva.ini')).get('MenuTab')).toEqual({ samples: ['utab'], volume: .6, speech: false });
  expect(selected.some(file => file.name === 'audio/utab.wav')).toBe(true);
  expect(bank.get('MenuTab')?.samples[0].channels[0].some(value => value !== 0)).toBe(true);
  expect(soundDefinitions(get('sound.ini'), get('eva.ini')).get('SniperSelect')).toEqual({ samples: ['isnisea', 'isniseb', 'isnisec', 'isnised'], volume: .9, speech: false });
  expect(bank.get('SniperSelect')?.samples).toHaveLength(4);
  for (const sample of bank.get('SniperSelect')!.samples) expect(sample.channels[0].some(value => value !== 0)).toBe(true);
  expect(bank.get('GIAttack')?.samples).toHaveLength(3);
  expect(bank.get('EVA_ConstructionComplete')?.samples[0].channels[0].length).toBeGreaterThan(1000);
  expect(selected.reduce((bytes, file) => bytes + file.bytes.length, 0)).toBeLessThan(2_000_000);
});
