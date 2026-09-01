# Shadow Runner Status

Overall Completion: 100%
Current Milestone: M05 — Release Candidate
Milestone Status: COMPLETE
Release Status: RELEASED
Release Version: v1.0.0

## Final Features
- **Core Delayed Echo Mechanic**: Player movement history recorded at 20Hz into a bounded rolling snapshot buffer and deterministically replayed as up to 5 concurrent lethal historical Shadows.
- **Memory Collapse Signature Event**: 20s reality destabilization event at 60s survival where normal Shadows dissolve and a time-compressed (1.25x speed) historical Echo emerges, awarding +1,000 bonus points upon survival.
- **Dynamic Energy Orb & Combo System**: Risk-aware orb spawn distribution across low, medium, and high-risk arena corridors with step-up combo multipliers up to x3.0.
- **Full Settings & Accessibility**: Master volume, SFX volume, screen shake toggle, reduced motion support, and mobile touch control opacity adjustment.
- **Unified Cross-Platform Controls**: Responsive desktop keyboard and mobile on-screen multi-touch D-pad/action controls with window focus-loss protection.
- **Procedural Web Audio API Synthesizer**: Complete sound design (jumps, lands, dashes, orb chimes, warnings, fanfares, collapse sirens, death impacts) with zero external audio assets.
- **Interactive Multi-Step Tutorial & Modal Pause Overlay**: 6 visual instructional steps and suspend/resume game lifecycle.
- **Local Persistence**: Resilient local storage of all-time high scores, longest survival time, most orbs, and user preferences with migration fallbacks.
- **Release Presentation**: Vector SVG favicon, Open Graph social metadata, responsive viewport scaling, and orientation guidance.

## Architecture
```text
shadow-runner/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── public/
│   ├── favicon.svg
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
│   ├── m05.test.ts
│   └── systems.test.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── STATUS.md
```

## Gameplay & Balance
- **Fair Physics & Hitboxes**: Standard 26x38 pixel hitbox maintained consistently across player, normal shadows, and collapse shadow.
- **Pacing**: 5-stage difficulty progression extending past 75s with tight 4.0s combo windows and 80% risk-weighted spawn bias rather than infinite shadow proliferation.
- **Movement Responsiveness**: 130ms Coyote Time, 120ms Jump Buffering, variable jump velocity cut on button release, and directional 760-speed dash with visual cooldown gauge.

## Accessibility & Settings
- Screen Shake toggle allows disabling intense camera shakes.
- Reduced Motion mode auto-detects `prefers-reduced-motion` and scales down particle volume and rapid tween scaling.
- Audio volume sliders provide independent Master (0%–100%) and SFX (0%–100%) gain controls.
- Touch controls opacity slider allows customizable on-screen control visibility.

## Verification
- **TypeScript Typecheck**: Strict mode `tsc --noEmit` passes with 0 errors.
- **Automated Tests**: 40 unit tests passing across 5 test suites (`tests/systems.test.ts`, `tests/gameplay.test.ts`, `tests/m03.test.ts`, `tests/m04.test.ts`, `tests/m05.test.ts`).
- **Production Build**: Production bundle built cleanly to `dist/` with relative sub-path asset resolution.
- **GitHub Actions CI/CD**: Verified automated typecheck, test, build, and Pages deployment pipeline.
- **Live URL**: Verified live deployment on GitHub Pages (`https://3bud-zc.github.io/Shadow-Runner/`).

## Automated Tests
- `tests/systems.test.ts` (7 tests): Rolling history buffer, linear snapshot interpolation, delayed multi-shadow playback.
- `tests/gameplay.test.ts` (14 tests): Difficulty stages, score calculations, safe spawn point allocation, local storage saves.
- `tests/m03.test.ts` (5 tests): Web Audio API synthesis, audio mute persistence, unified touch/keyboard input mapping.
- `tests/m04.test.ts` (8 tests): Memory Collapse lifecycle, time-compressed sampling formula, settings bounds clamping, risk-weighted orb spawning.
- `tests/m05.test.ts` (6 tests): Window focus loss input reset, legacy storage schema migration and corrupted data recovery, multi-orb combo bounds, dynamic audio gain scaling.

## Browser / Mobile Verification
- Desktop viewports (1920x1080, 1366x768, 1280x720) render crisp 16:9 centered canvas.
- Mobile landscape viewports display comfortable D-pad and action touch targets without HUD clipping.
- Mobile portrait viewports display non-blocking rotation guidance with full touch responsiveness.
- Window blur / tab switching safely resets active movement states without stuck keys.

## Performance Review
- Bounded 60s ring buffer shared across all systems with zero unbounded memory allocations.
- Transient Web Audio nodes disconnect and terminate cleanly on sound completion.
- Particle counts and tween durations bounded with automatic pooling and reduction during Reduced Motion mode.

## Deployment
- **Repository**: `https://github.com/3bud-ZC/Shadow-Runner`
- **Release Branch**: `main`
- **Release Tag**: `v1.0.0`
- **GitHub Pages URL**: `https://3bud-zc.github.io/Shadow-Runner/`

## Live URL
`https://3bud-zc.github.io/Shadow-Runner/`

## Release Metadata
- **Release Version**: `v1.0.0`
- **Implementation Commit**: `d0e1d9eb974489b6c5872c8c1103c716296fea9b`
- **Release Branch**: `main`
- **Release Tag**: `v1.0.0`

## Known Issues
- None. All release criteria, automated tests, and live production deployments are verified.

## Human Verification Recommended
- Public playtesting on diverse mobile browsers (iOS Safari / Android Chrome) to verify device-specific touch haptics and audio unlocks.

## Git State
- Branch: `main`
- Release Tag: `v1.0.0`
- Tracking: `origin/main`
- Clean working tree.
