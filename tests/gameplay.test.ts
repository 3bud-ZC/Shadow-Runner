import { describe, it, expect, beforeEach } from 'vitest';
import { DifficultySystem } from '../src/systems/DifficultySystem';
import { ScoreSystem } from '../src/systems/ScoreSystem';
import { SpawnSystem } from '../src/systems/SpawnSystem';
import { SaveManager } from '../src/storage/SaveManager';
import { SpawnPoint } from '../src/world/SpawnPoints';

describe('DifficultySystem', () => {
  let difficulty: DifficultySystem;

  beforeEach(() => {
    difficulty = new DifficultySystem();
  });

  it('progresses through stages and scales shadow target count at exact thresholds', () => {
    // Stage 1: 0 - 15s -> 1 Shadow
    let res = difficulty.update(0);
    expect(res.stage).toBe(1);
    expect(res.targetShadowCount).toBe(1);
    expect(res.stageChanged).toBe(false);

    res = difficulty.update(14999);
    expect(res.stage).toBe(1);
    expect(res.targetShadowCount).toBe(1);

    // Stage 2: 15s - 30s -> 2 Shadows
    res = difficulty.update(15000);
    expect(res.stage).toBe(2);
    expect(res.targetShadowCount).toBe(2);
    expect(res.stageChanged).toBe(true);

    // Stage 3: 30s - 50s -> 3 Shadows
    res = difficulty.update(30000);
    expect(res.stage).toBe(3);
    expect(res.targetShadowCount).toBe(3);
    expect(res.stageChanged).toBe(true);

    // Stage 4: 50s - 75s -> 4 Shadows
    res = difficulty.update(50000);
    expect(res.stage).toBe(4);
    expect(res.targetShadowCount).toBe(4);
    expect(res.stageChanged).toBe(true);

    // Stage 5: 75s+ -> 5 Shadows (capped at 5)
    res = difficulty.update(75000);
    expect(res.stage).toBe(5);
    expect(res.targetShadowCount).toBe(5);
    expect(res.stageChanged).toBe(true);

    // High survival time maintains cap of 5
    res = difficulty.update(150000);
    expect(res.stage).toBe(5);
    expect(res.targetShadowCount).toBe(5);
  });

  it('resets cleanly back to stage 1', () => {
    difficulty.update(50000);
    expect(difficulty.getCurrentStage().stage).toBe(4);
    difficulty.reset();
    expect(difficulty.getCurrentStage().stage).toBe(1);
    expect(difficulty.getTargetShadowCount()).toBe(1);
  });
});

describe('ScoreSystem', () => {
  let scoreSystem: ScoreSystem;

  beforeEach(() => {
    scoreSystem = new ScoreSystem();
  });

  it('awards survival points based on elapsed time (+10 pts/sec)', () => {
    scoreSystem.update(5000); // 5 seconds
    expect(scoreSystem.getTotalScore()).toBe(50);

    scoreSystem.update(12400); // 12.4 seconds -> 124 pts
    expect(scoreSystem.getTotalScore()).toBe(124);
  });

  it('applies combo multipliers on rapid consecutive orb collections', () => {
    // 1st Orb at t = 1000ms: x1.0 multiplier -> +100 pts
    const orb1 = scoreSystem.collectOrb(1000);
    expect(orb1.comboMultiplier).toBe(1.0);
    expect(orb1.addedPoints).toBe(100);

    // 2nd Orb at t = 2000ms (< 5000ms window): x1.2 multiplier -> +120 pts
    const orb2 = scoreSystem.collectOrb(2000);
    expect(orb2.comboMultiplier).toBe(1.2);
    expect(orb2.addedPoints).toBe(120);

    // 3rd Orb at t = 3000ms: x1.5 multiplier -> +150 pts
    const orb3 = scoreSystem.collectOrb(3000);
    expect(orb3.comboMultiplier).toBe(1.5);
    expect(orb3.addedPoints).toBe(150);

    // 4th Orb: x2.0 -> +200 pts
    const orb4 = scoreSystem.collectOrb(4000);
    expect(orb4.comboMultiplier).toBe(2.0);
    expect(orb4.addedPoints).toBe(200);

    // 5th Orb: x2.5 -> +250 pts
    const orb5 = scoreSystem.collectOrb(5000);
    expect(orb5.comboMultiplier).toBe(2.5);
    expect(orb5.addedPoints).toBe(250);

    // 6th Orb: x3.0 (Capped) -> +300 pts
    const orb6 = scoreSystem.collectOrb(6000);
    expect(orb6.comboMultiplier).toBe(3.0);
    expect(orb6.addedPoints).toBe(300);

    // 7th Orb: remains at cap x3.0
    const orb7 = scoreSystem.collectOrb(7000);
    expect(orb7.comboMultiplier).toBe(3.0);
    expect(orb7.addedPoints).toBe(300);

    expect(scoreSystem.getOrbsCollected()).toBe(7);
    expect(scoreSystem.getMaxCombo()).toBe(3.0);
  });

  it('calculates combo progress remaining percentage', () => {
    scoreSystem.collectOrb(1000); // 1st orb
    scoreSystem.collectOrb(2000); // 2nd orb (combo active)
    expect(scoreSystem.getComboProgress(2000)).toBeCloseTo(1.0);
    expect(scoreSystem.getComboProgress(4500)).toBeCloseTo(0.5); // 2500ms / 5000ms remaining
    expect(scoreSystem.getComboProgress(7000)).toBe(0);
  });

  it('resets combo multiplier when combo timeout expires (> 5000ms)', () => {
    scoreSystem.collectOrb(1000); // x1.0
    scoreSystem.collectOrb(2000); // x1.2
    expect(scoreSystem.getCurrentCombo()).toBe(1.2);

    // Advance time past 5s combo window without collecting
    scoreSystem.update(8000); // 8000 - 2000 = 6000ms > 5000ms
    expect(scoreSystem.getCurrentCombo()).toBe(1.0);

    // Next collection starts over at x1.0
    const nextOrb = scoreSystem.collectOrb(8500);
    expect(nextOrb.comboMultiplier).toBe(1.0);
  });

  it('resets completely on reset()', () => {
    scoreSystem.update(10000);
    scoreSystem.collectOrb(2000);
    expect(scoreSystem.getTotalScore()).toBeGreaterThan(0);

    scoreSystem.reset();
    expect(scoreSystem.getTotalScore()).toBe(0);
    expect(scoreSystem.getOrbsCollected()).toBe(0);
    expect(scoreSystem.getCurrentCombo()).toBe(1.0);
    expect(scoreSystem.getMaxCombo()).toBe(1.0);
  });
});

describe('SpawnSystem', () => {
  const mockPoints: SpawnPoint[] = [
    { id: 1, x: 100, y: 100, name: 'P1', riskTier: 'low' },
    { id: 2, x: 500, y: 500, name: 'P2', riskTier: 'medium' },
    { id: 3, x: 900, y: 500, name: 'P3', riskTier: 'high' },
  ];

  it('selects safe spawn points away from the player', () => {
    const spawnSystem = new SpawnSystem(mockPoints, 200);

    // Player at (100, 100) -> P1 is at distance 0 (< 200), P2 is far
    const selected = spawnSystem.selectNextSpawnPoint(100, 100);
    expect(selected.id).not.toBe(1);
    expect([2, 3]).toContain(selected.id);
  });

  it('avoids immediately repeating the previous spawn point', () => {
    const spawnSystem = new SpawnSystem(mockPoints, 0);

    const first = spawnSystem.selectNextSpawnPoint(0, 0);
    const second = spawnSystem.selectNextSpawnPoint(0, 0);
    expect(second.id).not.toBe(first.id);
  });

  it('handles fallback when all points are close to player', () => {
    const closePoints: SpawnPoint[] = [
      { id: 1, x: 100, y: 100, name: 'Close 1', riskTier: 'low' },
      { id: 2, x: 110, y: 110, name: 'Close 2', riskTier: 'low' },
    ];
    const spawnSystem = new SpawnSystem(closePoints, 500); // 500px min dist

    const selected = spawnSystem.selectNextSpawnPoint(100, 100);
    expect([1, 2]).toContain(selected.id);
  });

  it('handles empty or single spawn point arrays gracefully', () => {
    const emptySpawn = new SpawnSystem([]);
    expect(emptySpawn.selectNextSpawnPoint(0, 0).id).toBe(0);

    const singleSpawn = new SpawnSystem([{ id: 99, x: 200, y: 200, name: 'Single', riskTier: 'low' }]);
    expect(singleSpawn.selectNextSpawnPoint(0, 0).id).toBe(99);
  });
});

describe('SaveManager', () => {
  beforeEach(() => {
    SaveManager.reset();
  });

  it('returns default values when no data exists in storage', () => {
    const data = SaveManager.load();
    expect(data.bestScore).toBe(0);
    expect(data.longestSurvivalMs).toBe(0);
    expect(data.mostOrbs).toBe(0);
  });

  it('updates records only when higher values are achieved', () => {
    const res1 = SaveManager.recordRun(500, 20000, 5);
    expect(res1.isNewBestScore).toBe(true);
    expect(res1.isNewLongestSurvival).toBe(true);
    expect(res1.isNewMostOrbs).toBe(true);
    expect(res1.currentSave.bestScore).toBe(500);

    // Lower run
    const res2 = SaveManager.recordRun(300, 15000, 2);
    expect(res2.isNewBestScore).toBe(false);
    expect(res2.isNewLongestSurvival).toBe(false);
    expect(res2.isNewMostOrbs).toBe(false);
    expect(res2.currentSave.bestScore).toBe(500);

    // Partial new record (more orbs, lower score)
    const res3 = SaveManager.recordRun(400, 18000, 8);
    expect(res3.isNewBestScore).toBe(false);
    expect(res3.isNewMostOrbs).toBe(true);
    expect(res3.currentSave.bestScore).toBe(500);
    expect(res3.currentSave.mostOrbs).toBe(8);
  });

  it('handles invalid inputs and sanitized values safely', () => {
    const res = SaveManager.recordRun(-100, -500, -10);
    expect(res.currentSave.bestScore).toBe(0);
    expect(res.currentSave.longestSurvivalMs).toBe(0);
    expect(res.currentSave.mostOrbs).toBe(0);
  });
});
