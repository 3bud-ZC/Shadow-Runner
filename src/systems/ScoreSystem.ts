import { SCORE_CONFIG } from '../game/constants';

export interface RunScoreStats {
  totalScore: number;
  survivalScore: number;
  orbScore: number;
  orbsCollected: number;
  maxCombo: number;
  currentCombo: number;
}

export class ScoreSystem {
  private totalScore: number = 0;
  private survivalScore: number = 0;
  private orbScore: number = 0;
  private orbsCollected: number = 0;

  private currentComboTier: number = 0;
  private maxComboReached: number = 1.0;
  private lastOrbTimeMs: number = -Infinity;

  constructor() {
    this.reset();
  }

  public update(elapsedGameTimeMs: number): void {
    // Survival Score: +10 points per elapsed second
    const elapsedSeconds = Math.max(0, elapsedGameTimeMs / 1000);
    this.survivalScore = Math.floor(elapsedSeconds * SCORE_CONFIG.SURVIVAL_POINTS_PER_SECOND);
    this.totalScore = this.survivalScore + this.orbScore;

    // Check combo timeout
    if (this.currentComboTier > 0) {
      const timeSinceLastOrb = elapsedGameTimeMs - this.lastOrbTimeMs;
      if (timeSinceLastOrb > SCORE_CONFIG.COMBO_TIMEOUT_MS) {
        this.currentComboTier = 0;
      }
    }
  }

  public collectOrb(elapsedGameTimeMs: number): {
    addedPoints: number;
    comboMultiplier: number;
    isComboActive: boolean;
  } {
    const timeSinceLastOrb = elapsedGameTimeMs - this.lastOrbTimeMs;

    if (this.lastOrbTimeMs >= 0 && timeSinceLastOrb <= SCORE_CONFIG.COMBO_TIMEOUT_MS) {
      // Step up combo tier
      this.currentComboTier = Math.min(
        SCORE_CONFIG.COMBO_MULTIPLIERS.length - 1,
        this.currentComboTier + 1
      );
    } else {
      // First orb or combo expired
      this.currentComboTier = 0;
    }

    this.lastOrbTimeMs = elapsedGameTimeMs;
    const multiplier = SCORE_CONFIG.COMBO_MULTIPLIERS[this.currentComboTier];

    if (multiplier > this.maxComboReached) {
      this.maxComboReached = multiplier;
    }

    const addedPoints = Math.round(SCORE_CONFIG.ORB_BASE_POINTS * multiplier);
    this.orbScore += addedPoints;
    this.orbsCollected += 1;
    this.totalScore = this.survivalScore + this.orbScore;

    return {
      addedPoints,
      comboMultiplier: multiplier,
      isComboActive: this.currentComboTier > 0,
    };
  }

  public getComboProgress(elapsedGameTimeMs: number): number {
    if (this.currentComboTier === 0 || this.lastOrbTimeMs < 0) return 0;
    const elapsed = elapsedGameTimeMs - this.lastOrbTimeMs;
    const remaining = Math.max(0, SCORE_CONFIG.COMBO_TIMEOUT_MS - elapsed);
    return remaining / SCORE_CONFIG.COMBO_TIMEOUT_MS;
  }

  public getCurrentCombo(): number {
    return SCORE_CONFIG.COMBO_MULTIPLIERS[this.currentComboTier];
  }

  public getOrbsCollected(): number {
    return this.orbsCollected;
  }

  public getTotalScore(): number {
    return this.totalScore;
  }

  public getMaxCombo(): number {
    return this.maxComboReached;
  }

  public getStats(): RunScoreStats {
    return {
      totalScore: this.totalScore,
      survivalScore: this.survivalScore,
      orbScore: this.orbScore,
      orbsCollected: this.orbsCollected,
      maxCombo: this.maxComboReached,
      currentCombo: this.getCurrentCombo(),
    };
  }

  public reset(): void {
    this.totalScore = 0;
    this.survivalScore = 0;
    this.orbScore = 0;
    this.orbsCollected = 0;
    this.currentComboTier = 0;
    this.maxComboReached = 1.0;
    this.lastOrbTimeMs = -Infinity;
  }
}
