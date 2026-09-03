# Shadow Runner — The Ink Shinobi

> **OUTRUN YOUR PAST.**
> A fast-paced 2D arcade survival game in classic 1930s Rubber-Hose Ink Cartoon style where your own previous movements return as malicious Inky Doppelgangers.

[![Deploy to GitHub Pages](https://github.com/3bud-ZC/Shadow-Runner/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/3bud-ZC/Shadow-Runner/actions/workflows/deploy-pages.yml)
[![Live Demo](https://img.shields.io/badge/Play_Live_Demo-GitHub_Pages-00f0ff?style=for-the-badge)](https://3bud-zc.github.io/Shadow-Runner/)

---

## 🎮 Live Demo

Play the live web build directly in your desktop or mobile browser:  
👉 **[https://3bud-zc.github.io/Shadow-Runner/](https://3bud-zc.github.io/Shadow-Runner/)**

---

## 🕹️ Core Gameplay & Cartoon Ink Theme

Rather than escaping from traditional enemy AI, the player is a rubber-hose **Ink Shinobi** trapped in an ink-wash dojo escaping from their **own past movement**.

* **Rubber-Hose Ninja Protagonist**: Expressive 1930s pie-eyes, dynamic fluttering headband tails reacting to physics, cartoon running wheels, and squash & stretch jump responsiveness.
* **Smoke Bomb Dash (`POOF!`)**: Disappear in a cartoon smoke cloud with stars, leaving behind an inky speed streak.
* **Inky Shadow Doppelgangers**: Malicious ink echoes that drip ink droplets, grinning wide cartoon grins with sharp teeth and glowing eyes.
* **Signature Mid-Run Event — Memory Collapse**: At 60 seconds, the "Shadow Shogun" boss echo emerges at 1.25x speed from your previous 30 seconds of movement!
* **Ancient Shinobi Scrolls & Combos**: Collect golden scrolls with cartoon sparkle bursts to build rapid collection combos up to **x3.0 MAX COMBO** with comic floating popups.
* **Bouncy Cartoon Audio**: Procedural Web Audio synthesizer featuring spring jumps (*Boing!*), smoke bursts (*Poof!*), bell chimes, and comedic slide whistle death sounds.
* **Settings & Accessibility**: Master volume, SFX volume, screen shake toggle, reduced motion mode, and mobile touch control opacity adjustments.

---

## ⌨️ Controls

### Desktop Keyboard
| Action | Key Bindings |
|---|---|
| **Move Left / Right** | `A` / `D` or `Left` / `Right` Arrow Keys |
| **Jump** | `W`, `Up` Arrow, or `SPACE` (with Coyote Time & Jump Buffering) |
| **Directional Dash** | `SHIFT` (780 speed burst with 1.3s cooldown & smoke bomb) |
| **Pause / Resume** | `ESC` or `P` |
| **Settings** | `S` (from menus or pause overlay) |
| **Mute / Unmute Audio** | `M` or Speaker icon |

### Mobile Touch Controls
* **D-Pad (Bottom Left)**: `◀` (Left) and `▶` (Right) for continuous movement.
* **Action Buttons (Bottom Right)**: `▲` (Jump) and `⚡` (Dash).
* **HUD Corner (Top Right)**: `⏸` (Pause) and `🔊` / `🔇` (Mute toggle).
* Full multi-touch support for simultaneous running, jumping, and dashing.

---

## ⚡ Technology Stack

* **Game Engine**: [Phaser 3](https://phaser.io/) (Arcade Physics & Canvas/WebGL rendering)
* **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero `any` leaks)
* **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
* **Audio**: Procedural [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) cartoon sound synthesizer (zero external audio file dependencies)
* **Testing**: [Vitest](https://vitest.dev/) (Comprehensive unit test suite for gameplay systems)
* **CI/CD & Hosting**: [GitHub Actions](https://github.com/features/actions) + [GitHub Pages](https://pages.github.com/)

---

## 🚀 Local Development

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* `npm`

### Installation
```bash
# Clone the repository
git clone https://github.com/3bud-ZC/Shadow-Runner.git
cd Shadow-Runner

# Install dependencies
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000/`.

### Running Tests & Typecheck
```bash
# Run unit tests
npm test

# Run TypeScript typecheck
npm run typecheck
```

### Production Build
```bash
# Build production bundle to dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 📦 Deployment

This project uses an automated GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that runs typechecking, test suites, and Vite builds before deploying the `dist/` directory to GitHub Pages upon every push to `main`.
