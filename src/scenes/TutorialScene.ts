import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { AudioSystem } from '../systems/AudioSystem';

interface TutorialStep {
  title: string;
  subtitle: string;
  instructions: { label: string; detail: string }[];
  highlight: string;
  icon: string;
}

export class TutorialScene extends Phaser.Scene {
  private currentStepIndex: number = 0;
  private contentContainer!: Phaser.GameObjects.Container;
  private stepIndicatorText!: Phaser.GameObjects.Text;
  private prevBtnContainer!: Phaser.GameObjects.Container;
  private nextBtnContainer!: Phaser.GameObjects.Container;
  private nextBtnText!: Phaser.GameObjects.Text;

  private steps: TutorialStep[] = [
    {
      title: 'STEP 1 — MOVEMENT',
      subtitle: 'Navigate the neon simulation arena',
      instructions: [
        { label: 'DESKTOP', detail: 'Press A / D or Left / Right Arrows to run' },
        { label: 'MOBILE', detail: 'Hold touch arrows ◀ and ▶ on the bottom-left' },
      ],
      highlight: 'Fluid horizontal acceleration & deceleration with crisp responsiveness.',
      icon: '◀ ▶',
    },
    {
      title: 'STEP 2 — JUMPING',
      subtitle: 'Leap between multi-tiered platforms',
      instructions: [
        { label: 'DESKTOP', detail: 'Press W, Up Arrow, or SPACE to jump' },
        { label: 'MOBILE', detail: 'Tap the ▲ Jump button on the bottom-right' },
      ],
      highlight: 'Features 130ms Coyote Time & 120ms Jump Buffering for reliable platforming.',
      icon: '▲',
    },
    {
      title: 'STEP 3 — DIRECTIONAL DASH',
      subtitle: 'Burst through open gaps and evade danger',
      instructions: [
        { label: 'DESKTOP', detail: 'Press SHIFT to dash in your facing direction' },
        { label: 'MOBILE', detail: 'Tap the ⚡ Dash button on the bottom-right' },
      ],
      highlight: 'Short 760-speed burst with a 1.4-second cooldown indicator.',
      icon: '⚡',
    },
    {
      title: 'STEP 4 — THE SHADOW',
      subtitle: 'The Core Mechanic: Outrun Your Past',
      instructions: [
        { label: 'RECORDING', detail: 'Every jump, dash, and step you take is recorded at 20Hz.' },
        { label: 'MATERIALIZATION', detail: 'After 5 seconds, your first Shadow appears replaying your exact moves.' },
        { label: 'DANGER', detail: 'Touching any Shadow means instant death. Up to 5 Echoes will appear!' },
      ],
      highlight: 'OUTRUN YOUR PAST. Predict your own previous routes to survive.',
      icon: '⚡ ☠',
    },
    {
      title: 'STEP 5 — ORBS & COMBOS',
      subtitle: 'Risk vs Reward: Score and Scale',
      instructions: [
        { label: 'ENERGY ORBS', detail: 'Touch glowing Orbs to earn +100 base score.' },
        { label: 'COMBO MULTIPLIER', detail: 'Collect within the combo window to build up to x3.0 MAX COMBO.' },
        { label: 'SURVIVAL', detail: 'Earn +10 score per second as Shadows multiply over time.' },
      ],
      highlight: 'Cross dangerous paths to keep your combo alive and set high scores!',
      icon: '★',
    },
    {
      title: 'STEP 6 — MEMORY COLLAPSE',
      subtitle: 'Survive the signature mid-run destabilization',
      instructions: [
        { label: 'TRIGGER', detail: 'At 60 seconds, a 3-second instability alarm sounds.' },
        { label: 'DESTABILIZATION', detail: 'Normal Shadows dissolve and a 1.25x time-compressed Echo emerges!' },
        { label: 'SURVIVAL BONUS', detail: 'Survive 20 seconds to earn +1,000 score bonus and restore the arena.' },
      ],
      highlight: 'A true test of route mastery. Outrun your compressed recent past!',
      icon: '⚡ ★',
    },
  ];

  constructor() {
    super({ key: 'TutorialScene' });
  }

  public create(): void {
    this.currentStepIndex = 0;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background Cyber Grid
    this.createBackground();

    // Header Title
    this.add.text(cx, 60, 'HOW TO PLAY', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
      letterSpacing: 4,
    }).setOrigin(0.5);

    this.stepIndicatorText = this.add.text(cx, 100, `STEP 1 OF ${this.steps.length}`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: COLORS.TEXT_MUTED,
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Content container
    this.contentContainer = this.add.container(cx, cy - 20);

    // Bottom Navigation Bar
    const navY = GAME_HEIGHT - 70;

    // Back / Prev Button
    this.prevBtnContainer = this.createButton(cx - 280, navY, '◀ PREV', '#cbd5e1', 0x24324f, () => {
      this.prevStep();
    });

    // Close / Menu Button
    this.createButton(cx - 90, navY, 'MAIN MENU', '#94a3b8', 0x1f2a44, () => {
      AudioSystem.getInstance().playMenuClick();
      this.scene.start('MenuScene');
    });

    // Next / Play Button
    this.nextBtnContainer = this.createButton(cx + 100, navY, 'NEXT ▶', COLORS.TEXT_CYAN, 0x00f0ff, () => {
      this.nextStep();
    });
    this.nextBtnText = this.nextBtnContainer.getByName('btn-text') as Phaser.GameObjects.Text;

    // Play Now Quick Start Button
    this.createButton(cx + 280, navY, 'PLAY NOW', COLORS.TEXT_GOLD, 0xffbe0b, () => {
      AudioSystem.getInstance().playMenuClick();
      this.scene.start('GameScene');
    });

    // Keyboard Shortcuts
    this.input.keyboard?.on('keydown-LEFT', () => this.prevStep());
    this.input.keyboard?.on('keydown-RIGHT', () => this.nextStep());
    this.input.keyboard?.on('keydown-SPACE', () => this.nextStep());
    this.input.keyboard?.on('keydown-ENTER', () => this.nextStep());
    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MenuScene'));

    // Render initial step
    this.renderStep();
  }

  private renderStep(): void {
    this.contentContainer.removeAll(true);
    const step = this.steps[this.currentStepIndex];

    this.stepIndicatorText.setText(`STEP ${this.currentStepIndex + 1} OF ${this.steps.length}`);

    // Update Next / Start label
    if (this.currentStepIndex === this.steps.length - 1) {
      this.nextBtnText.setText('START ▶');
    } else {
      this.nextBtnText.setText('NEXT ▶');
    }

    // Toggle prev button visibility
    this.prevBtnContainer.setAlpha(this.currentStepIndex === 0 ? 0.35 : 1);

    // Card Box Background
    const cardW = 760;
    const cardH = 340;
    const bg = this.add.graphics();
    bg.fillStyle(0x0c1220, 0.9);
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);
    bg.lineStyle(1.5, 0x1e2c4a, 0.9);
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 10);

    // Step Title
    const titleText = this.add.text(0, -cardH / 2 + 35, step.title, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Subtitle
    const subText = this.add.text(0, -cardH / 2 + 65, step.subtitle, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      color: COLORS.TEXT_MUTED,
    }).setOrigin(0.5);

    this.contentContainer.add([bg, titleText, subText]);

    // Instructions List
    let currentY = -cardH / 2 + 110;
    for (const item of step.instructions) {
      const badgeBg = this.add.graphics();
      badgeBg.fillStyle(0x18243b, 1);
      badgeBg.fillRoundedRect(-cardW / 2 + 40, currentY - 12, 120, 24, 4);

      const badgeTxt = this.add.text(-cardW / 2 + 100, currentY, item.label, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: COLORS.TEXT_CYAN,
      }).setOrigin(0.5);

      const detailTxt = this.add.text(-cardW / 2 + 175, currentY, item.detail, {
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0, 0.5);

      this.contentContainer.add([badgeBg, badgeTxt, detailTxt]);
      currentY += 45;
    }

    // Highlight Banner
    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x141f33, 0.8);
    bannerBg.fillRoundedRect(-cardW / 2 + 40, cardH / 2 - 60, cardW - 80, 36, 6);
    bannerBg.lineStyle(1, 0x00f0ff, 0.5);
    bannerBg.strokeRoundedRect(-cardW / 2 + 40, cardH / 2 - 60, cardW - 80, 36, 6);

    const bannerTxt = this.add.text(0, cardH / 2 - 42, `💡 ${step.highlight}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: COLORS.TEXT_GOLD,
    }).setOrigin(0.5);

    this.contentContainer.add([bannerBg, bannerTxt]);

    // Animate Card in
    this.contentContainer.setAlpha(0);
    this.contentContainer.setScale(0.96);
    this.tweens.add({
      targets: this.contentContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Cubic.easeOut',
    });
  }

  private nextStep(): void {
    AudioSystem.getInstance().playMenuClick();
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.renderStep();
    } else {
      this.scene.start('GameScene');
    }
  }

  private prevStep(): void {
    if (this.currentStepIndex > 0) {
      AudioSystem.getInstance().playMenuClick();
      this.currentStepIndex--;
      this.renderStep();
    }
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    textColor: string,
    borderColor: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const btnContainer = this.add.container(x, y);
    const w = 150;
    const h = 44;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1526, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, borderColor, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: textColor,
    }).setOrigin(0.5);
    txt.setName('btn-text');

    btnContainer.add([bg, txt]);
    btnContainer.setSize(w, h);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(borderColor, 0.25);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(2, 0xffffff, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      txt.setColor('#ffffff');
      btnContainer.setScale(1.04);
    });

    btnContainer.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x0e1526, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(1.5, borderColor, 0.8);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      txt.setColor(textColor);
      btnContainer.setScale(1);
    });

    btnContainer.on('pointerdown', callback);
    return btnContainer;
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BG_DARK, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    bg.lineStyle(1, COLORS.BG_GRID, 0.35);
    const gridSize = 40;
    for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
      bg.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += gridSize) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }
  }
}
