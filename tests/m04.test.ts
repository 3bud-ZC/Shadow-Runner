import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCollapseSystem, MemoryCollapseState } from '../src/systems/MemoryCollapseSystem';
import { RecordingSystem } from '../src/systems/RecordingSystem';
import { SaveManager } from '../src/storage/SaveManager';
import { SpawnSystem } from '../src/systems/SpawnSystem';
import { ScoreSystem } from '../src/systems/ScoreSystem';
import { DifficultySystem } from '../src/systems/DifficultySystem';
import { DEFAULT_SETTINGS } from '../src/game/constants';
import { ARENA_ORB_SPAWN_POINTS } from '../src/world/SpawnPoints';

describe('Milestone 04: MemoryCollapseSystem', () => {
  let recordingSystem: RecordingSystem;
  let collapseSystem: MemoryCollapseSystem;

  beforeEach(() => {
    recordingSystem = new RecordingSystem();
    collapseSystem = new MemoryCollapseSystem(recordingSystem, {
      TRIGGER_TIME_MS: 60000,
      WARNING_DURATION_MS: 3000,
      EVENT_DURATION_MS: 20000,
      HISTORY_SOURCE_MS: 30000,
      PLAYBACK_SPEED: 1.25,
      SURVIVAL_BONUS_SCORE: 1000,
    });

    // Populate historical recordings across 0s to 70s
    for (let t = 0; t <= 70000; t += 50) {
      recordingSystem.record(t, {
        x: 100 + t * 0.01,
        y: 200,
        velocityX: 100,
        velocityY: 0,
        facing: 'right',
        dashing: false,
        grounded: true,
      });
    }
  });

  it('progresses through INACTIVE, WARNING, ACTIVE, and SURVIVED states sequentially', () => {
    // 1. Inactive at 50s
    let res = collapseSystem.update(50000);
    expect(res.state).toBe(MemoryCollapseState.INACTIVE);
    expect(res.isWarning).toBe(false);
    expect(res.isActive).toBe(false);
    expect(res.isSurvived).toBe(false);

    // 2. Warning triggered at 58s (57s-60s window)
    res = collapseSystem.update(58000);
    expect(res.state).toBe(MemoryCollapseState.WARNING);
    expect(res.isWarning).toBe(true);
    expect(res.justTriggeredWarning).toBe(true);
    expect(res.isActive).toBe(false);
    expect(res.warningCountdownSec).toBeCloseTo(2.0, 1);

    // Subsequent warning tick should not re-flag justTriggeredWarning
    res = collapseSystem.update(59000);
    expect(res.isWarning).toBe(true);
    expect(res.justTriggeredWarning).toBe(false);

    // 3. Active starting at 60s
    res = collapseSystem.update(60000);
    expect(res.state).toBe(MemoryCollapseState.ACTIVE);
    expect(res.isActive).toBe(true);
    expect(res.justStarted).toBe(true);
    expect(res.snapshot).not.toBeNull();

    // Active at 70s (10s into event)
    res = collapseSystem.update(70000);
    expect(res.isActive).toBe(true);
    expect(res.justStarted).toBe(false);
    expect(res.snapshot).not.toBeNull();

    // 4. Survived at 80s+ (60s + 20s event duration)
    res = collapseSystem.update(80000);
    expect(res.state).toBe(MemoryCollapseState.SURVIVED);
    expect(res.isSurvived).toBe(true);
    expect(res.justSurvived).toBe(true);
    expect(collapseSystem.hasSurvived()).toBe(true);

    // Subsequent tick should not re-flag justSurvived
    res = collapseSystem.update(81000);
    expect(res.isSurvived).toBe(true);
    expect(res.justSurvived).toBe(false);
  });

  it('calculates historical time-compression playback correctly without mutating buffer', () => {
    // At 4 seconds into collapse (64000ms):
    // Expected sample time = 30000 + 4000 * 1.25 = 35000ms
    const res = collapseSystem.update(64000);
    expect(res.isActive).toBe(true);
    expect(res.snapshot).not.toBeNull();

    // Expected snapshot position at 35000ms: x = 100 + 35000 * 0.01 = 450
    expect(res.snapshot?.x).toBeCloseTo(450, 0);

    // Verify original recording buffer is intact
    const originalSnapshot = recordingSystem.sampleAt(35000);
    expect(originalSnapshot?.x).toBeCloseTo(450, 0);
  });

  it('resets cleanly when starting a new run', () => {
    collapseSystem.update(85000);
    expect(collapseSystem.hasSurvived()).toBe(true);

    collapseSystem.reset();
    expect(collapseSystem.getState()).toBe(MemoryCollapseState.INACTIVE);
    expect(collapseSystem.hasReached()).toBe(false);
    expect(collapseSystem.hasSurvived()).toBe(false);
  });
});

describe('Milestone 04: Settings & Persistence', () => {
  beforeEach(() => {
    SaveManager.reset();
  });

  it('provides safe default settings and clamps out-of-bounds numeric inputs', () => {
    const defaults = SaveManager.getSettings();
    expect(defaults.masterVolume).toBe(DEFAULT_SETTINGS.masterVolume);
    expect(defaults.screenShake).toBe(true);
    expect(defaults.touchControlsOpacity).toBe(0.7);

    // Test sanitization with out-of-bounds inputs
    const sanitized = SaveManager.sanitizeSettings({
      masterVolume: 2.5,
      sfxVolume: -0.5,
      touchControlsOpacity: 0.1,
    });

    expect(sanitized.masterVolume).toBe(1.0);
    expect(sanitized.sfxVolume).toBe(0.0);
    expect(sanitized.touchControlsOpacity).toBe(0.3);
  });

  it('persists and updates partial settings cleanly', () => {
    SaveManager.updateSettings({
      masterVolume: 0.5,
      screenShake: false,
    });

    const updated = SaveManager.getSettings();
    expect(updated.masterVolume).toBe(0.5);
    expect(updated.screenShake).toBe(false);
    expect(updated.sfxVolume).toBe(1.0); // Preserved
  });
});

describe('Milestone 04: Risk-Aware Spawning & Extended Difficulty', () => {
  it('selects valid spawn points across varying risk weights', () => {
    const spawnSystem = new SpawnSystem(ARENA_ORB_SPAWN_POINTS, 200);

    for (let i = 0; i < 30; i++) {
      const ptLow = spawnSystem.selectNextSpawnPoint(640, 360, 0.1);
      expect(ptLow).toBeDefined();
      expect(ptLow.x).toBeGreaterThan(0);

      const ptHigh = spawnSystem.selectNextSpawnPoint(640, 360, 0.9);
      expect(ptHigh).toBeDefined();
      expect(ptHigh.x).toBeGreaterThan(0);
    }
  });

  it('scales difficulty through 5 stages with maximum 5 normal shadows', () => {
    const diff = new DifficultySystem();

    const s1 = diff.update(0);
    expect(s1.stage).toBe(1);
    expect(s1.targetShadowCount).toBe(1);

    const s3 = diff.update(35000);
    expect(s3.stage).toBe(3);
    expect(s3.targetShadowCount).toBe(3);
    expect(s3.comboTimeoutMs).toBeLessThanOrEqual(5000);

    const s5 = diff.update(85000);
    expect(s5.stage).toBe(5);
    expect(s5.targetShadowCount).toBe(5);
    expect(s5.comboTimeoutMs).toBe(4000);
  });

  it('supports bonus scores and dynamic combo timeouts in ScoreSystem', () => {
    const score = new ScoreSystem();
    score.setComboTimeout(4000);

    score.collectOrb(1000);
    expect(score.getStats().orbScore).toBe(100);

    // Add Memory Collapse bonus score
    score.addBonusScore(1000);
    expect(score.getStats().bonusScore).toBe(1000);
    expect(score.getTotalScore()).toBeGreaterThanOrEqual(1100);
  });
});
