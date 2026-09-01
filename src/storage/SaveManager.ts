export interface SaveData {
  bestScore: number;
  longestSurvivalMs: number;
  mostOrbs: number;
  muted?: boolean;
}

export interface RunRecordResult {
  isNewBestScore: boolean;
  isNewLongestSurvival: boolean;
  isNewMostOrbs: boolean;
  currentSave: SaveData;
}

export class SaveManager {
  private static readonly STORAGE_KEY = 'shadow_runner_save_v1';
  private static memoryFallback: SaveData | null = null;

  private static getDefaultData(): SaveData {
    return {
      bestScore: 0,
      longestSurvivalMs: 0,
      mostOrbs: 0,
      muted: false,
    };
  }

  public static load(): SaveData {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed === 'object' && parsed !== null) {
            return {
              bestScore: typeof parsed.bestScore === 'number' && !isNaN(parsed.bestScore) ? Math.max(0, Math.floor(parsed.bestScore)) : 0,
              longestSurvivalMs: typeof parsed.longestSurvivalMs === 'number' && !isNaN(parsed.longestSurvivalMs) ? Math.max(0, parsed.longestSurvivalMs) : 0,
              mostOrbs: typeof parsed.mostOrbs === 'number' && !isNaN(parsed.mostOrbs) ? Math.max(0, Math.floor(parsed.mostOrbs)) : 0,
              muted: typeof parsed.muted === 'boolean' ? parsed.muted : false,
            };
          }
        }
      }

      if (this.memoryFallback) {
        return { ...this.memoryFallback };
      }

      return this.getDefaultData();
    } catch {
      return this.memoryFallback ? { ...this.memoryFallback } : this.getDefaultData();
    }
  }

  public static save(data: SaveData): boolean {
    const sanitized: SaveData = {
      bestScore: Math.max(0, Math.floor(data.bestScore || 0)),
      longestSurvivalMs: Math.max(0, data.longestSurvivalMs || 0),
      mostOrbs: Math.max(0, Math.floor(data.mostOrbs || 0)),
      muted: Boolean(data.muted),
    };

    this.memoryFallback = { ...sanitized };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sanitized));
        return true;
      }
      return true;
    } catch {
      return false;
    }
  }

  public static isMuted(): boolean {
    return Boolean(this.load().muted);
  }

  public static setMuted(muted: boolean): void {
    const current = this.load();
    current.muted = muted;
    this.save(current);
  }

  public static recordRun(score: number, survivalTimeMs: number, orbs: number): RunRecordResult {
    const current = this.load();
    const safeScore = Math.max(0, Math.floor(score || 0));
    const safeTime = Math.max(0, survivalTimeMs || 0);
    const safeOrbs = Math.max(0, Math.floor(orbs || 0));

    const isNewBestScore = safeScore > current.bestScore;
    const isNewLongestSurvival = safeTime > current.longestSurvivalMs;
    const isNewMostOrbs = safeOrbs > current.mostOrbs;

    const updated: SaveData = {
      bestScore: isNewBestScore ? safeScore : current.bestScore,
      longestSurvivalMs: isNewLongestSurvival ? safeTime : current.longestSurvivalMs,
      mostOrbs: isNewMostOrbs ? safeOrbs : current.mostOrbs,
      muted: current.muted,
    };

    if (isNewBestScore || isNewLongestSurvival || isNewMostOrbs) {
      this.save(updated);
    }

    return {
      isNewBestScore,
      isNewLongestSurvival,
      isNewMostOrbs,
      currentSave: updated,
    };
  }

  public static reset(): void {
    this.memoryFallback = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.STORAGE_KEY);
      }
    } catch {
      // Ignored
    }
  }
}
