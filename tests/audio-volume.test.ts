import { afterEach, expect, it, vi } from 'vitest';
import { GameAudio } from '../src/game/Audio';
import type { Effect, GameEvent } from '../src/game/types';
import type { OriginalSounds } from '../src/assets/AudioBank';

function fixture() {
  const sample = { sampleRate: 22050, channels: [new Float32Array([0, .5, -.5, 0])] };
  const bank: OriginalSounds = new Map(['MenuClick', 'MenuTab', 'CommandBar', 'SniperSelect', 'MenuScold', 'GIAttack', 'GIAttackDeployed', 'IFVAttackGround', 'SealAttack', 'GrizzlyTankAttack', 'Explosion01', 'EVA_UnitReady', 'EVA_ConstructionComplete'].map(name => [name, { samples: [sample], volume: name === 'SniperSelect' ? .9 : .6, speech: name.startsWith('EVA_') }]));
  const gains: { gain: { setValueAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];
  const sources: { buffer: unknown; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; onended?: () => void }[] = [];
  const context = {
    state: 'running', currentTime: 1, destination: {}, resume: vi.fn(async () => { context.state = 'running'; }),
    createBuffer: vi.fn((_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) })),
    createBufferSource() { const source = { buffer: null, start: vi.fn(), stop: vi.fn(), connect: vi.fn(node => node), disconnect: vi.fn() }; sources.push(source); return source; },
    createGain() { const gain = { gain: { setValueAtTime: vi.fn() }, connect: vi.fn(node => node), disconnect: vi.fn() }; gains.push(gain); return gain; },
  };
  const constructor = vi.fn(function () { return context; }); vi.stubGlobal('AudioContext', constructor);
  let available = true;
  const audio = new GameAudio(() => available ? bank : undefined);
  return { audio, context, constructor, gains, sources, available: (value: boolean) => { available = value; } };
}
afterEach(() => vi.unstubAllGlobals());

it('voices Sniper selection through effects settings while orders retain their command cue', async () => {
  const { audio, context, gains, sources } = fixture(), played = vi.spyOn(audio, 'play');
  audio.effectsVolume = 5; audio.musicVolume = 0;
  await audio.acknowledge(['gi', 'sniper', 'sniper']);
  expect(played).toHaveBeenLastCalledWith('SniperSelect'); expect(sources).toHaveLength(1);
  expect(gains[0].gain.setValueAtTime).toHaveBeenLastCalledWith(.5, 1);
  expect(gains[1].gain.setValueAtTime).toHaveBeenLastCalledWith(.9, 1);
  context.currentTime++; audio.effectsVolume = 0; await audio.acknowledge(['sniper']);
  audio.effectsVolume = 10; audio.enabled = false; await audio.acknowledge(['sniper']);
  expect(sources).toHaveLength(1);
  audio.enabled = true; context.state = 'suspended';
  context.resume.mockRejectedValueOnce(new Error('blocked')); await audio.acknowledge(['sniper']);
  expect(sources).toHaveLength(1);
  await audio.acknowledge(['sniper']); expect(sources).toHaveLength(2);
  context.currentTime++; await audio.acknowledge();
  expect(played).toHaveBeenLastCalledWith('CommandBar');
  context.currentTime++; await audio.acknowledge(['gi']);
  expect(played).toHaveBeenLastCalledWith('CommandBar'); expect(sources).toHaveLength(4);
});

it('plays the original tab cue through effects settings, independently of music volume', async () => {
  const { audio, context, gains, sources } = fixture();
  const played = vi.spyOn(audio, 'play');
  audio.effectsVolume = 5; audio.musicVolume = 0; await audio.tabChanged();
  expect(played).toHaveBeenLastCalledWith('MenuTab'); expect(sources).toHaveLength(1);
  expect(gains[0].gain.setValueAtTime).toHaveBeenLastCalledWith(.5, 1);
  expect(gains[1].gain.setValueAtTime).toHaveBeenLastCalledWith(.6, 1);
  context.currentTime++; audio.effectsVolume = 0; await audio.tabChanged();
  audio.effectsVolume = 10; audio.enabled = false; await audio.tabChanged();
  expect(sources).toHaveLength(1);
  audio.enabled = true; await audio.tabChanged(); expect(sources).toHaveLength(2);
  context.currentTime++; context.state = 'suspended';
  context.resume.mockRejectedValueOnce(new Error('blocked')); await audio.tabChanged();
  expect(sources).toHaveLength(2);
  await audio.tabChanged(); expect(sources).toHaveLength(3);
});

it('uses original sample buffers and authored volume; master volume and mute affect active playback', async () => {
  const { audio, constructor, gains, sources, context } = fixture();
  audio.effectsVolume = 0; await audio.preview(); expect(constructor).not.toHaveBeenCalled();
  audio.effectsVolume = 5; await audio.preview();
  expect(sources[0].start).toHaveBeenCalledOnce(); expect(context.createBuffer).toHaveBeenCalledWith(1, 4, 22050);
  expect(gains[0].gain.setValueAtTime).toHaveBeenLastCalledWith(.5, 1);
  expect(gains[1].gain.setValueAtTime).toHaveBeenLastCalledWith(.6, 1);
  audio.effectsVolume = 2; expect(gains[0].gain.setValueAtTime).toHaveBeenLastCalledWith(.2, 1);
  audio.enabled = false; expect(gains[0].gain.setValueAtTime).toHaveBeenLastCalledWith(0, 1);
  await audio.acknowledge(); expect(sources).toHaveLength(1);
  audio.enabled = true; expect(gains[0].gain.setValueAtTime).toHaveBeenLastCalledWith(.2, 1);
  audio.effectsVolume = NaN; expect(audio.effectsVolume).toBe(0);
});

it('waits for gesture resume, handles autoplay rejection, and never synthesizes missing originals', async () => {
  const { audio, available, context, constructor, sources } = fixture();
  audio.play('MenuClick'); expect(constructor).not.toHaveBeenCalled();
  available(false); await audio.preview(); expect(constructor).not.toHaveBeenCalled();
  available(true); context.state = 'suspended'; context.resume.mockRejectedValueOnce(new Error('blocked'));
  await audio.preview(); expect(sources).toHaveLength(0);
  await audio.preview(); expect(sources).toHaveLength(1);
  available(false); context.currentTime++; await audio.preview(); expect(sources).toHaveLength(1);
});

it('plays weapon-specific effects once and suppresses unseen effects and burst overload', async () => {
  const { audio, sources, context } = fixture(); await audio.unlock();
  const played = vi.spyOn(audio, 'play');
  const effect = (sourceType: string): Effect => ({ kind: 'shot', sourceType, x: 1, y: 1, life: .16, maxLife: .16 });
  const first = effect('gi'); audio.effects([first], () => true); audio.effects([first], () => true);
  expect(played).toHaveBeenCalledTimes(1); expect(played).toHaveBeenLastCalledWith('GIAttack');
  audio.effects([effect('gi')], () => true); expect(sources).toHaveLength(1);
  audio.effects([{ ...effect('gi'), deployed: true }, effect('grizzly')], () => true);
  expect(sources).toHaveLength(3); expect(played).toHaveBeenLastCalledWith('GrizzlyTankAttack');
  const hidden = effect('grizzly'); audio.effects([hidden], () => false); context.currentTime++;
  audio.effects([hidden], () => true); expect(sources).toHaveLength(3);
  for (let i = 0; i < 25; i++) { context.currentTime++; audio.effects([effect('gi')], () => true); }
  expect(sources).toHaveLength(16);
});

it('queues simultaneous EVA notifications once, prevents overlapping speech, and stops sounds on reset', async () => {
  const { audio, sources, context } = fixture(); await audio.unlock(); const played = vi.spyOn(audio, 'play');
  const event = (sound?: string): GameEvent => ({ id: 1, text: 'Ready', kind: 'success', time: 0, sound });
  const events = [event('EVA_UnitReady'), event('EVA_ConstructionComplete')];
  audio.notifications(events); audio.notifications(events);
  expect(sources).toHaveLength(1); expect(sources[0].stop).not.toHaveBeenCalled();
  context.currentTime++; sources[0].onended?.(); expect(sources).toHaveLength(2);
  expect(played).toHaveBeenLastCalledWith('EVA_ConstructionComplete');
  audio.notification(event()); expect(played).toHaveBeenLastCalledWith('MenuClick');
  audio.reset(); expect(sources.slice(1).every(source => source.stop.mock.calls.length > 0)).toBe(true);
  sources.slice(1).forEach(source => source.onended?.());
  expect(sources.every(source => source.disconnect.mock.calls.length === 1)).toBe(true);
});

it('uses the simulated IFV passenger weapon instead of missile audio', async () => {
  const { audio } = fixture(); await audio.unlock(); const played = vi.spyOn(audio, 'play');
  for (const [passengerType, sound] of [['gi', 'IFVAttackGround'], ['spy', 'IFVAttackGround'], ['tanya', 'SealAttack'], ['sniper', 'SniperAttack'], ['chrono_legionnaire', 'ChronoLegionAttack']]) {
    audio.effects([{ kind: 'shot', sourceType: 'ifv', passengerType, x: 1, y: 1, life: .16, maxLife: .16 }], () => true);
    expect(played).toHaveBeenLastCalledWith(sound);
  }
});

it.each(['mute', 'volume'])('drops queued EVA messages on %s without replaying them later', async mode => {
  const { audio, sources, context } = fixture(); await audio.unlock();
  audio.play('EVA_UnitReady'); audio.play('EVA_ConstructionComplete');
  if (mode === 'mute') audio.enabled = false; else audio.effectsVolume = 0;
  context.currentTime++; sources[0].onended?.();
  audio.enabled = true; audio.effectsVolume = 10; audio.play('EVA_UnitReady');
  context.currentTime++; sources[1].onended?.(); expect(sources).toHaveLength(2);
});
