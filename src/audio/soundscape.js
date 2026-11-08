/**
 * Soundscape - every sound in the game, synthesised with the Web Audio API.
 *
 * Nothing here loads a file. The crowd is filtered noise with a slow swell,
 * the whistle is two detuned square oscillators with a vibrato wobble, and
 * kicks, goals and the menu click are short shaped bursts. The AudioContext
 * is only created after a user gesture, which browsers require.
 */
export class Soundscape {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.context = null;
    this.master = null;
    this.crowd = null;
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.context) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.context = new AudioCtx();
      this.master = this.context.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    return this.context;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!this.master) return;
    const ctx = this.context;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(enabled ? 0.8 : 0, ctx.currentTime + 0.15);
  }

  // --- Crowd ambience -------------------------------------------------------

  startCrowd() {
    const ctx = this.ensureContext();
    if (!ctx || this.crowd) return;

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      // Brown-ish noise: low rumble rather than hiss.
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 420;
    bandpass.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.value = 0.0001;

    // A slow LFO gives the crowd its breathing swell.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.11;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(gain.gain);

    source.connect(bandpass).connect(gain).connect(this.master);
    source.start();
    lfo.start();
    gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 2.5);

    this.crowd = { source, gain, lfo, bandpass };
  }

  /** Lift the crowd for a moment, e.g. a shot or a near miss. */
  crowdSwell(amount = 0.12, seconds = 1.6) {
    if (!this.crowd || !this.context) return;
    const g = this.crowd.gain.gain;
    const now = this.context.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(Math.min(0.5, 0.16 + amount), now + 0.25);
    g.exponentialRampToValueAtTime(0.16, now + seconds);
  }

  stopCrowd() {
    if (!this.crowd || !this.context) return;
    const now = this.context.currentTime;
    const { source, lfo, gain } = this.crowd;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    source.stop(now + 1.3);
    lfo.stop(now + 1.3);
    this.crowd = null;
  }

  // --- Whistle ---------------------------------------------------------------

  whistle(pattern = 'single') {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const blows = {
      single: [[0, 0.55]],
      kickoff: [[0, 0.35]],
      halfTime: [[0, 0.3], [0.4, 0.3]],
      fullTime: [[0, 0.25], [0.35, 0.25], [0.7, 0.8]]
    }[pattern] || [[0, 0.5]];
    blows.forEach(([offset, length]) => this.whistleBlow(ctx.currentTime + offset, length));
  }

  whistleBlow(startTime, length) {
    const ctx = this.context;
    const output = ctx.createGain();
    output.gain.setValueAtTime(0.0001, startTime);
    output.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
    output.gain.setValueAtTime(0.35, startTime + length - 0.05);
    output.gain.exponentialRampToValueAtTime(0.0001, startTime + length);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 1500;

    [2650, 2715].forEach(frequency => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = frequency;
      const vibrato = ctx.createOscillator();
      vibrato.frequency.value = 38;
      const vibratoGain = ctx.createGain();
      vibratoGain.gain.value = 60;
      vibrato.connect(vibratoGain).connect(osc.frequency);
      osc.connect(highpass);
      osc.start(startTime);
      osc.stop(startTime + length + 0.05);
      vibrato.start(startTime);
      vibrato.stop(startTime + length + 0.05);
    });
    highpass.connect(output).connect(this.master);
  }

  // --- Short effects ---------------------------------------------------------

  kick(power = 0.5) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160 + power * 80, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25 + power * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  post() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.4);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  goal() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.crowdSwell(0.3, 3.5);
    const now = ctx.currentTime;
    // A rising three-note horn figure.
    [[0, 392], [0.12, 494], [0.24, 587]].forEach(([offset, frequency]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = frequency;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.55);
      osc.connect(filter).connect(gain).connect(this.master);
      osc.start(now + offset);
      osc.stop(now + offset + 0.6);
    });
  }

  click() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}
