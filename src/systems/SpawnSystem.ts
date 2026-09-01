import { ARENA_ORB_SPAWN_POINTS, SpawnPoint } from '../world/SpawnPoints';

export class SpawnSystem {
  private spawnPoints: readonly SpawnPoint[];
  private lastSpawnPointId: number | null = null;
  private minPlayerDistance: number;

  constructor(
    spawnPoints: readonly SpawnPoint[] = ARENA_ORB_SPAWN_POINTS,
    minPlayerDistance: number = 220
  ) {
    this.spawnPoints = spawnPoints;
    this.minPlayerDistance = minPlayerDistance;
  }

  public selectNextSpawnPoint(
    playerX: number,
    playerY: number,
    riskySpawnWeight: number = 0.2
  ): SpawnPoint {
    if (this.spawnPoints.length === 0) {
      return { id: 0, x: 640, y: 360, name: 'Default Center', riskTier: 'low' };
    }

    if (this.spawnPoints.length === 1) {
      return this.spawnPoints[0];
    }

    // 1. Exclude previous spawn point
    const available = this.spawnPoints.filter(
      (p) => p.id !== this.lastSpawnPointId
    );

    // 2. Filter points by minimum distance from player
    const safeCandidates = available.filter((p) => {
      const dx = p.x - playerX;
      const dy = p.y - playerY;
      return Math.sqrt(dx * dx + dy * dy) >= this.minPlayerDistance;
    });

    const candidatePool = safeCandidates.length > 0 ? safeCandidates : available;

    // 3. Risk-Weighted Selection
    const wantsHighRisk = Math.random() < Math.min(0.9, Math.max(0, riskySpawnWeight));
    let targetPool: SpawnPoint[];

    if (wantsHighRisk) {
      const highRiskCandidates = candidatePool.filter((p) => p.riskTier === 'high' || p.riskTier === 'medium');
      targetPool = highRiskCandidates.length > 0 ? highRiskCandidates : candidatePool;
    } else {
      const lowRiskCandidates = candidatePool.filter((p) => p.riskTier === 'low' || p.riskTier === 'medium');
      targetPool = lowRiskCandidates.length > 0 ? lowRiskCandidates : candidatePool;
    }

    const idx = Math.floor(Math.random() * targetPool.length);
    const selected = targetPool[idx] || this.spawnPoints[0];

    this.lastSpawnPointId = selected.id;
    return selected;
  }

  public getLastSpawnPointId(): number | null {
    return this.lastSpawnPointId;
  }

  public reset(): void {
    this.lastSpawnPointId = null;
  }
}
