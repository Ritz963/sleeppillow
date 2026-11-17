"use client";

import type { SoundId } from "./model";

/**
 * Ambient soundscapes generated live with the Web Audio API — no audio files or licences needed.
 * One voice at a time: starting a sound fades out whatever was playing.
 * Nothing starts without an explicit user action (browsers also enforce this).
 */

type Voice = { id: SoundId; out: GainNode; dispose: () => void };
type Listener = () => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers: Partial<Record<"white" | "pink" | "brown", AudioBuffer>> = {};
  private voice: Voice | null = null;
  private listeners = new Set<Listener>();
  private volume = 0.6;

  playing: SoundId | null = null;

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getSnapshot = () => this.playing;
  private emit() {
    this.listeners.forEach((l) => l());
  }

  get supported() {
    return typeof window !== "undefined" && ("AudioContext" in window || "webkitAudioContext" in window);
  }

  private ensure() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume * 0.8;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return { ctx: this.ctx, master: this.master! };
  }

  private noise(kind: "white" | "pink" | "brown") {
    const ctx = this.ctx!;
    if (this.buffers[kind]) return this.buffers[kind]!;
    const length = ctx.sampleRate * 6;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const d = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "white") d[i] = w * 0.5;
      else if (kind === "pink") {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    this.buffers[kind] = buffer;
    return buffer;
  }

  private loop(kind: "white" | "pink" | "brown") {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise(kind);
    src.loop = true;
    src.loopStart = Math.random() * 2;
    return src;
  }

  private lfo(freq: number, depth: number, target: AudioParam) {
    const osc = this.ctx!.createOscillator();
    osc.frequency.value = freq;
    const g = this.ctx!.createGain();
    g.gain.value = depth;
    osc.connect(g).connect(target);
    return osc;
  }

  private filter(type: BiquadFilterType, frequency: number, Q = 0.7) {
    const f = this.ctx!.createBiquadFilter();
    f.type = type;
    f.frequency.value = frequency;
    f.Q.value = Q;
    return f;
  }

  private gain(value: number) {
    const g = this.ctx!.createGain();
    g.gain.value = value;
    return g;
  }

  private build(id: SoundId, out: GainNode): () => void {
    const ctx = this.ctx!;
    const sources: AudioScheduledSourceNode[] = [];
    const timers: ReturnType<typeof setInterval>[] = [];

    if (id === "ocean") {
      const body = this.loop("brown");
      const lp = this.filter("lowpass", 520);
      const swell = this.gain(0.55);
      body.connect(lp).connect(swell).connect(out);
      const foam = this.loop("pink");
      const bp = this.filter("bandpass", 1400, 0.5);
      const foamGain = this.gain(0.12);
      foam.connect(bp).connect(foamGain).connect(out);
      sources.push(
        body, foam,
        this.lfo(0.085, 0.45, swell.gain),
        this.lfo(0.085, 320, lp.frequency),
        this.lfo(0.085, 0.1, foamGain.gain),
        this.lfo(0.031, 0.12, swell.gain),
      );
    } else if (id === "rain") {
      const hiss = this.loop("pink");
      const hp = this.filter("highpass", 900);
      const lp = this.filter("lowpass", 7000);
      hiss.connect(hp).connect(lp).connect(this.gain(0.42)).connect(out);
      const rumble = this.loop("brown");
      rumble.connect(this.filter("lowpass", 280)).connect(this.gain(0.35)).connect(out);
      sources.push(hiss, rumble);
      const white = this.noise("white");
      timers.push(
        setInterval(() => {
          if (Math.random() > 0.55) return;
          const t = ctx.currentTime + Math.random() * 0.04;
          const drop = ctx.createBufferSource();
          drop.buffer = white;
          const f = this.filter("bandpass", 2200 + Math.random() * 4200, 4);
          const g = ctx.createGain();
          const peak = 0.08 + Math.random() * 0.3;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(peak, t + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.05);
          drop.connect(f).connect(g).connect(out);
          drop.start(t, Math.random() * 5, 0.12);
        }, 45),
      );
    } else {
      const wind = this.loop("brown");
      const bp = this.filter("bandpass", 480, 0.9);
      const windGain = this.gain(0.6);
      wind.connect(bp).connect(windGain).connect(out);
      const leaves = this.loop("pink");
      const leavesGain = this.gain(0.035);
      leaves.connect(this.filter("highpass", 3200)).connect(leavesGain).connect(out);
      sources.push(
        wind, leaves,
        this.lfo(0.06, 280, bp.frequency),
        this.lfo(0.11, 0.3, windGain.gain),
        this.lfo(0.06, 0.03, leavesGain.gain),
      );
      timers.push(
        setInterval(() => {
          if (Math.random() > 0.45) return;
          // distant cricket: three tiny chirps
          const base = ctx.currentTime + 0.05;
          for (let i = 0; i < 3; i++) {
            const t = base + i * 0.07;
            const osc = ctx.createOscillator();
            osc.frequency.value = 4300 + Math.random() * 200;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.018, t + 0.01);
            g.gain.linearRampToValueAtTime(0, t + 0.04);
            osc.connect(g).connect(out);
            osc.start(t);
            osc.stop(t + 0.05);
          }
        }, 1400),
      );
    }

    sources.forEach((s) => s.start());
    return () => {
      timers.forEach(clearInterval);
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* already stopped */
        }
      });
      out.disconnect();
    };
  }

  play(id: SoundId) {
    if (!this.supported) return;
    if (this.playing === id && this.voice) return;
    const { ctx, master } = this.ensure();
    this.fadeOutCurrent();
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, ctx.currentTime);
    out.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
    out.connect(master);
    this.voice = { id, out, dispose: this.build(id, out) };
    this.playing = id;
    this.emit();
  }

  stop() {
    this.fadeOutCurrent();
    this.playing = null;
    this.emit();
  }

  toggle(id: SoundId) {
    if (this.playing === id) this.stop();
    else this.play(id);
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(v * 0.8, this.ctx.currentTime, 0.05);
  }

  private fadeOutCurrent() {
    const voice = this.voice;
    if (!voice || !this.ctx) return;
    this.voice = null;
    const now = this.ctx.currentTime;
    voice.out.gain.cancelScheduledValues(now);
    voice.out.gain.setValueAtTime(voice.out.gain.value, now);
    voice.out.gain.linearRampToValueAtTime(0, now + 0.5);
    setTimeout(voice.dispose, 600);
  }
}

export const soundEngine = new SoundEngine();
