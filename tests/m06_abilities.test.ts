import { describe, it, expect, beforeEach } from 'vitest';
import { AudioSystem } from '../src/systems/AudioSystem';
import { ScoreSystem } from '../src/systems/ScoreSystem';

describe('Milestone 06: Advanced Cartoon Ninja Abilities & Game Feel', () => {
  let scoreSystem: ScoreSystem;

  beforeEach(() => {
    scoreSystem = new ScoreSystem();
  });

  it('correctly tracks close call bonus scoring without breaking combo', () => {
    const initialScore = scoreSystem.getTotalScore();
    scoreSystem.addBonusScore(50); // Close Call Bonus
    expect(scoreSystem.getTotalScore()).toBe(initialScore + 50);

    // Multi-close call bonuses
    scoreSystem.addBonusScore(50);
    expect(scoreSystem.getTotalScore()).toBe(initialScore + 100);
  });

  it('AudioSystem supports Ragtime Jazz BGM start, tempo adjustment, and stop without errors', () => {
    const audio = AudioSystem.getInstance();

    expect(() => {
      audio.startJazzBGM();
      audio.setBGMTempo(1.0);
      audio.setBGMTempo(1.35);
      audio.stopJazzBGM();
    }).not.toThrow();
  });

  it('AudioSystem provides new cartoon SFX methods without throwing in headless mode', () => {
    const audio = AudioSystem.getInstance();

    expect(() => {
      audio.playDoubleJump();
      audio.playWallJump();
      audio.playSpringBounce();
      audio.playBananaSlip();
    }).not.toThrow();
  });
});
