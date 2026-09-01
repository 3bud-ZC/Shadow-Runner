# Shadow Runner Status

Overall Completion: 80%
Current Milestone: M04 — Advanced Gameplay & Polish
Milestone Status: COMPLETE

## Implemented
- **Memory Collapse Signature Event (`MemoryCollapseSystem` & `CollapseShadow`)**:
  - Configurable event triggering at 60 seconds of survival (`MEMORY_COLLAPSE_CONFIG.TRIGGER_TIME_MS = 60000`).
  - Pre-event warning countdown at 57s (`SYSTEM INSTABILITY — MEMORY COLLAPSE IN 3... 2... 1...`) with dissonant audio alarm and screen glitch.
  - At 60s, existing Shadows dissolve and a time-compressed (1.25x speed) historical Shadow emerges derived from the player's prior 30s of recorded movement without mutating or duplicating the 60s recording buffer.
  - Collapse Shadow features glowing electric cyan core, unstable chromatic aura, double after-image trails, and fair lethal collision.
  - 20s event duration (60s to 80s). Surviving awards a +1,000 score bonus and celebratory fanfare, followed by smooth restoration of the 5-shadow field.
- **Settings & Accessibility System (`SettingsScene` & `SaveManager`)**:
  - Dedicated interactive Settings screen accessible from Main Menu (`SETTINGS` button / `S` key), Pause overlay, and Game Over screen.
  - Master Volume (0%–100%) and SFX Volume (0%–100%) with logarithmic gain scaling and mute synchronization.
  - Screen Shake toggle (ON/OFF) disabling impact, death, and collapse camera shake when turned off.
  - Reduced Motion toggle (ON/OFF) auto-detecting `prefers-reduced-motion` and damping heavy scaling tweens and particle emission counts.
  - Mobile Touch Controls Opacity adjustment (30%–100%).
  - Full local persistence in `SaveManager` with numeric boundary clamping and corrupted data fallback.
- **Risk-Aware Orb Spawning (`SpawnSystem` & `SpawnPoints`)**:
  - Spawn points categorized into `low`, `medium`, and `high` risk tiers (platforms, center crossings, and aerial gaps).
  - Dynamic risk weighting scaling with difficulty stages (e.g. Stage 1: 10% risk, Stage 5: 80% risk), encouraging cross-arena movement while strictly preserving minimum player distance and unreachable point safety.
- **Extended 5-Stage Difficulty Progression (`DifficultySystem`)**:
  - Stage 1 (0s–15s): 1 Shadow, 5.0s combo timeout, 10% risky spawns.
  - Stage 2 (15s–30s): 2 Shadows, 5.0s combo timeout, 25% risky spawns.
  - Stage 3 (30s–50s): 3 Shadows, 4.8s combo timeout, 40% risky spawns.
  - Stage 4 (50s–60s): 4 Shadows, 4.5s combo timeout, 60% risky spawns.
  - [60s–80s: Memory Collapse Signature Event].
  - Stage 5 (80s+): 5 Shadows maximum, 4.0s tight combo timeout, 80% risky spawns.
- **Expanded Run Statistics & Dynamic Death Messages (`GameOverScene`)**:
  - Dynamic contextual death messages selected from a curated pool.
  - Comprehensive run summary: Final Score, All-Time Best, Survival Time, Orbs Collected, Max Combo Tier, Echoes Faced, Highest Stage Reached, and Memory Collapse Status (`NOT REACHED`, `REACHED`, `SURVIVED (+1000)`).
- **Responsive Viewport & Mobile Polish**:
  - Full multi-touch support with configurable touch button opacity.
  - Clean canvas auto-centering across orientations and non-blocking portrait rotation hints.
- **GitHub Actions & Live Deployment Continuity**:
  - Automated deployment workflow `.github/workflows/deploy-pages.yml` successfully deployed to GitHub Pages.

## Architecture
```text
shadow-runner/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── public/
│   └── assets/
├── src/
│   ├── main.ts
│   ├── effects/
│   │   └── Particles.ts
│   ├── entities/
│   │   ├── CollapseShadow.ts
│   │   ├── EnergyOrb.ts
│   │   ├── Player.ts
│   │   └── Shadow.ts
│   ├── game/
│   │   ├── config.ts
│   │   └── constants.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── GameOverScene.ts
│   │   ├── GameScene.ts
│   │   ├── MenuScene.ts
│   │   ├── PauseScene.ts
│   │   ├── SettingsScene.ts
│   │   └── TutorialScene.ts
│   ├── storage/
│   │   └── SaveManager.ts
│   ├── styles/
│   │   └── style.css
│   ├── systems/
│   │   ├── AudioSystem.ts
│   │   ├── DifficultySystem.ts
│   │   ├── InputSystem.ts
│   │   ├── MemoryCollapseSystem.ts
│   │   ├── RecordingSystem.ts
│   │   ├── ScoreSystem.ts
│   │   ├── ShadowPlaybackSystem.ts
│   │   └── SpawnSystem.ts
│   ├── types/
│   │   └── PlayerSnapshot.ts
│   ├── ui/
│   │   └── MobileControls.ts
│   └── world/
│       ├── Arena.ts
│       └── SpawnPoints.ts
├── tests/
│   ├── gameplay.test.ts
│   ├── m03.test.ts
│   ├── m04.test.ts
│   └── systems.test.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── STATUS.md
```

## Gameplay / Balance Changes
- **Memory Collapse**: Added 20s signature event at 60s with 1.25x historical replay speed and +1,000 score bonus.
- **Late-Run Pressure**: Tightened combo timeout window from 5.0s down to 4.0s in Stage 5 (80s+) and increased risky spawn weighting to 80% rather than increasing shadow counts beyond 5.
- **Safe Hitboxes**: Maintained standard 26x38 physics hitboxes across player, standard shadows, and collapse shadow for 100% fair platforming and collision.

## Verification
- **Automated Tests**: 34 unit tests passing across 4 test suites (`tests/systems.test.ts`, `tests/gameplay.test.ts`, `tests/m03.test.ts`, `tests/m04.test.ts`).
- **TypeScript Typecheck**: `tsc --noEmit` passes with 0 errors in strict mode.
- **Production Build**: Vite builds production bundle cleanly to `dist/` in 3.21s with relative asset paths.
- **GitHub Actions CI/CD**: Run #33512567288 succeeded on all steps (`Setup Node`, `npm ci`, `typecheck`, `test`, `build`, `configure-pages`, `upload-artifact`, `deploy-pages`).
- **Live URL Verification**: `https://3bud-zc.github.io/Shadow-Runner/` verified live (HTTP 200).

## Tests / Commands Run
- `npm run typecheck` (exit code 0, 0 errors)
- `npm test` (exit code 0, 34 unit tests passed)
- `npm run build` (exit code 0, bundle generated in 3.21s)
- `git push origin main` (exit code 0, synced with remote origin/main)

## Browser / Mobile Verification
- Settings screen controls tested for master volume, SFX volume, screen shake toggle, reduced motion, and touch opacity.
- Multi-touch D-pad and action buttons verified responsive without layout overlap on mobile viewports.
- Web Audio synthesis verified with dynamic volume attenuation.

## Performance Review
- Bounded 60s ring buffer shared across normal shadows and Memory Collapse without array duplicating or unbounded allocations.
- Web Audio oscillators and gain nodes cleanly disconnect and terminate on sound completion.
- Particle effects bound lifetimes and reduce count automatically when Reduced Motion is enabled.

## Deployment
- **Repository**: `https://github.com/3bud-ZC/Shadow-Runner`
- **Branch**: `main`
- **Pushed Commit SHA**: `34bde4576352932f913702129e924b1620a2f4cf`
- **GitHub Pages URL**: `https://3bud-zc.github.io/Shadow-Runner/`
- **GitHub Actions Run**: `https://github.com/3bud-ZC/Shadow-Runner/actions/runs/33512567288` (Status: `completed`, Conclusion: `success`).

## Live URL
`https://3bud-zc.github.io/Shadow-Runner/`

## Known Issues
- None. All automated tests, typecheck, build, and GitHub Pages deployment are passing and live.

## Human Verification Needed
- Full playthrough across the 60s mark to experience the Memory Collapse transition and audio-visual feedback in personal browser.

## Next Milestone
M05 — Release Candidate

## Git State
- Branch: `main`
- Remote: `origin = https://github.com/3bud-ZC/Shadow-Runner.git`
- Tracking: `origin/main`
- Clean working tree.
