import { afterEach, expect, it, vi } from 'vitest';
import { GameAudio } from '../src/game/Audio';
import type { OriginalMusic } from '../src/assets/MusicBank';
import { audioBagWave } from '../src/assets/AudioSample';

interface AudioListener {
  onstatechange: (() => void) | null;
}

interface SourceListener {
  onended: (() => void) | null;
}

function initialAudioListener(): AudioListener {
  return { onstatechange: null };
}

function initialSourceListener(): SourceListener {
  return { onended: null };
}

function fixture() {
  const wave = audioBagWave(
    { name: 'track', offset: 0, size: 40, sampleRate: 10, flags: 2, chunkSize: 0 },
    new Uint8Array(40),
  );

  const tracks = [
    { name: 'First', bytes: wave },
    { name: 'Second', bytes: wave.slice() },
  ];

  let music: OriginalMusic | undefined = tracks;

  const sources: any[] = [],
    gains: any[] = [];

  const context = {
    state: 'running',
    currentTime: 1,
    destination: {},
    ...initialAudioListener(),
    resume: vi.fn(async () => {
      context.state = 'running';
    }),
    createBuffer: vi.fn((channels: number, length: number, rate: number) => ({
      duration: length / rate,
      getChannelData: () => new Float32Array(length),
    })),
    createBufferSource() {
      const source = {
        buffer: null,
        ...initialSourceListener(),
        start: vi.fn(),
        stop: vi.fn(),
        connect: vi.fn((node) => node),
        disconnect: vi.fn(),
      };

      sources.push(source);

      return source;
    },
    createGain() {
      const gain = {
        gain: { setValueAtTime: vi.fn() },
        connect: vi.fn((node) => node),
        disconnect: vi.fn(),
      };

      gains.push(gain);

      return gain;
    },
  };

  const constructor = vi.fn(function () {
    return context;
  });

  vi.stubGlobal('AudioContext', constructor);

  const audio = new GameAudio(
    () => new Map(),
    () => music,
  );

  return {
    audio,
    context,
    sources,
    gains,
    constructor,
    available: (value: boolean) => {
      music = value ? tracks : undefined;
    },
  };
}

afterEach(() => vi.unstubAllGlobals());

it('waits for a gesture and battle readiness, including an import gesture before async assets arrive', async () => {
  const { audio, constructor, sources, available } = fixture();
  audio.setMusicPlaying(true);
  expect(constructor).not.toHaveBeenCalled();
  audio.setMusicPlaying(false);
  available(false);
  audio.effectsVolume = 0;
  await audio.unlock();
  expect(constructor).toHaveBeenCalledOnce();
  expect(sources).toHaveLength(0);
  available(true);
  audio.setMusicPlaying(true);
  expect(sources).toHaveLength(1);
  expect(sources[0].start).toHaveBeenCalledWith(0, 0);
  await audio.unlock();
  audio.setMusicPlaying(true);
  expect(sources).toHaveLength(1);
});

it('retries blocked autoplay on a later gesture and resumes browser-suspended playback without overlap', async () => {
  const { audio, sources, context } = fixture();
  context.state = 'suspended';
  context.resume.mockRejectedValueOnce(new Error('blocked'));
  audio.setMusicPlaying(true);
  await audio.unlock();
  expect(sources).toHaveLength(0);
  await audio.unlock();
  expect(sources).toHaveLength(1);
  context.state = 'suspended';
  context.onstatechange?.();
  await audio.unlock();
  context.onstatechange?.();
  expect(sources).toHaveLength(1);
});

it('advances through the soundtrack, wraps, and retains only one decoded track', async () => {
  const { audio, sources, context } = fixture();
  await audio.unlock();
  audio.setMusicPlaying(true);
  expect(context.createBuffer).toHaveBeenCalledTimes(1);

  for (let i = 0; i < 3; i++) {
    sources[i].onended();
    expect(sources[i].disconnect).toHaveBeenCalledOnce();
    expect(sources[i + 1].buffer).not.toBe(sources[i].buffer);
  }

  expect(context.createBuffer).toHaveBeenCalledTimes(4);
  const music = audio['music'];
  expect(music?.['index']).toBe(1);
  expect(music?.['buffer']).toBe(sources[3].buffer);
});

it('keeps music/effects gain independent, applies mute live, and resumes at the paused position', async () => {
  const { audio, sources, gains, context } = fixture();
  await audio.unlock();
  audio.setMusicPlaying(true);
  expect(gains[1].gain.setValueAtTime).toHaveBeenLastCalledWith(0.5, 1);
  audio.effectsVolume = 0;
  expect(gains[0].gain.setValueAtTime).toHaveBeenLastCalledWith(0, 1);
  expect(sources[0].stop).not.toHaveBeenCalled();
  audio.musicVolume = 3;
  expect(gains[1].gain.setValueAtTime).toHaveBeenLastCalledWith(0.3, 1);
  context.currentTime = 1.7;
  audio.enabled = false;
  expect(sources[0].stop).toHaveBeenCalledOnce();
  expect(sources[0].onended).toBeNull();
  expect(gains[1].gain.setValueAtTime).toHaveBeenLastCalledWith(0, 1.7);
  context.currentTime = 20;
  audio.enabled = true;
  expect(sources[1].start.mock.calls[0][1]).toBeCloseTo(0.7);
  expect(context.createBuffer).toHaveBeenCalledOnce();
  audio.musicVolume = NaN;
  expect(audio.musicVolume).toBe(0);
  expect(sources[1].stop).toHaveBeenCalledOnce();
  audio.musicVolume = 99;
  expect(audio.musicVolume).toBe(10);
  expect(sources).toHaveLength(3);
});

it('pauses immediately while hidden; reset prevents late ended callbacks and restarts the first track', async () => {
  const { audio, sources, context } = fixture();
  await audio.unlock();
  audio.setMusicPlaying(true);
  context.currentTime = 1.5;
  audio.setMusicPlaying(false);
  expect(sources[0].stop).toHaveBeenCalledOnce();
  expect(sources[0].disconnect).toHaveBeenCalledOnce();
  context.currentTime = 30;
  audio.setMusicPlaying(true);
  expect(sources[1].start).toHaveBeenCalledWith(0, 0.5);
  const stale = sources[1].onended;
  audio.reset();
  stale();
  expect(sources).toHaveLength(2);
  expect(audio['music']?.['buffer']).toBeNull();
  audio.setMusicPlaying(true);
  expect(sources[2].start).toHaveBeenCalledWith(0, 0);
  expect(context.createBuffer).toHaveBeenCalledTimes(2);
});
