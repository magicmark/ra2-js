/** RA2 audio.idx/audio.bag layout: XCC misc/xse.cpp and audio_idx_file.cpp.
 * https://github.com/OlafvdSpek/xcc/blob/master/misc/xse.cpp
 * IMA WAV blocks follow the per-channel state and four-byte channel groups in
 * https://github.com/OpenRA/OpenRA/blob/bleed/OpenRA.Mods.Common/FileFormats/WavReader.cs
 * Decoding locally avoids browser-dependent support for compressed WAV files.
 */
export interface AudioIndexEntry {
  name: string;
  offset: number;
  size: number;
  sampleRate: number;
  flags: number;
  chunkSize: number;
}

export interface DecodedAudioSample {
  sampleRate: number;
  channels: Float32Array[];
}

const view = (bytes: Uint8Array) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

const text = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

function check<T>(ok: T, message: string): asserts ok {
  if (!ok) throw new Error(message);
}

export function readAudioIndex(bytes: Uint8Array): AudioIndexEntry[] {
  check(bytes.length >= 12, 'Truncated audio.idx header');

  const data = view(bytes),
    count = data.getUint32(8, true);

  check(
    text(bytes.subarray(0, 4)) === 'GABA' && data.getUint32(4, true) === 2,
    'Invalid audio.idx signature or version',
  );
  check(count > 0 && count <= Math.floor((bytes.length - 12) / 36), 'Truncated audio.idx entries');

  const entries: AudioIndexEntry[] = [],
    names = new Set<string>();

  for (let i = 0; i < count; i++) {
    const start = 12 + i * 36,
      raw = bytes.subarray(start, start + 16),
      end = raw.indexOf(0);

    check(end > 0, 'Invalid audio.idx sample name');
    // Retail records can contain garbage after their first NUL byte.
    const name = text(raw.subarray(0, end)).toLowerCase();
    check(
      /^[a-z0-9_$-]+$/.test(name) && !names.has(name),
      `Invalid or duplicate audio.idx sample name: ${name}`,
    );
    names.add(name);
    entries.push({
      name,
      offset: data.getUint32(start + 16, true),
      size: data.getUint32(start + 20, true),
      sampleRate: data.getUint32(start + 24, true),
      flags: data.getUint32(start + 28, true),
      chunkSize: data.getUint32(start + 32, true),
    });
  }

  return entries;
}

function imaFrameCount(size: number, blockAlign: number, channels: number): number {
  check(
    Number.isInteger(blockAlign) &&
      blockAlign >= channels * 4 &&
      blockAlign <= 65535 &&
      blockAlign % (channels * 4) === 0,
    'Invalid IMA WAV block alignment',
  );

  const full = Math.floor(size / blockAlign),
    partial = size % blockAlign;

  check(!partial || partial >= channels * 4, 'Truncated IMA WAV block header');
  check(
    channels === 1 || !partial || (partial - channels * 4) % 8 === 0,
    'Truncated IMA WAV stereo channel group',
  );

  return (
    full * (1 + ((blockAlign - channels * 4) * 2) / channels) +
    (partial ? 1 + ((partial - channels * 4) * 2) / channels : 0)
  );
}

/** Preserve the original encoded sample while giving the selected cache a WAV header. */
export function audioBagWave(entry: AudioIndexEntry, bag: Uint8Array): Uint8Array {
  const { offset, size, sampleRate, flags, chunkSize } = entry;
  check(
    Number.isInteger(offset) &&
      offset >= 0 &&
      Number.isInteger(size) &&
      size > 0 &&
      offset + size <= bag.length,
    `${entry.name}: audio.bag sample outside archive`,
  );
  check(
    Number.isInteger(sampleRate) && sampleRate > 0 && sampleRate <= 384000,
    `${entry.name}: invalid audio sample rate`,
  );

  const channels = flags & 1 ? 2 : 1,
    pcm = !!(flags & 2);

  check(
    !(flags & ~15) && (pcm ? !(flags & 8) : !!(flags & 8)),
    `${entry.name}: unsupported audio.idx sample flags`,
  );
  const blockAlign = pcm ? channels * 2 : chunkSize;
  check(
    !pcm || (chunkSize === 0 && size % blockAlign === 0),
    `${entry.name}: invalid PCM audio.bag sample`,
  );
  const frames = pcm ? size / blockAlign : imaFrameCount(size, blockAlign, channels);
  const samplesPerBlock = 1 + ((blockAlign - channels * 4) * 2) / channels;
  check(
    pcm || samplesPerBlock <= 65535,
    `${entry.name}: IMA sample block exceeds WAV format limits`,
  );

  const header = pcm ? 44 : 60,
    result = new Uint8Array(header + size + (size & 1)),
    data = view(result);

  const word = (at: number, value: string) => result.set(new TextEncoder().encode(value), at);
  word(0, 'RIFF');
  data.setUint32(4, result.length - 8, true);
  word(8, 'WAVE');
  word(12, 'fmt ');
  data.setUint32(16, pcm ? 16 : 20, true);
  data.setUint16(20, pcm ? 1 : 0x11, true);
  data.setUint16(22, channels, true);
  data.setUint32(24, sampleRate, true);
  data.setUint32(
    28,
    pcm ? sampleRate * blockAlign : Math.floor((sampleRate * blockAlign) / samplesPerBlock),
    true,
  );
  data.setUint16(32, blockAlign, true);
  data.setUint16(34, pcm ? 16 : 4, true);

  if (!pcm) {
    data.setUint16(36, 2, true);
    data.setUint16(38, samplesPerBlock, true);
    word(40, 'fact');
    data.setUint32(44, 4, true);
    data.setUint32(48, frames, true);
  }

  word(header - 8, 'data');
  data.setUint32(header - 4, size, true);
  result.set(bag.subarray(offset, offset + size), header);

  return result;
}

const IMA_INDEX = [-1, -1, -1, -1, 2, 4, 6, 8];

const IMA_STEP = [
  7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45, 50, 55, 60, 66, 73,
  80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230, 253, 279, 307, 337, 371, 408, 449, 494,
  544, 598, 658, 724, 796, 876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499,
  2749, 3024, 3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487,
  12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767,
];

function readWave(bytes: Uint8Array) {
  check(
    bytes.length >= 12 &&
      text(bytes.subarray(0, 4)) === 'RIFF' &&
      text(bytes.subarray(8, 12)) === 'WAVE',
    'Invalid WAV header',
  );

  const data = view(bytes),
    end = data.getUint32(4, true) + 8;

  check(end >= 12 && end <= bytes.length, 'Truncated WAV RIFF container');
  let format: Uint8Array | undefined, body: Uint8Array | undefined, fact: number | undefined;

  for (let offset = 12; offset < end;) {
    check(offset + 8 <= end, 'Truncated WAV chunk header');

    const name = text(bytes.subarray(offset, offset + 4)),
      size = data.getUint32(offset + 4, true),
      start = offset + 8;

    check(start + size + (size & 1) <= end, `Truncated WAV ${name} chunk`);

    if (name === 'fmt ') {
      check(!format, 'Duplicate WAV format chunk');
      format = bytes.subarray(start, start + size);
    } else if (name === 'data') {
      check(!body, 'Duplicate WAV data chunk');
      body = bytes.subarray(start, start + size);
    } else if (name === 'fact') {
      check(fact === undefined && size >= 4, 'Invalid WAV fact chunk');
      fact = data.getUint32(start, true);
    }

    offset = start + size + (size & 1);
  }

  check(
    format && format.length >= 16 && body && body.length > 0,
    'Missing WAV format or sample data',
  );

  const fmt = view(format),
    codec = fmt.getUint16(0, true),
    channelCount = fmt.getUint16(2, true),
    sampleRate = fmt.getUint32(4, true),
    blockAlign = fmt.getUint16(12, true),
    bits = fmt.getUint16(14, true);

  check(channelCount === 1 || channelCount === 2, 'Unsupported WAV channel count');
  check(sampleRate > 0 && sampleRate <= 384000, 'Invalid WAV sample rate');

  if (codec === 1) {
    check(
      (bits === 8 || bits === 16) &&
        blockAlign === (channelCount * bits) / 8 &&
        body.length % blockAlign === 0,
      'Invalid PCM WAV format or sample alignment',
    );

    return {
      codec,
      channelCount,
      sampleRate,
      blockAlign,
      bits,
      frames: body.length / blockAlign,
      body,
    };
  }

  check(codec === 0x11 && bits === 4, 'Unsupported WAV audio codec');

  const available = imaFrameCount(body.length, blockAlign, channelCount),
    samplesPerBlock = 1 + ((blockAlign - 4 * channelCount) * 2) / channelCount;

  check(
    format.length >= 20 &&
      fmt.getUint16(16, true) >= 2 &&
      fmt.getUint16(16, true) + 18 <= format.length &&
      fmt.getUint16(18, true) === samplesPerBlock,
    'Invalid IMA WAV format extension',
  );
  const frames = fact ?? available;
  check(frames > 0 && frames <= available, 'Invalid IMA WAV fact sample count');

  for (let block = 0; block < body.length; block += blockAlign)
    for (let c = 0; c < channelCount; c++) {
      const at = block + c * 4;
      check(body[at + 2] <= 88 && body[at + 3] === 0, 'Invalid IMA WAV block state');
    }

  return { codec, channelCount, sampleRate, blockAlign, bits, frames, body };
}

/** Validate compressed music without allocating minutes of decoded PCM. */
export function validateWave(bytes: Uint8Array): void {
  readWave(bytes);
}

export function decodeWave(bytes: Uint8Array): DecodedAudioSample {
  const { codec, channelCount, sampleRate, blockAlign, bits, frames, body } = readWave(bytes);

  const channels = Array.from({ length: channelCount }, () => new Float32Array(frames)),
    encoded = view(body);

  if (codec === 1) {
    for (let i = 0; i < frames; i++)
      for (let c = 0; c < channelCount; c++) {
        const offset = ((i * channelCount + c) * bits) / 8;
        channels[c][i] =
          bits === 8 ? (body[offset] - 128) / 128 : encoded.getInt16(offset, true) / 32768;
      }

    return { sampleRate, channels };
  }

  let frameBase = 0;

  for (let block = 0; block < body.length; block += blockAlign) {
    const blockEnd = Math.min(body.length, block + blockAlign),
      predictor: number[] = [],
      index: number[] = [];

    for (let c = 0; c < channelCount; c++) {
      const at = block + c * 4;
      predictor[c] = encoded.getInt16(at, true);
      index[c] = body[at + 2];

      if (frameBase < frames) channels[c][frameBase] = predictor[c] / 32768;
    }

    let cursor = block + channelCount * 4,
      frame = frameBase + 1;

    while (cursor < blockEnd) {
      const bytesPerChannel = Math.min(4, (blockEnd - cursor) / channelCount);

      for (let c = 0; c < channelCount; c++)
        for (let i = 0; i < bytesPerChannel; i++) {
          const packed = body[cursor++];

          for (let half = 0; half < 2; half++) {
            const nibble = (packed >> (half * 4)) & 15,
              step = IMA_STEP[index[c]];

            const delta =
              (step >> 3) +
              (nibble & 1 ? step >> 2 : 0) +
              (nibble & 2 ? step >> 1 : 0) +
              (nibble & 4 ? step : 0);

            predictor[c] = Math.max(
              -32768,
              Math.min(32767, predictor[c] + (nibble & 8 ? -delta : delta)),
            );
            index[c] = Math.max(0, Math.min(88, index[c] + IMA_INDEX[nibble & 7]));
            const target = frame + i * 2 + half;

            if (target < frames) channels[c][target] = predictor[c] / 32768;
          }
        }

      frame += bytesPerChannel * 2;
    }

    frameBase = frame;
  }

  return { sampleRate, channels };
}
