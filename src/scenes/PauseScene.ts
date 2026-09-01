import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { AudioSystem } from '../systems/AudioSystem';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  public create(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Semi-transparent dimming background
    const bg = this.add.graphics();
    bg.fillStyle(0x050811, 0.85);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Subtle pause cyber grid lines
    bg.lineStyle(1, 0x141f33, 0.4);
    for (let x = 0; x <= GAME_WIDTH; x += 40) {
      bg.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Pause Dialog Box
    const boxW = 440;
    const boxH = 360;
    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x0b111f, 0.95);
    boxBg.fillRoundedRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 10);
    boxBg.lineStyle(1.5, 0x00f0ff, 0.8);
    boxBg.strokeRoundedRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH, 10);

    // Title
    this.add.text(cx, cy - 120, 'PAUSED', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(cx, cy - 80, 'SIMULATION SUSPENDED', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '15px',
      color: COLORS.TEXT_MUTED,
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Action Buttons
    this.createButton(cx, cy - 30, 'RESUME', COLORS.TEXT_CYAN, 0x00f0ff, () => this.resumeGame());
    this.createButton(cx, cy + 25, 'SETTINGS', '#cbd5e1', 0x00a8b5, () => this.openSettings());
    this.createButton(cx, cy + 80, 'RESTART', '#e2e8f0', 0x334155, () => this.restartGame());
    this.createButton(cx, cy + 135, 'MAIN MENU', '#94a3b8', 0x1e293b, () => this.gotoMainMenu());

    // Keyboard bindings
    this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
    this.input.keyboard?.on('keydown-P', () => this.resumeGame());
    this.input.keyboard?.on('keydown-SPACE', () => this.resumeGame());
  }

  private resumeGame(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.stop();
    this.scene.resume('GameScene');
  }

  private openSettings(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.pause();
    this.scene.launch('SettingsScene', { returnSceneKey: 'PauseScene' });
  }

  private restartGame(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('GameScene');
  }

  private gotoMainMenu(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.stop();
    this.scene.stop('GameScene');
    this.scene.start('MenuScene');
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    textColor: string,
    borderColor: number,
    callback: () => void
  ): void {
    const btnContainer = this.add.container(x, y);
    const w = 240;
    const h = 42;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1628, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, borderColor, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: textColor,
    }).setOrigin(0.5);

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
      bg.fillStyle(0x0e1628, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(1.5, borderColor, 0.8);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      txt.setColor(textColor);
      btnContainer.setScale(1);
    });

    btnContainer.on('pointerdown', callback);
  }
}
