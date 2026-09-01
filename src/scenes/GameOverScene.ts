import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { RunRecordResult } from '../storage/SaveManager';
import { AudioSystem } from '../systems/AudioSystem';

export interface GameOverData {
  score?: number;
  survivalTimeMs?: number;
  orbs?: number;
  maxCombo?: number;
  maxShadows?: number;
  highestStage?: number;
  memoryCollapseReached?: boolean;
  memoryCollapseSurvived?: boolean;
  recordResult?: RunRecordResult;
}

export class GameOverScene extends Phaser.Scene {
  private gameOverData: GameOverData = {};

  private readonly deathMessages = [
    'YOUR PAST CAUGHT UP WITH YOU.',
    'YOU CREATED THAT.',
    'EVERY MOVE HAS CONSEQUENCES.',
    'OUTRUNNING YOURSELF IS HARD.',
    'THE ECHO WON THIS ROUND.',
  ];

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
    const highestStage = this.gameOverData.highestStage || 1;
    const collapseReached = Boolean(this.gameOverData.memoryCollapseReached);
    const collapseSurvived = Boolean(this.gameOverData.memoryCollapseSurvived);
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
    const title = this.add.text(cx, cy - 195, 'CAUGHT BY YOUR SHADOW', {
      fontFamily: 'Orbitron, Rajdhani, sans-serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: COLORS.TEXT_RED,
      align: 'center',
    }).setOrigin(0.5);

    // Title pulse tween
    this.tweens.add({
      targets: title,
      alpha: { from: 0.85, to: 1 },
      scaleX: { from: 0.99, to: 1.01 },
      duration: 120,
      yoyo: true,
      repeat: -1,
    });

    // Dynamic Contextual Death Message
    const msgIndex = Math.floor(Math.random() * this.deathMessages.length);
    this.add.text(cx, cy - 155, `"${this.deathMessages[msgIndex]}"`, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: COLORS.TEXT_GOLD,
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Stats Container Panel
    const panelBg = this.add.graphics();
    const panelW = 660;
    const panelH = 220;
    const panelY = cy - 20;
    panelBg.fillStyle(0x0a101d, 0.92);
    panelBg.fillRoundedRect(cx - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    panelBg.lineStyle(1.5, 0x1f2a44, 0.9);
    panelBg.strokeRoundedRect(cx - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);

    // New Best Banner if achieved
    if (recordResult?.isNewBestScore) {
      const newBestBadge = this.add.text(cx, panelY - panelH / 2 - 16, '★ NEW BEST SCORE ★', {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '14px',
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
    this.add.text(cx - 280, panelY - 80, 'FINAL SCORE', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      color: COLORS.TEXT_MUTED,
    });
    this.add.text(cx - 280, panelY - 58, score.toLocaleString(), {
      fontFamily: 'Orbitron, monospace',
      fontSize: '26px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
    });

    this.add.text(cx + 40, panelY - 80, 'ALL-TIME BEST', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      color: COLORS.TEXT_MUTED,
    });
    this.add.text(cx + 40, panelY - 58, bestScore.toLocaleString(), {
      fontFamily: 'Orbitron, monospace',
      fontSize: '26px',
      fontStyle: 'bold',
      color: COLORS.TEXT_GOLD,
    });

    // Secondary stats line
    const totalSeconds = (survivalTimeMs / 1000).toFixed(2);
    const timeStr = `${totalSeconds}s${recordResult?.isNewLongestSurvival ? ' (NEW!)' : ''}`;
    const orbStr = `${orbs}${recordResult?.isNewMostOrbs ? ' (NEW!)' : ''}`;

    let collapseStatus = 'NOT REACHED';
    let collapseColor = COLORS.TEXT_MUTED;
    if (collapseSurvived) {
      collapseStatus = 'SURVIVED (+1000)';
      collapseColor = COLORS.TEXT_GOLD;
    } else if (collapseReached) {
      collapseStatus = 'REACHED';
      collapseColor = COLORS.TEXT_CYAN;
    }

    this.add.text(cx - 280, panelY - 10, `TIME SURVIVED: ${timeStr}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    });

    this.add.text(cx - 280, panelY + 20, `ORBS COLLECTED: ${orbStr}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    });

    this.add.text(cx - 280, panelY + 50, `MAX COMBO: x${maxCombo.toFixed(1)}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    });

    this.add.text(cx + 40, panelY - 10, `HIGHEST: STAGE ${highestStage}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    });

    this.add.text(cx + 40, panelY + 20, `ECHOES FACED: ${maxShadows} / 5`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    });

    this.add.text(cx + 40, panelY + 50, `MEMORY COLLAPSE: ${collapseStatus}`, {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: collapseColor,
    });

    // Buttons Row: RETRY, SETTINGS, MAIN MENU
    const btnY = cy + 130;
    this.createButton(cx - 180, btnY, 'RETRY', '#00f0ff', 0x00f0ff, () => this.restartGame());
    this.createButton(cx, btnY, 'SETTINGS', '#94a3b8', 0x00a8b5, () => this.openSettings());
    this.createButton(cx + 180, btnY, 'MAIN MENU', '#cbd5e1', 0x707e94, () => this.gotoMainMenu());

    // Keyboard Shortcuts
    this.input.keyboard?.on('keydown-SPACE', () => this.restartGame());
    this.input.keyboard?.on('keydown-R', () => this.restartGame());
    this.input.keyboard?.on('keydown-ENTER', () => this.restartGame());
    this.input.keyboard?.on('keydown-S', () => this.openSettings());
    this.input.keyboard?.on('keydown-ESC', () => this.gotoMainMenu());

    // Shortcuts hint
    this.add.text(cx, cy + 195, '[SPACE / R] Retry   |   [S] Settings   |   [ESC] Main Menu', {
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '15px',
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
    const w = 160;
    const h = 46;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1320, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, borderColor, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '16px',
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
      bg.fillStyle(0x0e1320, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      bg.lineStyle(1.5, borderColor, 0.8);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      txt.setColor(textColor);
      btnContainer.setScale(1);
    });

    btnContainer.on('pointerdown', callback);
  }

  private restartGame(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.start('GameScene');
  }

  private openSettings(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.start('SettingsScene', { returnSceneKey: 'GameOverScene' });
  }

  private gotoMainMenu(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.start('MenuScene');
  }
}
