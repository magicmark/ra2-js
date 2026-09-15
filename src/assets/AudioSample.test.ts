interface SampleHashes {
  [sample: string]: string;
}

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { audioBagWave, decodeWave, readAudioIndex, type AudioIndexEntry } from './AudioSample';
import { MixArchive } from './formats';

const entry = (overrides: Partial<AudioIndexEntry> = {}): AudioIndexEntry => ({
  name: 'sample',
  offset: 0,
  size: 8,
  sampleRate: 22050,
  flags: 12,
  chunkSize: 8,
  ...overrides,
});

const intSamples = (wave: Uint8Array) =>
  decodeWave(wave).channels.map((channel) =>
    Array.from(channel, (value) => Math.round(value * 32768)),
  );

function idx(names = ['SAMPLE']): Uint8Array {
  const bytes = new Uint8Array(12 + names.length * 36),
    data = new DataView(bytes.buffer);

  bytes.set(new TextEncoder().encode('GABA'));
  data.setUint32(4, 2, true);
  data.setUint32(8, names.length, true);

  for (const [i, name] of names.entries()) {
    const at = 12 + 36 * i;
    bytes.set(new TextEncoder().encode(name), at);
    bytes.fill(0xef, at + name.length + 1, at + 16);
    [5, 8, 22050, 12, 512].forEach((value, field) =>
      data.setUint32(at + 16 + field * 4, value, true),
    );
  }

  return bytes;
}

function wave(format: number[], body: number[], extra: [string, number[]][] = []): Uint8Array {
  const chunks: [string, number[]][] = [['fmt ', format], ...extra, ['data', body]];

  const bytes = new Uint8Array(
      12 + chunks.reduce((size, [, data]) => size + 8 + data.length + (data.length % 2), 0),
    ),
    data = new DataView(bytes.buffer);

  bytes.set(new TextEncoder().encode('RIFF'));
  data.setUint32(4, bytes.length - 8, true);
  bytes.set(new TextEncoder().encode('WAVE'), 8);
  let at = 12;

  for (const [name, body] of chunks) {
    bytes.set(new TextEncoder().encode(name), at);
    data.setUint32(at + 4, body.length, true);
    bytes.set(body, at + 8);
    at += 8 + body.length + (body.length % 2);
  }

  return bytes;
}

it('reads native index fields, normalizes case and ignores garbage after the name terminator', () => {
  const bytes = idx();
  expect(readAudioIndex(bytes)).toEqual([
    { name: 'sample', offset: 5, size: 8, sampleRate: 22050, flags: 12, chunkSize: 512 },
  ]);
  // DataView must honor offsets when called with archive subarrays.
  const padded = new Uint8Array(bytes.length + 6);
  padded.set(bytes, 3);
  expect(readAudioIndex(padded.subarray(3, -3))).toEqual(readAudioIndex(bytes));
});

it('rejects corrupt index signatures, counts, names and duplicate entries', () => {
  expect(() => readAudioIndex(idx().subarray(0, 10))).toThrow(/Truncated/);
  const signature = idx();
  signature[0] = 0;
  expect(() => readAudioIndex(signature)).toThrow(/signature/);
  const version = idx();
  version[4] = 3;
  expect(() => readAudioIndex(version)).toThrow(/version/);
  expect(() => readAudioIndex(idx().subarray(0, -1))).toThrow(/entries/);
  expect(() => readAudioIndex(idx(['']))).toThrow(/name/);
  expect(() => readAudioIndex(idx(['../outside']))).toThrow(/name/);
  expect(() => readAudioIndex(idx(['Sample', 'sample']))).toThrow(/duplicate/);
});

it('wraps native PCM16 samples and deinterleaves stereo without changing amplitude', () => {
  const bag = Uint8Array.from([99, 99, 0, 128, 255, 127, 0, 0, 0, 64, 99]);
  const wav = audioBagWave(entry({ offset: 2, size: 8, flags: 7, chunkSize: 0 }), bag);
  expect(intSamples(wav)).toEqual([
    [-32768, 0],
    [32767, 16384],
  ]);
  expect(decodeWave(wav).sampleRate).toBe(22050);
  expect([...wav.subarray(44)]).toEqual([...bag.subarray(2, 10)]);
});

it('decodes unsigned PCM8 and skips padded unknown RIFF chunks', () => {
  const wav = wave(
    [1, 0, 1, 0, 0x22, 0x56, 0, 0, 0x22, 0x56, 0, 0, 1, 0, 8, 0],
    [0, 128, 255],
    [
      ['JUNK', [9]],
      ['LIST', [1, 2, 3]],
    ],
  );

  expect([...decodeWave(wav).channels[0]]).toEqual([-1, 0, 127 / 128]);
});

it('decodes IMA low nibbles first with native predictor and step-index updates', () => {
  // Hand-calculated IMA steps, also checked against ffmpeg adpcm_ima_wav.
  const wav = audioBagWave(entry(), Uint8Array.from([0, 0, 0, 0, 0x10, 0x32, 0x54, 0x76]));
  expect(intSamples(wav)).toEqual([[0, 0, 1, 4, 8, 15, 27, 47, 88]]);
});

it('keeps stereo IMA channel state independent across four-byte channel groups', () => {
  const wav = audioBagWave(
    entry({ size: 16, chunkSize: 16, flags: 13 }),
    Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0x10, 0x32, 0x54, 0x76, 0x98, 0xba, 0xdc, 0xfe]),
  );

  expect(intSamples(wav)).toEqual([
    [0, 0, 1, 4, 8, 15, 27, 47, 88],
    [0, 0, -1, -4, -8, -15, -27, -47, -88],
  ]);
});

it('resets IMA state for each block and preserves a trailing partial mono block', () => {
  const wav = audioBagWave(
    entry({ size: 14 }),
    Uint8Array.from([0, 0, 0, 0, 0x10, 0x32, 0x54, 0x76, 100, 0, 0, 0, 0, 0]),
  );

  expect(intSamples(wav)).toEqual([[0, 0, 1, 4, 8, 15, 27, 47, 88, 100, 100, 100, 100, 100]]);
});

it('preserves valid trailing partial stereo blocks and honors fact padding trims', () => {
  const bag = new Uint8Array(40);
  bag.set([10, 0, 0, 0, 20, 0, 0, 0], 24);
  const wav = audioBagWave(entry({ flags: 13, size: 40, chunkSize: 24 }), bag);
  expect(intSamples(wav)).toEqual([
    Array(17).fill(0).concat(Array(9).fill(10)),
    Array(17).fill(0).concat(Array(9).fill(20)),
  ]);
  new DataView(wav.buffer).setUint32(48, 20, true);
  expect(intSamples(wav)).toEqual([
    Array(17).fill(0).concat(Array(3).fill(10)),
    Array(17).fill(0).concat(Array(3).fill(20)),
  ]);
});

it('clamps the IMA predictor and step index without wrapping', () => {
  const wav = audioBagWave(entry({ size: 6 }), Uint8Array.from([0xf8, 0x7f, 88, 0, 0xf7, 0x7f]));
  expect(intSamples(wav)).toEqual([[32760, 32767, -28669, -32768, 28668]]);
});

it('rejects outside BAG slices, unsupported flags, rates, and malformed sample alignment', () => {
  const bag = new Uint8Array(32);

  for (const fields of [
    { offset: -1 },
    { offset: 30 },
    { size: 0 },
    { sampleRate: 0 },
    { flags: 4 },
    { flags: 14 },
    { flags: 0x100c },
    { flags: 6 },
    { flags: 6, chunkSize: 0, size: 7 },
    { chunkSize: 0 },
    { chunkSize: 7 },
    { size: 9 },
    { flags: 13, chunkSize: 16, size: 12 },
  ])
    expect(() => audioBagWave(entry(fields), bag), JSON.stringify(fields)).toThrow();
});

it('rejects truncated WAV chunks, unsupported formats, and invalid IMA state', () => {
  const original = audioBagWave(entry(), new Uint8Array(8));

  const mutate = (at: number, value: number) => {
    const wav = original.slice();
    wav[at] = value;

    return wav;
  };

  expect(() => decodeWave(original.subarray(0, -1))).toThrow(/Truncated/);
  expect(() => decodeWave(mutate(20, 2))).toThrow(/codec/);
  expect(() => decodeWave(mutate(22, 3))).toThrow(/channel count/);
  expect(() => decodeWave(mutate(32, 7))).toThrow(/alignment/);
  expect(() => decodeWave(mutate(38, 8))).toThrow(/extension/);
  expect(() => decodeWave(mutate(48, 99))).toThrow(/fact/);
  expect(() => decodeWave(mutate(62, 89))).toThrow(/state/);
  expect(() => decodeWave(mutate(63, 1))).toThrow(/state/);
  const truncated = original.slice();
  new DataView(truncated.buffer).setUint32(56, 9, true);
  expect(() => decodeWave(truncated)).toThrow(/Truncated/);
});

// No original audio is committed. Hashes below are independently decoded with
// ffmpeg to signed 16-bit interleaved PCM, including the final partial blocks.
describe.skipIf(!process.env.RA2_ASSET_DIR)('original RA2 audio archive', () => {
  it('decodes every original sample and matches independent PCM goldens for all four native formats', () => {
    const language = new MixArchive(readFileSync(join(process.env.RA2_ASSET_DIR!, 'language.mix'))),
      audio = new MixArchive(language.get('audio.mix')!);

    const entries = readAudioIndex(audio.get('audio.idx')!),
      bag = audio.get('audio.bag')!,
      hashes: SampleHashes = {
        icraloop: '64924f5e76d8be65023304959233a64654a2568d749bd7c0921af5cab198f561',
        uscolo1: 'd023d1e6b4239498bbc4f0a03dae262005730fdb3f251ab9d99f9eab23ccca93',
        ichratta: 'cd94c7288aa38769b57976d38594e787fe4b20775858aa574aca35a15b0e34c1',
        uslide1: '706d9462e78741b8931264c642f0ac23df5f3662af06f6e652493c7e2ce5838b',
      };

    expect(entries).toHaveLength(1153);
    const verified: string[] = [];

    for (const entry of entries) {
      const sample = decodeWave(audioBagWave(entry, bag));
      expect(sample.sampleRate, entry.name).toBe(22050);
      expect(sample.channels).toHaveLength(entry.flags & 1 ? 2 : 1);

      if (!hashes[entry.name]) continue;
      const pcm = Buffer.alloc(sample.channels[0].length * sample.channels.length * 2);

      for (let i = 0; i < sample.channels[0].length; i++)
        for (let c = 0; c < sample.channels.length; c++)
          pcm.writeInt16LE(
            Math.round(sample.channels[c][i] * 32768),
            (i * sample.channels.length + c) * 2,
          );
      expect(createHash('sha256').update(pcm).digest('hex'), entry.name).toBe(hashes[entry.name]);
      verified.push(entry.name);
    }

    expect(verified).toHaveLength(4);
  }, 30_000);
});
