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

  private readonly deathHeadlines = [
    'SHINOBI CAUGHT BY HIS OWN PAST!',
    'INK ECHO CLAIMS ANOTHER ROUND!',
    'OUTRUNNING YOURSELF PROVES FATAL!',
    'THE INK WINS THIS CARTOON BATTLE!',
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
    const recordResult = this.gameOverData.recordResult;
    const bestScore = recordResult?.currentSave.bestScore || score;

    // 1. Dark vintage background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x090a10, 0.92);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 2. THE DAILY TOON NEWSPAPER CONTAINER
    const newspaper = this.add.container(cx, cy);
    newspaper.setScale(0.1);
    newspaper.setRotation(-Math.PI * 3);

    // Spinning Newspaper intro tween
    this.tweens.add({
      targets: newspaper,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      duration: 550,
      ease: 'Back.easeOut',
    });

    // Newspaper page graphics
    const paperW = 720;
    const paperH = 500;
    const paper = this.add.graphics();

    // Vintage newsprint paper
    paper.fillStyle(COLORS.CARTOON_PARCHMENT_BG, 1);
    paper.fillRoundedRect(-paperW / 2, -paperH / 2, paperW, paperH, 6);
    paper.lineStyle(4, 0x090a10, 1);
    paper.strokeRoundedRect(-paperW / 2, -paperH / 2, paperW, paperH, 6);

    // Newspaper Masthead banner
    paper.lineStyle(2, 0x090a10, 1);
    paper.lineBetween(-paperW / 2 + 15, -paperH / 2 + 70, paperW / 2 - 15, -paperH / 2 + 70);
    paper.lineBetween(-paperW / 2 + 15, -paperH / 2 + 75, paperW / 2 - 15, -paperH / 2 + 75);

    newspaper.add(paper);

    // Masthead text: "THE DAILY TOON"
    const masthead = this.add.text(0, -paperH / 2 + 35, '★ THE DAILY TOON ★', {
      fontFamily: 'Impact, Georgia, serif',
      fontSize: '44px',
      color: '#090a10',
      letterSpacing: 4,
      align: 'center',
    }).setOrigin(0.5);
    newspaper.add(masthead);

    // Sub-banner
    const edition = this.add.text(0, -paperH / 2 + 86, 'FINAL EDITION — SPECIAL DISPATCH FROM THE DOJO', {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      fontStyle: 'italic',
      color: '#4a4e69',
      letterSpacing: 2,
    }).setOrigin(0.5);
    newspaper.add(edition);

    // Headline: "EXTRA! EXTRA! ..."
    const headlineText = this.deathHeadlines[Math.floor(Math.random() * this.deathHeadlines.length)];
    const headline = this.add.text(0, -paperH / 2 + 122, `EXTRA! EXTRA!\n${headlineText}`, {
      fontFamily: 'Impact, Georgia, sans-serif',
      fontSize: '26px',
      color: '#d90429',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);
    newspaper.add(headline);

    // Stats Grid inside newspaper columns
    const statsBox = this.add.graphics();
    statsBox.fillStyle(0x191624, 0.06);
    statsBox.fillRoundedRect(-paperW / 2 + 30, -paperH / 2 + 175, paperW - 60, 185, 4);
    statsBox.lineStyle(1.5, 0x090a10, 0.4);
    statsBox.strokeRoundedRect(-paperW / 2 + 30, -paperH / 2 + 175, paperW - 60, 185, 4);
    newspaper.add(statsBox);

    const timeSec = (survivalTimeMs / 1000).toFixed(1);

    const statsText = this.add.text(
      0,
      -paperH / 2 + 230,
      `RUN SCORE: ${score.toLocaleString()} PTS\nSURVIVAL TIME: ${timeSec} SECONDS\nSCROLLS COLLECTED: ${orbs}\nMAX COMBO: x${maxCombo.toFixed(1)}\nACTIVE SHADOWS: ${maxShadows}`,
      {
        fontFamily: 'Georgia, monospace',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#090a10',
        lineSpacing: 8,
        align: 'center',
      }
    ).setOrigin(0.5);
    newspaper.add(statsText);

    // High Score Badge
    const bestText = this.add.text(
      0,
      -paperH / 2 + 335,
      `ALL-TIME BEST: ${bestScore.toLocaleString()} PTS`,
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#d90429',
        letterSpacing: 2,
      }
    ).setOrigin(0.5);
    newspaper.add(bestText);

    // "NEW RECORD!" Ink Stamp if beaten
    if (recordResult?.isNewBestScore) {
      const stamp = this.add.container(paperW / 2 - 110, -paperH / 2 + 220);
      stamp.setRotation(0.25);
      const stampBg = this.add.graphics();
      stampBg.lineStyle(3, 0xd90429, 0.9);
      stampBg.strokeRect(-65, -20, 130, 40);
      const stampTxt = this.add.text(0, 0, 'NEW RECORD!', {
        fontFamily: 'Impact, sans-serif',
        fontSize: '18px',
        color: '#d90429',
      }).setOrigin(0.5);
      stamp.add([stampBg, stampTxt]);
      newspaper.add(stamp);

      this.tweens.add({
        targets: stamp,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    }

    // Interactive Buttons
    const btnY = paperH / 2 - 60;
    this.createCartoonButton(newspaper, -190, btnY, '↺ RETRY', '#ffffff', 0xd90429, () => this.restartGame(), true);
    this.createCartoonButton(newspaper, 0, btnY, '⌂ MENU', '#ffffff', 0x2b2d42, () => this.goToMenu(), false);
    this.createCartoonButton(newspaper, 190, btnY, '⚙ SETTINGS', '#ffffff', 0x2b2d42, () => this.openSettings(), false);

    // Keyboard Shortcuts
    this.input.keyboard?.on('keydown-SPACE', () => this.restartGame());
    this.input.keyboard?.on('keydown-ENTER', () => this.restartGame());
    this.input.keyboard?.on('keydown-M', () => this.goToMenu());
    this.input.keyboard?.on('keydown-S', () => this.openSettings());
  }

  private createCartoonButton(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
    label: string,
    textColor: string,
    fillColor: number,
    callback: () => void,
    isPrimary: boolean = false
  ): void {
    const btn = this.add.container(x, y);
    const width = 160;
    const height = 44;

    const bg = this.add.graphics();
    bg.fillStyle(fillColor, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 6);
    bg.lineStyle(2.5, 0x000000, 1);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 6);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, Impact, sans-serif',
      fontSize: isPrimary ? '18px' : '15px',
      fontStyle: 'bold',
      color: textColor,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    btn.add([bg, txt]);
    btn.setSize(width, height);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      this.tweens.killTweensOf(btn);
      this.tweens.add({
        targets: btn,
        scaleX: 1.06,
        scaleY: 0.94,
        duration: 100,
        ease: 'Sine.easeOut',
      });
      AudioSystem.getInstance().playMenuClick();
    });

    btn.on('pointerout', () => {
      this.tweens.killTweensOf(btn);
      this.tweens.add({
        targets: btn,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Sine.easeOut',
      });
    });

    btn.on('pointerdown', () => {
      this.tweens.killTweensOf(btn);
      this.tweens.add({
        targets: btn,
        scaleX: 0.92,
        scaleY: 1.1,
        duration: 70,
        yoyo: true,
        onComplete: () => callback(),
      });
    });

    parent.add(btn);
  }

  private restartGame(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.start('GameScene');
  }

  private goToMenu(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.start('MenuScene');
  }

  private openSettings(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.start('SettingsScene', { returnScene: 'GameOverScene' });
  }
}
