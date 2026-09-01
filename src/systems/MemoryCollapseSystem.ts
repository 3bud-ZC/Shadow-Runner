import { MEMORY_COLLAPSE_CONFIG } from '../game/constants';
import { RecordingSystem } from './RecordingSystem';
import { PlayerSnapshot } from '../types/PlayerSnapshot';

export enum MemoryCollapseState {
  INACTIVE = 'INACTIVE',
  WARNING = 'WARNING',
  ACTIVE = 'ACTIVE',
  SURVIVED = 'SURVIVED',
}

export interface MemoryCollapseResult {
  state: MemoryCollapseState;
  isWarning: boolean;
  isActive: boolean;
  isSurvived: boolean;
  justTriggeredWarning: boolean;
  justStarted: boolean;
  justSurvived: boolean;
  snapshot: PlayerSnapshot | null;
  warningCountdownSec: number;
}

export class MemoryCollapseSystem {
  private recordingSystem: RecordingSystem;
  private state: MemoryCollapseState = MemoryCollapseState.INACTIVE;
  private warningFired: boolean = false;
  private startFired: boolean = false;
  private survivalBonusAwarded: boolean = false;

  private triggerTimeMs: number;
  private warningDurationMs: number;
  private eventDurationMs: number;
  private historySourceMs: number;
  private playbackSpeed: number;

  constructor(
    recordingSystem: RecordingSystem,
    config = MEMORY_COLLAPSE_CONFIG
  ) {
    this.recordingSystem = recordingSystem;
    this.triggerTimeMs = config.TRIGGER_TIME_MS;
    this.warningDurationMs = config.WARNING_DURATION_MS;
    this.eventDurationMs = config.EVENT_DURATION_MS;
    this.historySourceMs = config.HISTORY_SOURCE_MS;
    this.playbackSpeed = config.PLAYBACK_SPEED;
  }

  public update(elapsedGameTimeMs: number): MemoryCollapseResult {
    const warningStartTime = this.triggerTimeMs - this.warningDurationMs;
    const eventEndTime = this.triggerTimeMs + this.eventDurationMs;

    let justTriggeredWarning = false;
    let justStarted = false;
    let justSurvived = false;

    // 1. INACTIVE Phase
    if (elapsedGameTimeMs < warningStartTime) {
      this.state = MemoryCollapseState.INACTIVE;
      return {
        state: this.state,
        isWarning: false,
        isActive: false,
        isSurvived: false,
        justTriggeredWarning: false,
        justStarted: false,
        justSurvived: false,
        snapshot: null,
        warningCountdownSec: 0,
      };
    }

    // 2. WARNING Phase
    if (elapsedGameTimeMs < this.triggerTimeMs) {
      if (!this.warningFired) {
        this.warningFired = true;
        justTriggeredWarning = true;
      }
      this.state = MemoryCollapseState.WARNING;
      const countdown = Math.max(0, (this.triggerTimeMs - elapsedGameTimeMs) / 1000);

      return {
        state: this.state,
        isWarning: true,
        isActive: false,
        isSurvived: false,
        justTriggeredWarning,
        justStarted: false,
        justSurvived: false,
        snapshot: null,
        warningCountdownSec: countdown,
      };
    }

    // 3. ACTIVE Phase (Time Compressed Playback)
    if (elapsedGameTimeMs < eventEndTime) {
      if (!this.startFired) {
        this.startFired = true;
        justStarted = true;
      }
      this.state = MemoryCollapseState.ACTIVE;

      const elapsedSinceStart = elapsedGameTimeMs - this.triggerTimeMs;
      const historyStart = Math.max(0, this.triggerTimeMs - this.historySourceMs);
      const playbackTime = historyStart + elapsedSinceStart * this.playbackSpeed;

      const snapshot = this.recordingSystem.sampleAt(playbackTime);

      return {
        state: this.state,
        isWarning: false,
        isActive: true,
        isSurvived: false,
        justTriggeredWarning: false,
        justStarted,
        justSurvived: false,
        snapshot,
        warningCountdownSec: 0,
      };
    }

    // 4. SURVIVED Phase
    this.state = MemoryCollapseState.SURVIVED;
    if (!this.survivalBonusAwarded) {
      this.survivalBonusAwarded = true;
      justSurvived = true;
    }

    return {
      state: this.state,
      isWarning: false,
      isActive: false,
      isSurvived: true,
      justTriggeredWarning: false,
      justStarted: false,
      justSurvived,
      snapshot: null,
      warningCountdownSec: 0,
    };
  }

  public getState(): MemoryCollapseState {
    return this.state;
  }

  public hasReached(): boolean {
    return this.startFired;
  }

  public hasSurvived(): boolean {
    return this.survivalBonusAwarded;
  }

  public reset(): void {
    this.state = MemoryCollapseState.INACTIVE;
    this.warningFired = false;
    this.startFired = false;
    this.survivalBonusAwarded = false;
  }
}
