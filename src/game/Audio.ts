import { WEAPON_SOUNDS, IFV_SOUNDS, type OriginalSounds } from '../assets/AudioBank';
import type { DecodedAudioSample } from '../assets/AudioSample';
import type { Effect, GameEvent } from './types';
import type { OriginalMusic } from '../assets/MusicBank';
import { GameMusic } from './Music';

/** Original MIX samples only. AudioContext is unlocked by a player gesture. */
export class GameAudio {
  private muted = false;
  private volume = 10;
  private musicLevel = 5;
  private music: GameMusic | null;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new WeakMap<DecodedAudioSample, AudioBuffer>();
  private sources = new Set<AudioBufferSourceNode>();
  private speech: AudioBufferSourceNode | null = null;
  private speechName: string | null = null;
  private speechQueue: string[] = [];
  private seenEvents = new WeakSet<GameEvent>();
  private seenEffects = new WeakSet<Effect>();
  private lastPlayed = new Map<string, number>();
  constructor(
    private readonly originals: () => OriginalSounds | undefined,
    music?: () => OriginalMusic | undefined,
  ) {
    this.music = music ? new GameMusic(music) : null;
  }
  get enabled() {
    return !this.muted;
  }
  set enabled(value: boolean) {
    this.muted = !value;

    if (!value) this.speechQueue = [];
    this.updateGain();
  }
  get effectsVolume() {
    return this.volume;
  }
  set effectsVolume(value: number) {
    this.volume = Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : 0;

    if (this.volume === 0) this.speechQueue = [];
    this.updateGain();
  }
  get musicVolume() {
    return this.musicLevel;
  }
  set musicVolume(value: number) {
    this.musicLevel = Number.isFinite(value) ? Math.max(0, Math.min(10, value)) : 0;
    this.updateGain();
  }
  setMusicPlaying(active: boolean) {
    this.music?.setPlaying(active);
  }
  private updateGain() {
    if (this.master && this.context)
      this.master.gain.setValueAtTime(
        this.enabled ? this.volume / 10 : 0,
        this.context.currentTime,
      );
    this.music?.setLevel(this.enabled ? this.musicLevel / 10 : 0);
  }

  async unlock() {
    // Remember the import/Continue gesture before async asset loading finishes.
    // Music remains inactive until the battlefield is ready, even with a running context.
    if (!this.music && (!this.enabled || this.volume <= 0 || !this.originals()?.size)) return;

    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);
        this.updateGain();
        this.music?.attach(this.context);
        this.context.onstatechange = () => this.music?.sync();
      }

      if (this.context.state === 'suspended') await this.context.resume();
      this.music?.sync();
    } catch {
      /* Unsupported/blocked audio must not stop gameplay; the next gesture may retry. */
    }
  }

  play(name: string) {
    const cue = this.originals()?.get(name),
      context = this.context;

    if (
      !cue ||
      !context ||
      !this.master ||
      context.state !== 'running' ||
      !this.enabled ||
      this.volume <= 0
    )
      return;

    // Prevent frame/burst spam while allowing different weapons and UI/voice channels together.
    const now = context.currentTime,
      last = this.lastPlayed.get(name);

    if (last !== undefined && now - last < (cue.speech ? 0.5 : 0.06)) return;

    if (cue.speech && this.speech) {
      if (
        name !== this.speechName &&
        !this.speechQueue.includes(name) &&
        this.speechQueue.length < 3
      )
        this.speechQueue.push(name);

      return;
    }

    if (this.sources.size >= 16 && !cue.speech) return;
    const sample = cue.samples[Math.floor(Math.random() * cue.samples.length)];
    let buffer = this.buffers.get(sample);

    if (!buffer) {
      buffer = context.createBuffer(
        sample.channels.length,
        sample.channels[0].length,
        sample.sampleRate,
      );
      sample.channels.forEach((channel, index) => buffer!.getChannelData(index).set(channel));
      this.buffers.set(sample, buffer);
    }

    const source = context.createBufferSource(),
      gain = context.createGain();

    source.buffer = buffer;
    gain.gain.setValueAtTime(cue.volume, now);
    source.connect(gain).connect(this.master);

    if (cue.speech) {
      this.speech = source;
      this.speechName = name;
    }

    source.onended = () => {
      this.sources.delete(source);
      source.disconnect();
      gain.disconnect();

      if (this.speech === source) {
        this.speech = null;
        this.speechName = null;
        const next = this.speechQueue.shift();

        if (next) this.play(next);
      }
    };

    this.sources.add(source);
    this.lastPlayed.set(name, now);
    source.start();
  }
  async acknowledge(selection: readonly string[] = []) {
    await this.unlock();
    this.play(selection.includes('sniper') ? 'SniperSelect' : 'CommandBar');
  }
  async tabChanged() {
    await this.unlock();
    this.play('MenuTab');
  }
  async preview() {
    await this.unlock();
    this.play('MenuClick');
  }
  notifications(events: readonly GameEvent[]) {
    for (const event of events)
      if (!this.seenEvents.has(event)) {
        this.seenEvents.add(event);
        this.notification(event);
      }
  }
  notification(event: GameEvent) {
    if (event.sound) this.play(event.sound);
    else if (event.kind === 'warning') this.play('MenuScold');
    else if (event.kind === 'success') this.play('MenuClick');
  }
  effects(effects: readonly Effect[], audible: (effect: Effect) => boolean) {
    for (const effect of effects) {
      if (this.seenEffects.has(effect)) continue;
      this.seenEffects.add(effect);

      if (!audible(effect)) continue;

      if (effect.kind === 'shot') {
        const name =
          effect.sourceType === 'ifv' && IFV_SOUNDS[effect.passengerType ?? '']
            ? IFV_SOUNDS[effect.passengerType!]
            : effect.sourceType === 'gi' && effect.deployed
              ? 'GIAttackDeployed'
              : effect.sourceType === 'flak' && effect.airTarget
                ? 'FlakTrackAttackAir'
                : WEAPON_SOUNDS[effect.sourceType ?? ''];

        if (name) this.play(name);
      } else if (effect.kind === 'explosion') this.play('Explosion01');
    }
  }
  reset() {
    this.music?.reset();
    this.speech = null;
    this.speechName = null;
    this.speechQueue = [];

    for (const source of this.sources) source.stop();
    this.sources.clear();
    this.seenEvents = new WeakSet();
    this.lastPlayed.clear();
    this.seenEffects = new WeakSet();
  }
}
