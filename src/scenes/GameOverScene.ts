import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { RunRecordResult } from '../storage/SaveManager';

export interface GameOverData {
  score?: number;
  survivalTimeMs?: number;
  orbs?: number;
  maxCombo?: number;
  maxShadows?: number;
  recordResult?: RunRecordResult;
}

export class GameOverScene extends Phaser.Scene {
  private gameOverData: GameOverData = {};

  constructor() {
    super({ key: 'GameOverScene' });
  }

  public init(data: GameOverData): void {
    this.gameOverData = data || {};
  }

  public create(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const score = this.gameOverData.score || 0;
    const survivalTimeMs = this.gameOverData.survivalTimeMs || 0;
    const orbs = this.gameOverData.orbs || 0;
    const maxCombo = this.gameOverData.maxCombo || 1.0;
    const maxShadows = this.gameOverData.maxShadows || 1;
    const recordResult = this.gameOverData.recordResult;
    const bestScore = recordResult?.currentSave.bestScore || score;

    // Dark semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x05070c, 0.94);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Red cyber grid lines
    overlay.lineStyle(1, 0x3d0c1e, 0.35);
    for (let x = 0; x <= GAME_WIDTH; x += 40) {
      overlay.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 40) {
      overlay.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Title: CAUGHT BY YOUR SHADOW
    const title = this.add.text(cx, cy - 180, 'CAUGHT BY YOUR SHADOW', {
      fontFamily: 'Orbitron, Rajdhani, sans-serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: COLORS.TEXT_RED,
      align: 'center',
    }).setOrigin(0.5);

    // Title pulse/glitch tween
    this.tweens.add({
      targets: title,
      alpha: { from: 0.85, to: 1 },
      scaleX: { from: 0.99, to: 1.01 },
      duration: 120,
      yoyo: true,
      repeat: -1,
    });

    // Stats Container Panel
    const panelBg = this.add.graphics();
    const panelW = 620;
    const panelH = 200;
    const panelY = cy - 25;
    panelBg.fillStyle(0x0a101d, 0.9);
    panelBg.fillRoundedRect(cx - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    panelBg.lineStyle(1, 0x1f2a44, 0.9);
    panelBg.strokeRoundedRect(cx - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);

    // New Best Banner if achieved
    if (recordResult?.isNewBestScore) {
      const newBestBadge = this.add.text(cx, panelY - panelH / 2 - 16, '★ NEW BEST SCORE ★', {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: COLORS.TEXT_GOLD,
        backgroundColor: '#3d2800',
        padding: { x: 12, y: 4 },
      }).setOrigin(0.5);

      this.tweens.add({
        targets: newBestBadge,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    }

    // Score & Best
    this.add.text(cx - 260, panelY - 65, 'FINAL SCORE', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: COLORS.TEXT_MUTED,
    });
    this.add.text(cx - 260, panelY - 40, score.toLocaleString(), {
      fontFamily: 'Orbitron, monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
    });

    this.add.text(cx + 60, panelY - 65, 'ALL-TIME BEST', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: COLORS.TEXT_MUTED,
    });
    this.add.text(cx + 60, panelY - 40, bestScore.toLocaleString(), {
      fontFamily: 'Orbitron, monospace',
      fontSize: '28px',
      fontStyle: 'bold',
      color: COLORS.TEXT_GOLD,
    });

    // Secondary stats line
    const totalSeconds = (survivalTimeMs / 1000).toFixed(2);
    const timeStr = `${totalSeconds}s${recordResult?.isNewLongestSurvival ? ' (NEW!)' : ''}`;
    const orbStr = `${orbs}${recordResult?.isNewMostOrbs ? ' (NEW!)' : ''}`;

    this.add.text(cx - 260, panelY + 15, `TIME SURVIVED: ${timeStr}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    });

    this.add.text(cx - 260, panelY + 45, `ORBS COLLECTED: ${orbStr}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    });

    this.add.text(cx + 60, panelY + 15, `MAX COMBO: x${maxCombo.toFixed(1)}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    });

    this.add.text(cx + 60, panelY + 45, `ECHOES FACED: ${maxShadows} / 5`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    });

    // Buttons Container
    const btnY = cy + 125;
    this.createButton(cx - 130, btnY, 'RETRY', '#00f0ff', 0x00f0ff, () => this.restartGame());
    this.createButton(cx + 130, btnY, 'MAIN MENU', '#cbd5e1', 0x707e94, () => this.gotoMainMenu());

    // Keyboard Shortcuts
    this.input.keyboard?.on('keydown-SPACE', () => this.restartGame());
    this.input.keyboard?.on('keydown-R', () => this.restartGame());
    this.input.keyboard?.on('keydown-ENTER', () => this.restartGame());
    this.input.keyboard?.on('keydown-ESC', () => this.gotoMainMenu());

    // Shortcuts hint
    this.add.text(cx, cy + 195, '[SPACE / R] Retry     |     [ESC] Main Menu', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '16px',
      color: COLORS.TEXT_MUTED,
    }).setOrigin(0.5);
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
    const w = 180;
    const h = 50;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1320, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(2, borderColor, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '18px',
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
      btnContainer.setScale(1.05);
    });

    btnContainer.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x0e1320, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(2, borderColor, 0.8);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      txt.setColor(textColor);
      btnContainer.setScale(1);
    });

    btnContainer.on('pointerdown', callback);
  }

  private restartGame(): void {
    this.scene.start('GameScene');
  }

  private gotoMainMenu(): void {
    this.scene.start('MenuScene');
  }
}
