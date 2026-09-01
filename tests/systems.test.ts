import { describe, it, expect, beforeEach } from 'vitest';
import { RecordingSystem } from '../src/systems/RecordingSystem';
import { ShadowPlaybackSystem, ShadowState } from '../src/systems/ShadowPlaybackSystem';

describe('RecordingSystem', () => {
  let recording: RecordingSystem;

  beforeEach(() => {
    recording = new RecordingSystem(50, 5);
  });

  it('records snapshots at given intervals and throttles high frequency calls', () => {
    const recorded1 = recording.record(0, {
      x: 100,
      y: 200,
      velocityX: 50,
      velocityY: 0,
      facing: 'right',
      grounded: true,
      dashing: false,
    });
    expect(recorded1).toBe(true);
    expect(recording.getCount()).toBe(1);

    const recorded2 = recording.record(20, {
      x: 110,
      y: 200,
      velocityX: 50,
      velocityY: 0,
      facing: 'right',
      grounded: true,
      dashing: false,
    });
    expect(recorded2).toBe(false);
    expect(recording.getCount()).toBe(1);

    const recorded3 = recording.record(50, {
      x: 150,
      y: 200,
      velocityX: 50,
      velocityY: 0,
      facing: 'right',
      grounded: true,
      dashing: false,
    });
    expect(recorded3).toBe(true);
    expect(recording.getCount()).toBe(2);
  });

  it('enforces bounded maximum snapshots without unbounded growth', () => {
    for (let t = 0; t < 500; t += 50) {
      recording.record(t, {
        x: t,
        y: 100,
        velocityX: 10,
        velocityY: 0,
        facing: 'right',
        grounded: true,
        dashing: false,
      });
    }

    expect(recording.getCount()).toBe(5);
    const snapshots = recording.getSnapshots();
    expect(snapshots[0].timestamp).toBe(250);
    expect(snapshots[4].timestamp).toBe(450);
  });

  it('interpolates positions smoothly between recorded samples', () => {
    const system = new RecordingSystem(50, 100);
    system.record(1000, {
      x: 100,
      y: 200,
      velocityX: 100,
      velocityY: 50,
      facing: 'right',
      grounded: true,
      dashing: false,
    });
    system.record(1050, {
      x: 200,
      y: 300,
      velocityX: 100,
      velocityY: 50,
      facing: 'right',
      grounded: true,
      dashing: false,
    });

    const sample = system.sampleAt(1025);
    expect(sample).not.toBeNull();
    expect(sample!.x).toBeCloseTo(150);
    expect(sample!.y).toBeCloseTo(250);
    expect(sample!.timestamp).toBe(1025);
  });

  it('handles edge cases: before first snapshot, after last snapshot, empty buffer', () => {
    const emptySystem = new RecordingSystem();
    expect(emptySystem.sampleAt(100)).toBeNull();
    expect(emptySystem.getFirstSnapshot()).toBeNull();
    expect(emptySystem.getLatestSnapshot()).toBeNull();

    const system = new RecordingSystem(50, 10);
    system.record(100, {
      x: 50,
      y: 60,
      velocityX: 0,
      velocityY: 0,
      facing: 'left',
      grounded: true,
      dashing: false,
    });
    system.record(200, {
      x: 150,
      y: 160,
      velocityX: 10,
      velocityY: 10,
      facing: 'right',
      grounded: false,
      dashing: true,
    });

    const before = system.sampleAt(50);
    expect(before?.x).toBe(50);

    const after = system.sampleAt(300);
    expect(after?.x).toBe(150);
  });

  it('clears snapshots completely on reset', () => {
    const system = new RecordingSystem();
    system.record(0, {
      x: 10,
      y: 20,
      velocityX: 0,
      velocityY: 0,
      facing: 'right',
      grounded: true,
      dashing: false,
    });
    expect(system.getCount()).toBe(1);
    system.clear();
    expect(system.getCount()).toBe(0);
    expect(system.getFirstSnapshot()).toBeNull();
  });
});

describe('ShadowPlaybackSystem (Multi-Shadow)', () => {
  let recording: RecordingSystem;
  let playback: ShadowPlaybackSystem;

  beforeEach(() => {
    recording = new RecordingSystem(50, 2000);
    playback = new ShadowPlaybackSystem(
      recording,
      [5000, 10000, 15000, 20000, 25000],
      1500
    );

    for (let t = 0; t <= 30000; t += 50) {
      recording.record(t, {
        x: t,
        y: 300,
        velocityX: 100,
        velocityY: 0,
        facing: 'right',
        grounded: true,
        dashing: false,
      });
    }
  });

  it('manages independent delays and progressive unlocking for up to 5 shadows', () => {
    // At t = 2000ms, targetShadows = 1
    const res1 = playback.update(2000, 1);
    expect(res1).toHaveLength(5);
    expect(res1[0].state).toBe(ShadowState.DORMANT);
    expect(res1[0].timeUntilSpawnMs).toBe(3000);
    expect(res1[1].state).toBe(ShadowState.DORMANT); // Locked

    // At t = 4000ms, targetShadows = 1
    const res2 = playback.update(4000, 1);
    expect(res2[0].state).toBe(ShadowState.WARNING);
    expect(res2[0].timeUntilSpawnMs).toBe(1000);

    // At t = 6000ms, targetShadows = 1
    const res3 = playback.update(6000, 1);
    expect(res3[0].state).toBe(ShadowState.ACTIVE);
    expect(res3[0].snapshot!.x).toBeCloseTo(1000); // 6000 - 5000 = 1000
    expect(res3[1].state).toBe(ShadowState.DORMANT); // Gated by targetShadows=1

    // At t = 16000ms, targetShadows = 2
    const res4 = playback.update(16000, 2);
    expect(res4[0].state).toBe(ShadowState.ACTIVE);
    expect(res4[0].snapshot!.x).toBeCloseTo(11000); // 16000 - 5000
    expect(res4[1].state).toBe(ShadowState.ACTIVE);
    expect(res4[1].snapshot!.x).toBeCloseTo(6000);  // 16000 - 10000
    expect(res4[2].state).toBe(ShadowState.DORMANT); // Locked
  });

  it('resets cleanly back to DORMANT for all shadows', () => {
    playback.update(12000, 2);
    expect(playback.getActiveShadowCount()).toBeGreaterThan(0);
    playback.reset();
    expect(playback.getState(0)).toBe(ShadowState.DORMANT);
    expect(playback.getState(1)).toBe(ShadowState.DORMANT);
  });
});
