import { describe, it, expect, beforeEach } from 'vitest';
import { InputSystem } from '../src/systems/InputSystem';
import { SaveManager } from '../src/storage/SaveManager';
import { ScoreSystem } from '../src/systems/ScoreSystem';
import { AudioSystem } from '../src/systems/AudioSystem';
import { DEFAULT_SETTINGS } from '../src/game/constants';

describe('Milestone 05 Regression: InputSystem Focus & Cleanup', () => {
  let mockScene: any;
  let inputSystem: InputSystem;

  beforeEach(() => {
    mockScene = {
      input: {
        keyboard: {
          createCursorKeys: () => ({
            left: { isDown: false },
            right: { isDown: false },
            up: { isDown: false },
            shift: { isDown: false },
          }),
          addKey: () => ({ isDown: false }),
          resetKeys: () => {},
        },
      },
    };
    inputSystem = new InputSystem(mockScene);
  });

  it('resets all virtual and keyboard inputs on resetAll() without throwing', () => {
    inputSystem.setTouchLeft(true);
    inputSystem.setTouchJump(true, true);
    inputSystem.setTouchDash(true);
    inputSystem.setTouchPause(true);

    inputSystem.resetAll();

    const state = inputSystem.getState();
    expect(state.moveX).toBe(0);
    expect(state.jumpPressed).toBe(false);
    expect(state.jumpHeld).toBe(false);
    expect(state.dashPressed).toBe(false);
    expect(state.pausePressed).toBe(false);
  });

  it('cleans up handlers on destroy()', () => {
    expect(() => inputSystem.destroy()).not.toThrow();
  });
});

describe('Milestone 05 Regression: SaveManager Schema Migration & Resilience', () => {
  beforeEach(() => {
    SaveManager.reset();
  });

  it('recovers gracefully from corrupted or legacy localStorage data', () => {
    const legacyCorruptedData = {
      bestScore: 'invalid_number',
      longestSurvivalMs: null,
      mostOrbs: -50,
      settings: {
        masterVolume: 'loud',
        sfxVolume: 999,
        touchControlsOpacity: -1,
      },
    };

    // Save directly to memory fallback simulating corrupted storage
    SaveManager.save(legacyCorruptedData as any);

    const loaded = SaveManager.load();
    expect(loaded.bestScore).toBe(0);
    expect(loaded.longestSurvivalMs).toBe(0);
    expect(loaded.mostOrbs).toBe(0);
    expect(loaded.settings?.masterVolume).toBe(DEFAULT_SETTINGS.masterVolume);
    expect(loaded.settings?.sfxVolume).toBe(1.0); // Clamped to 1.0
    expect(loaded.settings?.touchControlsOpacity).toBe(0.3); // Clamped to min 0.3
  });

  it('preserves existing high scores when lower scores are submitted', () => {
    SaveManager.recordRun(5000, 45000, 25);
    const firstResult = SaveManager.load();
    expect(firstResult.bestScore).toBe(5000);
    expect(firstResult.longestSurvivalMs).toBe(45000);
    expect(firstResult.mostOrbs).toBe(25);

    // Worse run
    const res = SaveManager.recordRun(2000, 15000, 10);
    expect(res.isNewBestScore).toBe(false);
    expect(res.isNewLongestSurvival).toBe(false);
    expect(res.isNewMostOrbs).toBe(false);

    const afterWorse = SaveManager.load();
    expect(afterWorse.bestScore).toBe(5000);
    expect(afterWorse.longestSurvivalMs).toBe(45000);
    expect(afterWorse.mostOrbs).toBe(25);
  });
});

describe('Milestone 05 Regression: ScoreSystem Timing & Combo Bounds', () => {
  it('correctly handles multi-orb combo scaling without multiplier drift', () => {
    const score = new ScoreSystem();
    score.setComboTimeout(5000);

    // Collect 6 orbs quickly within combo timeout
    for (let i = 1; i <= 6; i++) {
      const res = score.collectOrb(i * 1000);
      expect(res.comboMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(res.comboMultiplier).toBeLessThanOrEqual(3.0);
    }

    expect(score.getMaxCombo()).toBe(3.0);
    expect(score.getOrbsCollected()).toBe(6);
  });
});

describe('Milestone 05 Regression: AudioSystem Dynamic Gain Control', () => {
  it('updates master and SFX volumes with valid range constraints', () => {
    const audio = AudioSystem.getInstance();

    audio.setMasterVolume(0.8);
    expect(audio.getMasterVolume()).toBe(0.8);

    audio.setSfxVolume(0.5);
    expect(audio.getSfxVolume()).toBe(0.5);

    // Out of bounds clamp
    audio.setMasterVolume(1.5);
    expect(audio.getMasterVolume()).toBe(1.0);

    audio.setSfxVolume(-0.2);
    expect(audio.getSfxVolume()).toBe(0.0);

    // Restore to standard
    audio.setMasterVolume(1.0);
    audio.setSfxVolume(1.0);
  });
});
