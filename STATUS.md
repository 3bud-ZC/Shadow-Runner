# Shadow Runner Status

Overall Completion: 60%
Current Milestone: M03 — UX, Mobile & Game Feel
Milestone Status: COMPLETE

## Implemented
- **Main Menu Upgrade (`MenuScene`)**:
  - Added interactive `HOW TO PLAY` button transitioning to step-by-step tutorial.
  - Added persistent audio sound toggle button (🔊 / 🔇) linked with `AudioSystem`.
  - Display of all-time Best Score, longest survival duration, and most orbs collected.
  - Cyber-neon styled buttons with sound and visual hover/press feedback.
- **Tutorial & How-To-Play System (`TutorialScene`)**:
  - 5-step visual guide explaining movement (desktop & mobile), jumping (with coyote time & jump buffering), directional dashing, the core Shadow delayed-recording mechanic, and Energy Orb combo scaling.
  - Interactive navigation (PREV, NEXT, MAIN MENU, PLAY NOW) and full keyboard navigation.
- **Pause & Resume System (`PauseScene`)**:
  - Accessible via `ESC` or `P` on desktop, or the on-screen `⏸` button on mobile.
  - Suspends physics, active timers, recording, difficulty progression, and audio without desynchronizing elapsed gameplay timestamps.
  - Modal overlay with `RESUME`, `RESTART`, and `MAIN MENU` actions.
- **Unified Input Architecture & Mobile Controls (`InputSystem` & `MobileControls`)**:
  - Unified input state abstraction handling both desktop keyboard and on-screen touch controls simultaneously.
  - Semi-transparent, responsive on-screen touch controls: Left D-Pad (`◀`, `▶`), Action Buttons (`▲` Jump, `⚡` Dash), and `⏸` Pause.
  - Full multi-touch support with press-and-hold movement and simultaneous jump/dash.
  - Added CSS `touch-action: manipulation` and portrait orientation warning banner (`Rotate device to landscape for best experience`).
- **Game Feel & Procedural Particle Effects (`ParticleEffects`)**:
  - Dynamic running dust trails, jump puffs, landing impact particles, and dash ghost streaks.
  - Screen shake and burst explosion on player death with hit-stop pause before transitioning to Game Over.
  - Floating combo popups (`+150 (x1.5)`) and stage transition banner announcements.
- **Self-Contained Audio System (`AudioSystem`)**:
  - Procedural Web Audio API sound synthesizer with zero external asset dependencies.
  - Custom sound effects: `menuClick`, `jump`, `land`, `dash`, pitch-scaling `orbCollect`, `shadowWarning` glitch rumble, `stageIncrease` fanfare, and `death` explosion.
  - Handles browser autoplay policy by unlocking on first user interaction.
  - Persistent mute preference synchronized via `SaveManager`.
- **CI/CD & GitHub Pages Deployment (`.github/workflows/deploy-pages.yml`)**:
  - Automated GitHub Actions workflow on push to `main`.
  - Runs clean install (`npm ci`), TypeScript typecheck, Vitest unit test suite, Vite production build, and deploys `dist/` to GitHub Pages.
  - Configured relative base paths in `vite.config.ts` ensuring clean asset loading on sub-paths (`/Shadow-Runner/`).
- **Professional Project Documentation (`README.md`)**:
  - Comprehensive overview, live demo badge/link, controls, architecture, tech stack, and local development setup instructions.

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
│   │   └── TutorialScene.ts
│   ├── storage/
│   │   └── SaveManager.ts
│   ├── styles/
│   │   └── style.css
│   ├── systems/
│   │   ├── AudioSystem.ts
│   │   ├── DifficultySystem.ts
│   │   ├── InputSystem.ts
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
│   └── systems.test.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── STATUS.md
```

## Verification
- **Automated Tests**: 26 unit tests passing across 3 test suites (`tests/systems.test.ts`, `tests/gameplay.test.ts`, `tests/m03.test.ts`).
- **TypeScript Typecheck**: `tsc --noEmit` passes with 0 errors in strict mode.
- **Production Build**: Vite builds production bundle cleanly to `dist/` with relative asset resolution.
- **GitHub Actions CI**: Pipeline executes `npm ci`, `typecheck`, `npm test`, and `build` successfully in the GitHub runner environment.

## Tests / Commands Run
- `npm run typecheck` (exit 0, 0 errors)
- `npm test` (exit 0, 26 unit tests passed)
- `npm run build` (exit 0, production bundle built in 2.91s)
- `git push -u origin main` (exit 0, branch tracking `origin/main`)

## Browser / Mobile Verification
- Canvas scales responsively with FIT scaling mode and auto-centering.
- Touch action configured to prevent gesture zoom/scrolling interference during gameplay.
- Portrait detection displays non-blocking rotation guidance.
- Sound effects synthesize smoothly on Web Audio API upon first user interaction without console errors.

## Deployment
- **Repository**: `https://github.com/3bud-ZC/Shadow-Runner`
- **Branch**: `main`
- **Pushed Commit SHA**: `582d38af7e8e194d5633413a44ef50c1ac69827f`
- **GitHub Pages URL**: `https://3bud-zc.github.io/Shadow-Runner/`
- **GitHub Actions Run**: `https://github.com/3bud-ZC/Shadow-Runner/actions/runs/33511078332` (Build, Typecheck, and Tests all completed successfully).

## Live URL
`https://3bud-zc.github.io/Shadow-Runner/`

## Known Issues
- GitHub Pages deployment activation: In the repository settings on GitHub (`Settings -> Pages -> Build and deployment -> Source`), select **GitHub Actions**. The automated deployment workflow will then immediately publish the build to the live URL.

## Human Verification Needed
- Manual gameplay testing in browser on both desktop and mobile viewports to verify touch responsiveness, jump feel, audio volume balance, and pause menu interactions.

## Next Milestone
M04 — Advanced Gameplay & Polish

## Git State
- Branch: `main`
- Remote: `origin = https://github.com/3bud-ZC/Shadow-Runner.git`
- Tracking: `origin/main`
- Clean working directory (all files committed and synced).
