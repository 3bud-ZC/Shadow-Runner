import { PlayerSnapshot } from '../types/PlayerSnapshot';
import { RECORDING_CONFIG } from '../game/constants';

export class RecordingSystem {
  private snapshots: PlayerSnapshot[] = [];
  private lastRecordTime: number = -Infinity;
  private readonly sampleIntervalMs: number;
  private readonly maxSnapshots: number;

  constructor(
    sampleIntervalMs: number = RECORDING_CONFIG.SAMPLE_INTERVAL_MS,
    maxSnapshots: number = RECORDING_CONFIG.MAX_SNAPSHOTS
  ) {
    this.sampleIntervalMs = sampleIntervalMs;
    this.maxSnapshots = maxSnapshots;
  }

  /**
   * Attempts to record a snapshot. Returns true if a new snapshot was recorded.
   */
  public record(
    currentTime: number,
    data: Omit<PlayerSnapshot, 'timestamp'>
  ): boolean {
    if (currentTime - this.lastRecordTime < this.sampleIntervalMs) {
      return false;
    }

    const snapshot: PlayerSnapshot = {
      timestamp: currentTime,
      ...data,
    };

    this.snapshots.push(snapshot);
    this.lastRecordTime = currentTime;

    // Maintain bounded buffer limit
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return true;
  }

  public getSnapshots(): readonly PlayerSnapshot[] {
    return this.snapshots;
  }

  public getCount(): number {
    return this.snapshots.length;
  }

  public getFirstSnapshot(): PlayerSnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[0] : null;
  }

  public getLatestSnapshot(): PlayerSnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
  }

  /**
   * Samples the recorded state at a target timestamp with linear interpolation.
   */
  public sampleAt(targetTime: number): PlayerSnapshot | null {
    if (this.snapshots.length === 0) return null;

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];

    if (targetTime <= first.timestamp) {
      return { ...first };
    }

    if (targetTime >= last.timestamp) {
      return { ...last };
    }

    // Binary search for the bounding snapshots [low, high]
    let low = 0;
    let high = this.snapshots.length - 1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      if (this.snapshots[mid].timestamp <= targetTime) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    const s1 = this.snapshots[high];
    const s2 = this.snapshots[low];

    if (!s1 || !s2) {
      return s1 ? { ...s1 } : (s2 ? { ...s2 } : null);
    }

    const dt = s2.timestamp - s1.timestamp;
    const factor = dt > 0 ? (targetTime - s1.timestamp) / dt : 0;

    return {
      timestamp: targetTime,
      x: s1.x + (s2.x - s1.x) * factor,
      y: s1.y + (s2.y - s1.y) * factor,
      velocityX: s1.velocityX + (s2.velocityX - s1.velocityX) * factor,
      velocityY: s1.velocityY + (s2.velocityY - s1.velocityY) * factor,
      facing: factor < 0.5 ? s1.facing : s2.facing,
      grounded: factor < 0.5 ? s1.grounded : s2.grounded,
      dashing: factor < 0.5 ? s1.dashing : s2.dashing,
    };
  }

  public clear(): void {
    this.snapshots = [];
    this.lastRecordTime = -Infinity;
  }
}
