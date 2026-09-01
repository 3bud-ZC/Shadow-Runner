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
    playerY: number
  ): SpawnPoint {
    if (this.spawnPoints.length === 0) {
      return { id: 0, x: 640, y: 360, name: 'Default Center' };
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

    let selected: SpawnPoint;

    if (safeCandidates.length > 0) {
      // Pick randomly among safe candidates
      const idx = Math.floor(Math.random() * safeCandidates.length);
      selected = safeCandidates[idx];
    } else if (available.length > 0) {
      // If no candidate is far enough, pick the furthest available point
      selected = available.reduce((furthest, p) => {
        const dCurrent = Math.hypot(p.x - playerX, p.y - playerY);
        const dFurthest = Math.hypot(furthest.x - playerX, furthest.y - playerY);
        return dCurrent > dFurthest ? p : furthest;
      }, available[0]);
    } else {
      selected = this.spawnPoints[0];
    }

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
