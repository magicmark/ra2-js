import type { OriginalMusic } from '../assets/MusicBank';
import { decodeWave } from '../assets/AudioSample';

/** A sequential original soundtrack. Retain only the current decoded track. */
export class GameMusic {
  private active = false;
  private level = 0.5;
  private index = 0;
  private offset = 0;
  private startedAt = 0;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private context: AudioContext | null = null;
  private failed = false;
  constructor(private readonly originals: () => OriginalMusic | undefined) {}

  attach(context: AudioContext) {
    this.context = context;
    this.gain = context.createGain();
    this.gain.connect(context.destination);
    this.sync();
  }
  setPlaying(active: boolean) {
    if (this.active === active) return;
    this.active = active;
    this.sync();
  }
  setLevel(level: number) {
    this.level = level;
    this.sync();
  }

  // Called after gesture resume as well as browser-driven context state changes.
  sync() {
    const context = this.context,
      gain = this.gain;

    if (!context || !gain) return;
    gain.gain.setValueAtTime(this.level, context.currentTime);

    if (!this.active || this.level <= 0) {
      this.pause();

      return;
    }

    if (context.state !== 'running' || this.source || this.failed) return;
    const tracks = this.originals();

    if (!tracks?.length) return;

    try {
      if (!this.buffer) {
        const sample = decodeWave(tracks[this.index % tracks.length].bytes);
        this.buffer = context.createBuffer(
          sample.channels.length,
          sample.channels[0].length,
          sample.sampleRate,
        );
        sample.channels.forEach((channel, index) =>
          this.buffer!.getChannelData(index).set(channel),
        );
      }

      const source = context.createBufferSource();
      source.buffer = this.buffer;
      source.connect(gain);
      source.onended = () => {
        source.disconnect();

        if (this.source !== source) return;
        this.source = null;
        this.buffer = null;
        this.offset = 0;
        this.index = (this.index + 1) % tracks.length;
        this.sync();
      };

      this.source = source;
      this.startedAt = context.currentTime;
      source.start(0, this.offset);
    } catch (error) {
      this.pause();
      this.failed = true;
      console.warn('Unable to play original music.', error);
    }
  }
  private pause() {
    const source = this.source;

    if (!source) return;
    this.source = null;
    this.offset =
      (this.offset + Math.max(0, this.context!.currentTime - this.startedAt)) %
      this.buffer!.duration;
    source.onended = null;
    source.stop();
    source.disconnect();
  }
  reset() {
    this.active = false;
    this.pause();
    this.index = 0;
    this.offset = 0;
    this.buffer = null;
    this.failed = false;
  }
}
