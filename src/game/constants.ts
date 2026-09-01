export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PHYSICS_CONFIG = {
  GRAVITY_Y: 1350,
  PLAYER_SPEED: 330,
  PLAYER_ACCEL: 2400,
  PLAYER_DECEL: 2000,
  PLAYER_JUMP_VELOCITY: -560,
  COYOTE_TIME_MS: 130,
  JUMP_BUFFER_MS: 120,
  DASH_SPEED: 760,
  DASH_DURATION_MS: 160,
  DASH_COOLDOWN_MS: 1400,
  HITBOX_WIDTH: 26,
  HITBOX_HEIGHT: 38,
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
  ALPHAS: [0.85, 0.75, 0.65, 0.55, 0.45],
  COLORS_CORE: [0xd90429, 0xc77dff, 0xf72585, 0x9e0059, 0xff0054],
  COLORS_GLOW: [0x9d4edd, 0x7209b7, 0x3a0ca3, 0x7b2cbf, 0x5a189a],
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
  RADIUS: 12,
  HITBOX_RADIUS: 18,
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
  BG_DARK: 0x07090e,
  BG_GRID: 0x141a29,
  PLATFORM_FILL: 0x111625,
  PLATFORM_STROKE: 0x00f0ff,
  PLATFORM_TOP: 0x00e5ff,
  PLAYER_CORE: 0x00f0ff,
  PLAYER_GLOW: 0x80f7ff,
  SHADOW_CORE: 0xd90429,
  SHADOW_GLOW: 0x9d4edd,
  COLLAPSE_CORE: 0x00f0ff,
  COLLAPSE_AURA: 0xff0055,
  ORB_CORE: 0xffbe0b,
  ORB_GLOW: 0xfb5607,
  ORB_INNER: 0xffffff,
  TEXT_WHITE: '#ffffff',
  TEXT_CYAN: '#00f0ff',
  TEXT_SHADOW: '#c77dff',
  TEXT_RED: '#ff0055',
  TEXT_GOLD: '#ffbe0b',
  TEXT_MUTED: '#707e94',
};
