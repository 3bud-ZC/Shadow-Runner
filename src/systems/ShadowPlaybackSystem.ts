import { RecordingSystem } from './RecordingSystem';
import { PlayerSnapshot } from '../types/PlayerSnapshot';
import { SHADOW_CONFIG } from '../game/constants';

export enum ShadowState {
  DORMANT = 'DORMANT',
  WARNING = 'WARNING',
  ACTIVE = 'ACTIVE',
}

export interface ShadowPlaybackResult {
  shadowIndex: number;
  delayMs: number;
  state: ShadowState;
  snapshot: PlayerSnapshot | null;
  spawnPosition: { x: number; y: number } | null;
  timeUntilSpawnMs: number;
}

export class ShadowPlaybackSystem {
  private recordingSystem: RecordingSystem;
  private delaysMs: number[];
  private warningDurationMs: number;
  private states: ShadowState[];

  constructor(
    recordingSystem: RecordingSystem,
    delaysMs: number[] = SHADOW_CONFIG.DELAYS_MS,
    warningDurationMs: number = SHADOW_CONFIG.WARNING_DURATION_MS
  ) {
    this.recordingSystem = recordingSystem;
    this.delaysMs = [...delaysMs];
    this.warningDurationMs = warningDurationMs;
    this.states = new Array(this.delaysMs.length).fill(ShadowState.DORMANT);
  }

  public update(
    elapsedGameTimeMs: number,
    targetShadowCount: number = 1
  ): ShadowPlaybackResult[] {
    const results: ShadowPlaybackResult[] = [];
    const activeSlotLimit = Math.min(this.delaysMs.length, Math.max(1, targetShadowCount));

    for (let i = 0; i < this.delaysMs.length; i++) {
      const delay = this.delaysMs[i];

      // If this shadow slot is not yet unlocked by difficulty stage
      if (i >= activeSlotLimit) {
        this.states[i] = ShadowState.DORMANT;
        results.push({
          shadowIndex: i,
          delayMs: delay,
          state: ShadowState.DORMANT,
          snapshot: null,
          spawnPosition: null,
          timeUntilSpawnMs: Math.max(0, delay - elapsedGameTimeMs),
        });
        continue;
      }

      const timeUntilSpawn = Math.max(0, delay - elapsedGameTimeMs);

      // Check DORMANT state
      if (elapsedGameTimeMs < delay - this.warningDurationMs) {
        this.states[i] = ShadowState.DORMANT;
        results.push({
          shadowIndex: i,
          delayMs: delay,
          state: ShadowState.DORMANT,
          snapshot: null,
          spawnPosition: null,
          timeUntilSpawnMs: timeUntilSpawn,
        });
        continue;
      }

      // First recorded snapshot represents the original spawn point for this delayed echo
      const firstSnapshot = this.recordingSystem.getFirstSnapshot();
      const spawnPos = firstSnapshot ? { x: firstSnapshot.x, y: firstSnapshot.y } : null;

      // Check WARNING state
      if (elapsedGameTimeMs < delay) {
        this.states[i] = ShadowState.WARNING;
        results.push({
          shadowIndex: i,
          delayMs: delay,
          state: ShadowState.WARNING,
          snapshot: firstSnapshot,
          spawnPosition: spawnPos,
          timeUntilSpawnMs: timeUntilSpawn,
        });
        continue;
      }

      // ACTIVE state: deterministic delayed sample from shared recording history
      this.states[i] = ShadowState.ACTIVE;
      const playbackTime = elapsedGameTimeMs - delay;
      const currentSnapshot = this.recordingSystem.sampleAt(playbackTime);

      results.push({
        shadowIndex: i,
        delayMs: delay,
        state: ShadowState.ACTIVE,
        snapshot: currentSnapshot,
        spawnPosition: spawnPos,
        timeUntilSpawnMs: 0,
      });
    }

    return results;
  }

  public getActiveShadowCount(): number {
    return this.states.filter((s) => s === ShadowState.ACTIVE).length;
  }

  public getState(shadowIndex: number = 0): ShadowState {
    return this.states[shadowIndex] || ShadowState.DORMANT;
  }

  public reset(): void {
    this.states.fill(ShadowState.DORMANT);
  }
}
