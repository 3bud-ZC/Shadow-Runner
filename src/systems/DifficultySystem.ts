import { DIFFICULTY_STAGES, DifficultyStage } from '../game/constants';

export class DifficultySystem {
  private currentStageIndex: number = 0;
  private readonly stages: DifficultyStage[];

  constructor(stages: DifficultyStage[] = DIFFICULTY_STAGES) {
    this.stages = stages;
    this.reset();
  }

  public update(elapsedGameTimeMs: number): {
    stageChanged: boolean;
    stage: number;
    stageName: string;
    targetShadowCount: number;
    comboTimeoutMs: number;
    riskySpawnWeight: number;
  } {
    let newStageIndex = 0;

    for (let i = this.stages.length - 1; i >= 0; i--) {
      if (elapsedGameTimeMs >= this.stages[i].minTimeMs) {
        newStageIndex = i;
        break;
      }
    }

    const stageChanged = newStageIndex > this.currentStageIndex;
    this.currentStageIndex = newStageIndex;

    const current = this.stages[this.currentStageIndex];

    return {
      stageChanged,
      stage: current.stage,
      stageName: current.name,
      targetShadowCount: Math.min(5, Math.max(1, current.maxShadows)),
      comboTimeoutMs: current.comboTimeoutMs || 5000,
      riskySpawnWeight: current.riskySpawnWeight || 0.2,
    };
  }

  public getCurrentStage(): DifficultyStage {
    return this.stages[this.currentStageIndex];
  }

  public getTargetShadowCount(): number {
    return Math.min(5, Math.max(1, this.stages[this.currentStageIndex].maxShadows));
  }

  public reset(): void {
    this.currentStageIndex = 0;
  }
}
