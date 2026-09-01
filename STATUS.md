# Shadow Runner Status

Overall Completion: 40%
Current Milestone: M02 — Core Gameplay Systems
Milestone Status: COMPLETE

## Implemented
- **Multi-Shadow Orchestration (`ShadowPlaybackSystem` & `Shadow`)**:
  - Supports up to 5 concurrent independent delayed Shadows reading from shared recording history (delays: 5s, 10s, 15s, 20s, 25s).
  - Progressive introduction unlocked via difficulty stages.
  - Distinct visual identification per Shadow index (color-coded glow/core: crimson, purple, magenta, dark rose, and ghost violet, with torso rank indicator pips).
  - Independent state machines (`DORMANT`, `WARNING`, `ACTIVE`), pre-spawn warning vortexes, and collision handling.
- **Energy Orb System (`EnergyOrb`, `SpawnPoints`, `SpawnSystem`)**:
  - Procedural glowing/pulsing collectible orb entity with particle burst feedback and floating animation.
  - 18 validated safe spawn points across platforms, floor, and air gaps in the Arena.
  - Safe distance-based spawn selection avoiding immediate repeats and proximity to the player.
  - Guarantees at least one active collectible during normal gameplay.
- **Core Score & Combo System (`ScoreSystem`)**:
  - Elapsed time survival points (+10 pts/sec).
  - Collectible orb points (+100 base pts).
  - Step-up combo multipliers: x1.0, x1.2, x1.5, x2.0, x2.5, capped at x3.0.
  - 5.0-second combo timeout window with remaining progress tracking.
  - Animated in-game floating score popups (`+150 (x1.5)`).
- **Difficulty System (`DifficultySystem`)**:
  - Data-driven 5-stage progression based on survival time (0–15s: 1 Shadow, 15–30s: 2 Shadows, 30–50s: 3 Shadows, 50–75s: 4 Shadows, 75s+: 5 Shadows).
  - Non-intrusive banner toast notification when new stages are reached (`STAGE X — SHADOW COUNT INCREASED!`).
- **Storage & High Scores (`SaveManager`)**:
  - Safe `localStorage` persistence layer with in-memory fallback for non-browser/test environments.
  - Tracks all-time best score, longest survival duration, and most orbs collected.
  - Best score displayed on the Main Menu and Game Over screen.
- **Upgraded HUD & Game Over Screens (`GameScene`, `GameOverScene`, `MenuScene`)**:
  - Top-left: Live total score, orbs collected, and active combo indicator with countdown %.
  - Top-center: Formatted survival time (`mm:ss.t`) and stage notification banners.
  - Top-right: Active vs target Shadow status icons (`● ● ◐ ○ ○`) and live Dash cooldown gauge.
  - Game Over summary: Final score, survival time, orbs collected, max combo, echoes faced, all-time best, and `★ NEW BEST SCORE ★` / `(NEW!)` badges.
- **Clean Run Reset**:
  - Restarting a run resets all M02 temporary systems (score, combo, stage, orbs, active shadows, recording buffer) while preserving high scores.

## Architecture
```text
shadow-runner/
├── public/
│   └── assets/
├── src/
│   ├── main.ts
│   ├── game/
│   │   ├── config.ts
│   │   └── constants.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── MenuScene.ts
│   │   ├── GameScene.ts
│   │   └── GameOverScene.ts
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── Shadow.ts
│   │   └── EnergyOrb.ts
│   ├── systems/
│   │   ├── InputSystem.ts
│   │   ├── RecordingSystem.ts
│   │   ├── ShadowPlaybackSystem.ts
│   │   ├── SpawnSystem.ts
│   │   ├── ScoreSystem.ts
│   │   └── DifficultySystem.ts
│   ├── storage/
│   │   └── SaveManager.ts
│   ├── world/
│   │   ├── Arena.ts
│   │   └── SpawnPoints.ts
│   ├── types/
│   │   └── PlayerSnapshot.ts
│   └── styles/
│       └── style.css
├── tests/
│   ├── systems.test.ts
│   └── gameplay.test.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── STATUS.md
```

## Verification
- **Automated Tests**: 21 unit tests passing across `tests/systems.test.ts` and `tests/gameplay.test.ts` covering snapshot recording, multi-shadow delays and states, difficulty stage boundaries, score calculation, combo progression & timeout, safe spawn point selection, and save record persistence.
- **Type Checking**: TypeScript compiler check (`tsc --noEmit`) passes with 0 errors in strict mode.
- **Production Build**: Vite builds production bundle cleanly to `dist/` without errors or chunk warnings.

## Tests / Commands Run
- `npm run typecheck` (exit 0, 0 errors)
- `npm test` (exit 0, 21 unit tests passed across 2 test suites)
- `npm run build` (exit 0, production bundle created in 3.01s)

## Known Issues
- None.

## Human Verification Needed
- Manual visual and gameplay feel check in browser (`npm run dev` or `npm run preview`):
  - Collecting Orbs around the arena and verifying combo multiplier acceleration.
  - Observing progressive introduction of up to 5 Shadows at 0s, 15s, 30s, 50s, 75s.
  - Checking visual differentiation between multiple historical Shadows.
  - Confirming high score persistence in browser `localStorage` across page reloads.

## Next Milestone
M03 — UX, Mobile & Game Feel

## Git State
- Branch: `master`
- Untracked files ready for initial commit: `.gitignore`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `public/`, `src/`, `tests/`, `STATUS.md`.
