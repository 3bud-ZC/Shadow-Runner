import { SaveManager } from '../storage/SaveManager';

export class AudioSystem {
  private static instance: AudioSystem | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted: boolean = false;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 1.0;

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
        this.updateMasterGain();
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

  /**
   * Cartoon Spring "Boing!" Jump
   */
  public playJump(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Bouncy spring curve with rubber vibrato
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

  /**
   * Cartoon Wood Thud / Plop
   */
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

  /**
   * Cartoon Smoke Bomb Dash ("Poof! / Whoosh")
   */
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

  /**
   * Melodic Golden Shinobi Scroll Chime ("Ding!")
   */
  public playOrbCollect(comboMultiplier: number = 1.0): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    const baseFreq = 587.33 * (1 + (comboMultiplier - 1.0) * 0.25); // D5

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
    const fanfare = [392, 493.88, 587.33, 783.99]; // G4, B4, D5, G5 (Ragtime chord)

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
    const fanfare = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

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

  /**
   * Cartoon Slide Whistle Down + Splat!
   */
  public playDeath(): void {
    if (this.muted || !this.ctx || !this.masterGain) return;
    this.unlock();

    const now = this.ctx.currentTime;
    
    // 1. Whistle slide down
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

    // 2. Comic Splat! Bass Thump
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
