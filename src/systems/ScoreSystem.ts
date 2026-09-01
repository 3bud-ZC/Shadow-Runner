import { SCORE_CONFIG } from '../game/constants';

export interface RunScoreStats {
  totalScore: number;
  survivalScore: number;
  orbScore: number;
  bonusScore: number;
  orbsCollected: number;
  maxCombo: number;
  currentCombo: number;
}

export class ScoreSystem {
  private totalScore: number = 0;
  private survivalScore: number = 0;
  private orbScore: number = 0;
  private bonusScore: number = 0;
  private orbsCollected: number = 0;

  private currentComboTier: number = 0;
  private maxComboReached: number = 1.0;
  private lastOrbTimeMs: number = -Infinity;
  private comboTimeoutMs: number = SCORE_CONFIG.DEFAULT_COMBO_TIMEOUT_MS;

  constructor() {
    this.reset();
  }

  public setComboTimeout(timeoutMs: number): void {
    this.comboTimeoutMs = Math.max(1000, timeoutMs);
  }

  public addBonusScore(points: number): void {
    this.bonusScore += Math.max(0, Math.floor(points));
    this.totalScore = this.survivalScore + this.orbScore + this.bonusScore;
  }

  public update(elapsedGameTimeMs: number, comboTimeoutMs?: number): void {
    if (typeof comboTimeoutMs === 'number') {
      this.comboTimeoutMs = Math.max(1000, comboTimeoutMs);
    }

    // Survival Score: +10 points per elapsed second
    const elapsedSeconds = Math.max(0, elapsedGameTimeMs / 1000);
    this.survivalScore = Math.floor(elapsedSeconds * SCORE_CONFIG.SURVIVAL_POINTS_PER_SECOND);
    this.totalScore = this.survivalScore + this.orbScore + this.bonusScore;

    // Check combo timeout
    if (this.currentComboTier > 0) {
      const timeSinceLastOrb = elapsedGameTimeMs - this.lastOrbTimeMs;
      if (timeSinceLastOrb > this.comboTimeoutMs) {
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

    if (this.lastOrbTimeMs >= 0 && timeSinceLastOrb <= this.comboTimeoutMs) {
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
    this.totalScore = this.survivalScore + this.orbScore + this.bonusScore;

    return {
      addedPoints,
      comboMultiplier: multiplier,
      isComboActive: this.currentComboTier > 0,
    };
  }

  public getComboProgress(elapsedGameTimeMs: number): number {
    if (this.currentComboTier === 0 || this.lastOrbTimeMs < 0) return 0;
    const elapsed = elapsedGameTimeMs - this.lastOrbTimeMs;
    const remaining = Math.max(0, this.comboTimeoutMs - elapsed);
    return remaining / this.comboTimeoutMs;
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
      bonusScore: this.bonusScore,
      orbsCollected: this.orbsCollected,
      maxCombo: this.maxComboReached,
      currentCombo: this.getCurrentCombo(),
    };
  }

  public reset(): void {
    this.totalScore = 0;
    this.survivalScore = 0;
    this.orbScore = 0;
    this.bonusScore = 0;
    this.orbsCollected = 0;
    this.currentComboTier = 0;
    this.maxComboReached = 1.0;
    this.lastOrbTimeMs = -Infinity;
    this.comboTimeoutMs = SCORE_CONFIG.DEFAULT_COMBO_TIMEOUT_MS;
  }
}
