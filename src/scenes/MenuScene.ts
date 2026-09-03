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

    // 1. Vintage 1930s Title Card Backdrop
    this.createVintageTitleCard();

    // 2. Sound / Mute Toggle (Top-Right)
    this.createMuteButton();

    // 3. Main Title: SHADOW RUNNER
    this.add.text(cx + 4, cy - 160 + 4, 'SHADOW RUNNER', {
      fontFamily: 'Orbitron, Impact, sans-serif',
      fontSize: '68px',
      fontStyle: 'bold',
      color: '#000000',
      align: 'center',
    }).setOrigin(0.5).setAlpha(0.6);

    const title = this.add.text(cx, cy - 160, 'SHADOW RUNNER', {
      fontFamily: 'Orbitron, Impact, sans-serif',
      fontSize: '68px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#090a10',
      strokeThickness: 8,
      align: 'center',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Episode Tagline
    this.add.text(cx, cy - 90, "THE INK SHINOBI in: 'OUTRUN YOUR PAST'", {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      fontStyle: 'bold italic',
      color: '#ef233c',
      stroke: '#ffffff',
      strokeThickness: 3,
      letterSpacing: 2,
      align: 'center',
    }).setOrigin(0.5);

    // Best Score & Records Display
    const save = SaveManager.load();
    if (save.bestScore > 0) {
      const bestSec = (save.longestSurvivalMs / 1000).toFixed(1);
      this.add.text(
        cx,
        cy - 40,
        `📜 BEST RECORD: ${save.bestScore.toLocaleString()} PTS  |  TIME: ${bestSec}s  |  SCROLLS: ${save.mostOrbs} 📜`,
        {
          fontFamily: 'Orbitron, monospace',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#ffbe0b',
          stroke: '#090a10',
          strokeThickness: 3,
          letterSpacing: 1,
        }
      ).setOrigin(0.5);
    }

    // Buttons Row: PLAY, HOW TO PLAY, SETTINGS
    const btnY = cy + 45;
    this.createCartoonMenuButton(cx - 210, btnY, '▶ PLAY', '#ffffff', 0xd90429, () => this.startGame(), true);
    this.createCartoonMenuButton(cx, btnY, '📖 GUIDE', '#ffffff', 0x2b2d42, () => this.startTutorial(), false);
    this.createCartoonMenuButton(cx + 210, btnY, '⚙ SETTINGS', '#ffffff', 0x2b2d42, () => this.openSettings(), false);

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.on('keydown-H', () => this.startTutorial());
    this.input.keyboard?.on('keydown-S', () => this.openSettings());
    this.input.keyboard?.on('keydown-M', () => this.toggleMute());

    // Controls Overview Panel
    const controlsY = cy + 160;
    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x12101a, 0.85);
    boxBg.fillRoundedRect(cx - 360, controlsY - 35, 720, 80, 8);
    boxBg.lineStyle(2, 0xdda15e, 0.8);
    boxBg.strokeRoundedRect(cx - 360, controlsY - 35, 720, 80, 8);

    this.add.text(cx, controlsY - 18, '🥋 SHINOBI CONTROLS & MOVES', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffbe0b',
      letterSpacing: 2,
    }).setOrigin(0.5);

    this.add.text(
      cx,
      controlsY + 12,
      'A / D: Run  |  SPACE / W: Jump & Double-Jump Flip  |  Wall Slide & Kick  |  SHIFT: Smoke Dash',
      {
        fontFamily: 'Georgia, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#fdfbf7',
      }
    ).setOrigin(0.5);
  }

  private createVintageTitleCard(): void {
    const bg = this.add.graphics();
    bg.setDepth(-10);

    bg.fillStyle(COLORS.CARTOON_PARCHMENT_BG, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    bg.lineStyle(6, 0x090a10, 1);
    bg.strokeRect(16, 16, GAME_WIDTH - 32, GAME_HEIGHT - 32);

    bg.lineStyle(2, 0xdda15e, 0.9);
    bg.strokeRect(24, 24, GAME_WIDTH - 48, GAME_HEIGHT - 48);

    const corners = [
      { x: 24, y: 24 },
      { x: GAME_WIDTH - 24, y: 24 },
      { x: 24, y: GAME_HEIGHT - 24 },
      { x: GAME_WIDTH - 24, y: GAME_HEIGHT - 24 },
    ];
    for (const c of corners) {
      bg.fillStyle(0x090a10, 1);
      bg.fillCircle(c.x, c.y, 10);
      bg.fillStyle(0xffbe0b, 1);
      bg.fillCircle(c.x, c.y, 4);
    }
  }

  private createMuteButton(): void {
    const audio = AudioSystem.getInstance();
    const btn = this.add.container(GAME_WIDTH - 65, 45);

    const bg = this.add.graphics();
    bg.fillStyle(0x12101a, 0.9);
    bg.fillRoundedRect(-22, -18, 44, 36, 6);
    bg.lineStyle(2, 0xdda15e, 1);
    bg.strokeRoundedRect(-22, -18, 44, 36, 6);

    this.muteBtnText = this.add.text(0, 0, audio.isMuted() ? '🔇' : '🔊', {
      fontSize: '20px',
    }).setOrigin(0.5);

    const hitZone = this.add.zone(0, 0, 44, 36).setInteractive({ useHandCursor: true });
    hitZone.on('pointerdown', () => this.toggleMute());

    btn.add([bg, this.muteBtnText, hitZone]);
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
    try {
      AudioSystem.getInstance().playMenuClick();
    } catch {}
    this.scene.start('GameScene');
  }

  private startTutorial(): void {
    try {
      AudioSystem.getInstance().playMenuClick();
    } catch {}
    this.scene.start('TutorialScene');
  }

  private openSettings(): void {
    try {
      AudioSystem.getInstance().playMenuClick();
    } catch {}
    this.scene.start('SettingsScene', { returnSceneKey: 'MenuScene' });
  }

  private createCartoonMenuButton(
    x: number,
    y: number,
    label: string,
    textColor: string,
    fillColor: number,
    callback: () => void,
    isPrimary: boolean = false
  ): void {
    const container = this.add.container(x, y);
    const width = 175;
    const height = 48;

    const bg = this.add.graphics();
    bg.fillStyle(fillColor, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
    bg.lineStyle(3, 0x000000, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, Impact, sans-serif',
      fontSize: isPrimary ? '19px' : '16px',
      fontStyle: 'bold',
      color: textColor,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Reliable centered interactive Zone for 100% click/touch coverage
    const hitZone = this.add.zone(0, 0, width, height).setInteractive({ useHandCursor: true });

    container.add([bg, txt, hitZone]);

    hitZone.on('pointerover', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets: container,
        scaleX: 1.08,
        scaleY: 0.94,
        duration: 100,
        ease: 'Sine.easeOut',
      });
      try {
        AudioSystem.getInstance().playMenuClick();
      } catch {}
    });

    hitZone.on('pointerout', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Sine.easeOut',
      });
    });

    hitZone.on('pointerdown', () => {
      this.tweens.killTweensOf(container);
      this.tweens.add({
        targets: container,
        scaleX: 0.92,
        scaleY: 1.12,
        duration: 60,
        yoyo: true,
      });
      // Execute immediately so user never suffers delay or missed callbacks
      callback();
    });
  }
}
