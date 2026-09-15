import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { MissingMusicError, musicDefinitions, prepareMusic, selectMusicFiles } from './MusicBank';
import { audioBagWave, decodeWave } from './AudioSample';
import { MixArchive } from './formats';
import { testAudioFiles } from './asset-test-fixtures';

const encode = (text: string) => new TextEncoder().encode(text);
const theme = encode('[Themes]\n1=Intro\n2=First\n3=Disabled\n4=Second\n5=;Retired\n6=Credits\n7=First\n[Intro]\nSound=intro\nNormal=no\n[First]\nSound=Song-One\nNormal=yes\n[Second]\nSound=song-two.wav\n[Credits]\nSound=credits\nNormal=no');

it('uses authored playlist order and Sound aliases, excluding menu music and disabled declarations', () => {
  expect(musicDefinitions(theme)).toEqual([{ name: 'First', sample: 'song-one' }, { name: 'Second', sample: 'song-two' }]);
  expect(() => musicDefinitions(encode('[Themes]\n1=Broken\n[Broken]\nSound=../outside'))).toThrow('Sound: Broken');
  expect(() => musicDefinitions(encode('[Themes]\n1=Disabled'))).toThrow('no gameplay themes');
});

it('selects available original standalone WAV overrides and requires every declared gameplay track', () => {
  const first = new Uint8Array([1]), last = new Uint8Array([2]);
  const base = new Map([['theme.ini', theme], ['song-one.wav', first], ['song-two.wav', first], ['intro.wav', first]]);
  const selected = selectMusicFiles([base, new Map([['song-two.wav', last]])]);
  expect(selected.map(file => file.name)).toEqual(['theme.ini', 'music/song-one.wav', 'music/song-two.wav']);
  expect(selected[2].bytes).toEqual(last); expect(selected[2].bytes).not.toBe(last);
  base.delete('song-two.wav');
  expect(() => selectMusicFiles([base])).toThrow(MissingMusicError);
  expect(() => selectMusicFiles([base])).toThrow('song-two.wav');
});

it('retains encoded bytes for lazy playback and rejects missing or malformed selected audio', () => {
  const files = new Map(testAudioFiles().map(file => [file.name, file.bytes]));
  const music = prepareMusic(files);
  expect(music).toEqual([{ name: 'Fixture', bytes: files.get('music/fixture.wav') }]);
  expect(music[0].bytes).toBe(files.get('music/fixture.wav'));
  expect(decodeWave(music[0].bytes).channels[0][1]).toBe(.5);
  files.set('music/fixture.wav', new Uint8Array(16));
  expect(() => prepareMusic(files)).toThrow('music/fixture.wav: Invalid WAV header');
  files.delete('music/fixture.wav'); expect(() => prepareMusic(files)).toThrow(MissingMusicError);
});

it('validates every IMA block state before music playback, including later corrupt blocks', () => {
  const body = new Uint8Array(16);
  const wave = audioBagWave({ name: 'fixture', offset: 0, size: body.length, sampleRate: 22050, flags: 12, chunkSize: 8 }, body);
  wave[70] = 89; // Second block step index, outside IMA's valid 0..88 range.
  const files = new Map(testAudioFiles().map(file => [file.name, file.bytes]));
  files.set('music/fixture.wav', wave);
  expect(() => prepareMusic(files)).toThrow('music/fixture.wav: Invalid IMA WAV block state');
});

it.skipIf(!process.env.RA2_ASSET_DIR)('validates all 13 original gameplay tracks and decodes their actual stereo music', () => {
  const ra2 = new MixArchive(readFileSync(join(process.env.RA2_ASSET_DIR!, 'ra2.mix')));
  const local = new MixArchive(ra2.get('local.mix')!);
  const soundtrack = new MixArchive(readFileSync(join(process.env.RA2_ASSET_DIR!, 'theme.mix')));
  const selected = selectMusicFiles([local, soundtrack]);
  const tracks = prepareMusic(new Map(selected.map(file => [file.name, file.bytes])));
  expect(tracks.map(track => track.name)).toEqual(['Grinder', 'Power', 'Fortification', 'InDeep', 'Tension', 'EagleHunter', 'IndustroFunk', '200Meters', 'BlowItUp', 'Destroy', 'Burn', 'Motorized', 'HM2']);
  expect(tracks.reduce((bytes, track) => bytes + track.bytes.length, 0)).toBe(66_404_108);
  for (const track of tracks) {
    const decoded = decodeWave(track.bytes);
    expect(decoded.sampleRate, track.name).toBe(22050);
    expect(decoded.channels, track.name).toHaveLength(2);
    expect(decoded.channels[0].length / decoded.sampleRate, track.name).toBeGreaterThan(120);
    expect(decoded.channels[0].some(value => Math.abs(value) > .1), track.name).toBe(true);
  }
}, 30_000);
