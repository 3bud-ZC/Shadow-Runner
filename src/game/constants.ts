export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PHYSICS_CONFIG = {
  GRAVITY_Y: 1250,
  PLAYER_SPEED: 340,
  PLAYER_ACCEL: 2500,
  PLAYER_DECEL: 2200,
  PLAYER_JUMP_VELOCITY: -640,
  COYOTE_TIME_MS: 140,
  JUMP_BUFFER_MS: 130,
  DASH_SPEED: 780,
  DASH_DURATION_MS: 160,
  DASH_COOLDOWN_MS: 1300,
  HITBOX_WIDTH: 28,
  HITBOX_HEIGHT: 40,
};

export const RECORDING_CONFIG = {
  SAMPLE_INTERVAL_MS: 50, // 20 Hz
  MAX_HISTORY_MS: 60000,   // 60 seconds bounded buffer
  MAX_SNAPSHOTS: 1200,     // 60000 / 50
};

export const SHADOW_CONFIG = {
  MAX_SHADOWS: 5,
  DELAYS_MS: [5000, 10000, 15000, 20000, 25000],
  WARNING_DURATION_MS: 1500, // 1.5s warning before spawn
  ALPHAS: [0.9, 0.82, 0.74, 0.66, 0.58],
  COLORS_CORE: [0x12131a, 0x1f142b, 0x2b0d1e, 0x101a24, 0x261019],
  COLORS_GLOW: [0xff0054, 0x9d4edd, 0xff5400, 0x00f0ff, 0xff007f],
};

export const MEMORY_COLLAPSE_CONFIG = {
  TRIGGER_TIME_MS: 60000,       // Event triggers at 60s
  WARNING_DURATION_MS: 3000,    // 3s warning countdown (57s -> 60s)
  EVENT_DURATION_MS: 20000,     // 20s event duration (60s -> 80s)
  HISTORY_SOURCE_MS: 30000,     // Source 30s of past history
  PLAYBACK_SPEED: 1.25,         // 1.25x compressed playback speed
  SURVIVAL_BONUS_SCORE: 1000,   // +1000 score bonus for surviving
};

export interface DifficultyStage {
  stage: number;
  name: string;
  minTimeMs: number;
  maxShadows: number;
  comboTimeoutMs: number;
  riskySpawnWeight: number;
}

export const DIFFICULTY_STAGES: DifficultyStage[] = [
  { stage: 1, name: 'STAGE 1', minTimeMs: 0, maxShadows: 1, comboTimeoutMs: 5000, riskySpawnWeight: 0.1 },
  { stage: 2, name: 'STAGE 2', minTimeMs: 15000, maxShadows: 2, comboTimeoutMs: 5000, riskySpawnWeight: 0.25 },
  { stage: 3, name: 'STAGE 3', minTimeMs: 30000, maxShadows: 3, comboTimeoutMs: 4800, riskySpawnWeight: 0.4 },
  { stage: 4, name: 'STAGE 4', minTimeMs: 50000, maxShadows: 4, comboTimeoutMs: 4500, riskySpawnWeight: 0.6 },
  { stage: 5, name: 'STAGE 5', minTimeMs: 75000, maxShadows: 5, comboTimeoutMs: 4000, riskySpawnWeight: 0.8 },
];

export const SCORE_CONFIG = {
  SURVIVAL_POINTS_PER_SECOND: 10,
  ORB_BASE_POINTS: 100,
  COMBO_MULTIPLIERS: [1.0, 1.2, 1.5, 2.0, 2.5, 3.0],
  COMBO_MAX_MULTIPLIER: 3.0,
  DEFAULT_COMBO_TIMEOUT_MS: 5000,
};

export const ORB_CONFIG = {
  RADIUS: 14,
  HITBOX_RADIUS: 20,
  PULSE_DURATION_MS: 800,
};

export interface UserSettings {
  masterVolume: number;
  sfxVolume: number;
  screenShake: boolean;
  reducedMotion: boolean;
  touchControlsOpacity: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  masterVolume: 1.0,
  sfxVolume: 1.0,
  screenShake: true,
  reducedMotion: false,
  touchControlsOpacity: 0.7,
};

export const COLORS = {
  // Classic Cartoon & Ink Palette
  CARTOON_INK: 0x12131a,
  CARTOON_WHITE: 0xfdfbf7,
  CARTOON_HEADBAND: 0xef233c,
  CARTOON_SKIN: 0xffe3d8,
  CARTOON_SHADOW_INK: 0x090a10,
  CARTOON_SHADOW_EYE: 0xff0054,
  CARTOON_PARCHMENT_BG: 0x13131c,
  CARTOON_GRID: 0x222233,
  CARTOON_WOOD: 0x241e30,
  CARTOON_WOOD_TOP: 0xdda15e,
  CARTOON_WOOD_STROKE: 0x0b0b12,
  CARTOON_SCROLL_GOLD: 0xffbe0b,
  CARTOON_SCROLL_PAPER: 0xfefae0,
  CARTOON_SCROLL_RED: 0xd90429,

  // Compatibility bindings
  BG_DARK: 0x13131c,
  BG_GRID: 0x222233,
  PLATFORM_FILL: 0x241e30,
  PLATFORM_STROKE: 0x0b0b12,
  PLATFORM_TOP: 0xdda15e,
  PLAYER_CORE: 0x12131a,
  PLAYER_GLOW: 0xffe3d8,
  SHADOW_CORE: 0xd90429,
  SHADOW_GLOW: 0x9d4edd,
  COLLAPSE_CORE: 0x00f0ff,
  COLLAPSE_AURA: 0xff0055,
  ORB_CORE: 0xffbe0b,
  ORB_GLOW: 0xfb5607,
  ORB_INNER: 0xffffff,
  TEXT_WHITE: '#fdfbf7',
  TEXT_CYAN: '#fefae0',
  TEXT_SHADOW: '#ff758f',
  TEXT_RED: '#ef233c',
  TEXT_GOLD: '#ffbe0b',
  TEXT_MUTED: '#8d99ae',
};
