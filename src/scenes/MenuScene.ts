import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { SaveManager } from '../storage/SaveManager';
import { AudioSystem } from '../systems/AudioSystem';

export class MenuScene extends Phaser.Scene {
  private muteBtnText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  public create(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background Cyber Grid
    this.createBackground();

    // Sound / Mute Toggle (Top-Right)
    this.createMuteButton();

    // Game Title
    const title = this.add.text(cx, cy - 155, 'SHADOW RUNNER', {
      fontFamily: 'Orbitron, Rajdhani, sans-serif',
      fontSize: '66px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
      align: 'center',
    }).setOrigin(0.5);

    // Title pulse tween
    this.tweens.add({
      targets: title,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Tagline
    this.add.text(cx, cy - 80, 'OUTRUN YOUR PAST.', {
      fontFamily: 'Orbitron, Rajdhani, sans-serif',
      fontSize: '20px',
      color: COLORS.TEXT_WHITE,
      letterSpacing: 6,
      align: 'center',
    }).setOrigin(0.5);

    // Best Score & Records Display
    const save = SaveManager.load();
    if (save.bestScore > 0) {
      const bestSec = (save.longestSurvivalMs / 1000).toFixed(1);
      this.add.text(
        cx,
        cy - 35,
        `★ BEST: ${save.bestScore.toLocaleString()}  |  SURVIVED: ${bestSec}s  |  ORBS: ${save.mostOrbs} ★`,
        {
          fontFamily: 'Orbitron, monospace',
          fontSize: '14px',
          fontStyle: 'bold',
          color: COLORS.TEXT_GOLD,
          letterSpacing: 1,
        }
      ).setOrigin(0.5);
    }

    // Buttons Row: PLAY, HOW TO PLAY, SETTINGS
    const btnY = cy + 40;
    this.createMenuButton(cx - 210, btnY, 'PLAY', COLORS.TEXT_CYAN, 0x00f0ff, () => this.startGame(), true);
    this.createMenuButton(cx, btnY, 'HOW TO PLAY', '#cbd5e1', 0x334155, () => this.startTutorial(), false);
    this.createMenuButton(cx + 210, btnY, 'SETTINGS', '#94a3b8', 0x00a8b5, () => this.openSettings(), false);

    // Keyboard support
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.on('keydown-H', () => this.startTutorial());
    this.input.keyboard?.on('keydown-S', () => this.openSettings());
    this.input.keyboard?.on('keydown-M', () => this.toggleMute());

    // Controls Guide
    const controlsY = cy + 155;
    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x0c101d, 0.8);
    boxBg.fillRoundedRect(cx - 320, controlsY - 35, 640, 80, 6);
    boxBg.lineStyle(1, 0x1f2a44, 0.8);
    boxBg.strokeRoundedRect(cx - 320, controlsY - 35, 640, 80, 6);

    this.add.text(cx, controlsY - 18, 'CONTROLS OVERVIEW', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      color: COLORS.TEXT_MUTED,
      letterSpacing: 2,
    }).setOrigin(0.5);

    this.add.text(cx, controlsY + 12, 'A / D / ARROWS: Move  |  W / UP / SPACE: Jump  |  SHIFT: Dash  |  ESC/P: Pause', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#cbd5e1',
    }).setOrigin(0.5);
  }

  private createMuteButton(): void {
    const audio = AudioSystem.getInstance();
    const btn = this.add.container(GAME_WIDTH - 55, 30);

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1526, 0.8);
    bg.fillRoundedRect(-22, -18, 44, 36, 6);
    bg.lineStyle(1, 0x1f2e4d, 0.8);
    bg.strokeRoundedRect(-22, -18, 44, 36, 6);

    this.muteBtnText = this.add.text(0, 0, audio.isMuted() ? '🔇' : '🔊', {
      fontSize: '18px',
    }).setOrigin(0.5);

    btn.add([bg, this.muteBtnText]);
    btn.setSize(44, 36);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => this.toggleMute());
  }

  private toggleMute(): void {
    const audio = AudioSystem.getInstance();
    const isMuted = audio.toggleMute();
    this.muteBtnText.setText(isMuted ? '🔇' : '🔊');
    if (!isMuted) {
      audio.playMenuClick();
    }
  }

  private startGame(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.start('GameScene');
  }

  private startTutorial(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.start('TutorialScene');
  }

  private openSettings(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.start('SettingsScene', { returnSceneKey: 'MenuScene' });
  }

  private createMenuButton(
    x: number,
    y: number,
    label: string,
    textColor: string,
    borderColor: number,
    callback: () => void,
    isPrimary: boolean
  ): void {
    const btnContainer = this.add.container(x, y);
    const w = 180;
    const h = 52;

    const bg = this.add.graphics();
    bg.fillStyle(isPrimary ? 0x0a1628 : 0x090f1c, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(2, borderColor, 0.85);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: isPrimary ? '20px' : '15px',
      fontStyle: 'bold',
      color: textColor,
      letterSpacing: isPrimary ? 3 : 1,
    }).setOrigin(0.5);

    btnContainer.add([bg, txt]);
    btnContainer.setSize(w, h);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(borderColor, 0.25);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      bg.lineStyle(2, 0xffffff, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      txt.setColor('#ffffff');
      btnContainer.setScale(1.04);
    });

    btnContainer.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(isPrimary ? 0x0a1628 : 0x090f1c, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      bg.lineStyle(2, borderColor, 0.85);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      txt.setColor(textColor);
      btnContainer.setScale(1);
    });

    btnContainer.on('pointerdown', callback);
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

    // Ambient floating particles
    for (let i = 0; i < 25; i++) {
      const p = this.add.graphics();
      const isCyan = Math.random() > 0.4;
      p.fillStyle(isCyan ? COLORS.PLAYER_CORE : COLORS.SHADOW_GLOW, 0.4);
      p.fillRect(0, 0, 3, 3);
      p.setPosition(Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT);

      this.tweens.add({
        targets: p,
        y: p.y - 40 - Math.random() * 60,
        alpha: { from: 0.1, to: 0.7 },
        duration: 2500 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }
}
