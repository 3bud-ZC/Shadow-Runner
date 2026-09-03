import { SaveManager } from '../storage/SaveManager';

export class AudioSystem {
  private static instance: AudioSystem | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private muted: boolean = false;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 1.0;

  // Ragtime Jazz BGM Scheduler
  private bgmIntervalId: number | null = null;
  private bgmStep: number = 0;
  private bgmTempoMs: number = 220; // ~136 BPM Stride tempo

  private constructor() {
    this.muted = SaveManager.isMuted();
    const settings = SaveManager.getSettings();
    this.masterVolume = settings.masterVolume;
    this.sfxVolume = settings.sfxVolume;
    this.initAudioContext();
  }

  public static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  private initAudioContext(): void {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.bgmGain = this.ctx.createGain();
        this.updateMasterGain();
        this.bgmGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch {
      this.ctx = null;
    }
  }

  private updateMasterGain(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const targetGain = this.muted ? 0 : Math.min(1.0, Math.max(0, 0.35 * this.masterVolume * this.sfxVolume));
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(targetGain, now);

    if (this.bgmGain) {
      const bgmTarget = this.muted ? 0 : 0.28 * this.masterVolume;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(bgmTarget, now);
    }
  }

  public unlock(): void {
    if (!this.ctx) {
      this.initAudioContext();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignored
      });
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    SaveManager.setMuted(muted);
    this.updateMasterGain();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.min(1, Math.max(0, vol));
    SaveManager.updateSettings({ masterVolume: this.masterVolume });
    this.updateMasterGain();
  }

  public setSfxVolume(vol: number): void {
    this.sfxVolume = Math.min(1, Math.max(0, vol));
    SaveManager.updateSettings({ sfxVolume: this.sfxVolume });
    this.updateMasterGain();
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  // --- PROCEDURAL 1930s RAGTIME JAZZ PIANO BGM ---
  public startJazzBGM(): void {
    if (typeof window === 'undefined') return;
    if (this.bgmIntervalId !== null) return;
    this.bgmStep = 0;
    this.bgmIntervalId = window.setInterval(() => {
      this.tickJazzBeat();
    }, this.bgmTempoMs);
  }

  public stopJazzBGM(): void {
    if (typeof window === 'undefined') return;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public setBGMTempo(speedMultiplier: number): void {
    if (typeof window === 'undefined') return;
    const baseTempo = 220;
    this.bgmTempoMs = Math.max(140, Math.floor(baseTempo / speedMultiplier));
    if (this.bgmIntervalId !== null) {
      this.stopJazzBGM();
      this.startJazzBGM();
    }
  }

  private tickJazzBeat(): void {
    if (this.muted || !this.ctx || !this.bgmGain) return;

    // Classic Stride Jazz Pattern in D minor (16 steps = 4 bars)
    // Step % 4 == 0: Low Bass Stride
    // Step % 4 == 1 or 3: Snappy Offbeat Chord
    // Step % 4 == 2: High Bass Stride
    const stepInBar = this.bgmStep % 4;
    const bar = Math.floor((this.bgmStep % 16) / 4);

    const bassNotes = [146.83, 130.81, 116.54, 110.0]; // D3, C3, Bb2, A2
    const chordRoots = [
      [220, 261.63, 349.23], // Dm chord
      [196, 246.94, 293.66], // G7 chord
      [233.08, 293.66, 349.23], // Bb chord
      [220, 277.18, 329.63], // A7 chord
    ];

    const now = this.ctx.currentTime;

    if (stepInBar === 0 || stepInBar === 2) {
      // Stride Bass Note
      const bassFreq = bassNotes[bar] * (stepInBar === 2 ? 1.5 : 1.0);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(bassFreq, now);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } else {
      // Offbeat Stride Piano Chords
      const chord = chordRoots[bar];
      chord.forEach((f) => {
        if (!this.ctx || !this.bgmGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.bgmGain);
        osc.start(now);
        osc.stop(now + 0.12);
      });
    }

    this.bgmStep++;
  }

  // --- CARTOON SFX ---

  public playMenuClick(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playJump(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.11);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.16);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playDoubleJump(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playWallJump(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.09);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playSpringBounce(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Huge comedic trampoline twang
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.28);

    gain.gain.setValueAtTime(0.48, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playBananaSlip(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Comic slide & wobble
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.22);
    osc.frequency.linearRampToValueAtTime(320, now + 0.32);

    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playLand(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.07);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playDash(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.13);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playOrbCollect(comboMultiplier: number = 1.0): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const baseFreq = 587.33 * (1 + (comboMultiplier - 1.0) * 0.25);

    [baseFreq, baseFreq * 1.5].forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.035);

      gain.gain.setValueAtTime(0.32, now + i * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.035 + 0.24);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.035);
      osc.stop(now + i * 0.035 + 0.24);
    });
  }

  public playShadowWarning(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.setValueAtTime(160, now + 0.07);
    osc.frequency.setValueAtTime(90, now + 0.14);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playStageIncrease(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const fanfare = [392, 493.88, 587.33, 783.99];

    fanfare.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.28, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.3);
    });
  }

  public playCollapseWarning(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(480, now + 0.2);
    osc.frequency.linearRampToValueAtTime(160, now + 0.4);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  public playCollapseStart(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.55);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  public playCollapseSuccess(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const fanfare = [523.25, 659.25, 783.99, 1046.5];

    fanfare.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.35, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  public playDeath(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    
    // Whistle slide down
    const whistle = this.ctx.createOscillator();
    const whistleGain = this.ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(640, now);
    whistle.frequency.exponentialRampToValueAtTime(110, now + 0.35);

    whistleGain.gain.setValueAtTime(0.4, now);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    whistle.connect(whistleGain);
    whistleGain.connect(this.masterGain);
    whistle.start(now);
    whistle.stop(now + 0.36);

    // Splat Thump
    const splat = this.ctx.createOscillator();
    const splatGain = this.ctx.createGain();
    splat.type = 'triangle';
    splat.frequency.setValueAtTime(120, now + 0.3);
    splat.frequency.exponentialRampToValueAtTime(35, now + 0.48);

    splatGain.gain.setValueAtTime(0.55, now + 0.3);
    splatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    splat.connect(splatGain);
    splatGain.connect(this.masterGain);
    splat.start(now + 0.3);
    splat.stop(now + 0.5);
  }
}
