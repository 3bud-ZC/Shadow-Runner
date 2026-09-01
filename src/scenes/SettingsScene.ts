import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { SaveManager } from '../storage/SaveManager';
import { AudioSystem } from '../systems/AudioSystem';

interface SettingsSceneData {
  returnSceneKey?: string;
}

export class SettingsScene extends Phaser.Scene {
  private returnSceneKey: string = 'MenuScene';

  constructor() {
    super({ key: 'SettingsScene' });
  }

  public init(data: SettingsSceneData): void {
    this.returnSceneKey = data?.returnSceneKey || 'MenuScene';
  }

  public create(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dimmed background
    const bg = this.add.graphics();
    bg.fillStyle(0x060912, 0.94);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Subtle grid lines
    bg.lineStyle(1, 0x141f33, 0.4);
    for (let x = 0; x <= GAME_WIDTH; x += 40) {
      bg.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 40) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }

    // Settings Panel Box
    const panelW = 680;
    const panelH = 480;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0b111f, 0.95);
    panelBg.fillRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 10);
    panelBg.lineStyle(1.5, 0x00f0ff, 0.8);
    panelBg.strokeRoundedRect(cx - panelW / 2, cy - panelH / 2, panelW, panelH, 10);

    // Title
    this.add.text(cx, cy - 195, 'SETTINGS & ACCESSIBILITY', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
      letterSpacing: 3,
    }).setOrigin(0.5);

    const settings = SaveManager.getSettings();
    let currentY = cy - 130;

    // 1. Master Volume Control
    this.createStepperRow(
      cx,
      currentY,
      'MASTER VOLUME',
      `${Math.round(settings.masterVolume * 100)}%`,
      () => {
        const next = Math.max(0, Math.round((settings.masterVolume - 0.1) * 10) / 10);
        settings.masterVolume = next;
        AudioSystem.getInstance().setMasterVolume(next);
        this.refresh();
      },
      () => {
        const next = Math.min(1.0, Math.round((settings.masterVolume + 0.1) * 10) / 10);
        settings.masterVolume = next;
        AudioSystem.getInstance().setMasterVolume(next);
        this.refresh();
      }
    );
    currentY += 55;

    // 2. SFX Volume Control
    this.createStepperRow(
      cx,
      currentY,
      'SFX VOLUME',
      `${Math.round(settings.sfxVolume * 100)}%`,
      () => {
        const next = Math.max(0, Math.round((settings.sfxVolume - 0.1) * 10) / 10);
        settings.sfxVolume = next;
        AudioSystem.getInstance().setSfxVolume(next);
        this.refresh();
      },
      () => {
        const next = Math.min(1.0, Math.round((settings.sfxVolume + 0.1) * 10) / 10);
        settings.sfxVolume = next;
        AudioSystem.getInstance().setSfxVolume(next);
        this.refresh();
      }
    );
    currentY += 55;

    // 3. Screen Shake Toggle
    this.createToggleRow(
      cx,
      currentY,
      'SCREEN SHAKE',
      settings.screenShake ? 'ENABLED' : 'DISABLED',
      settings.screenShake,
      () => {
        settings.screenShake = !settings.screenShake;
        SaveManager.updateSettings({ screenShake: settings.screenShake });
        this.refresh();
      }
    );
    currentY += 55;

    // 4. Reduced Motion Toggle
    this.createToggleRow(
      cx,
      currentY,
      'REDUCED MOTION',
      settings.reducedMotion ? 'ON' : 'OFF',
      settings.reducedMotion,
      () => {
        settings.reducedMotion = !settings.reducedMotion;
        SaveManager.updateSettings({ reducedMotion: settings.reducedMotion });
        this.refresh();
      }
    );
    currentY += 55;

    // 5. Mobile Controls Opacity
    this.createStepperRow(
      cx,
      currentY,
      'TOUCH OPACITY',
      `${Math.round(settings.touchControlsOpacity * 100)}%`,
      () => {
        const next = Math.max(0.3, Math.round((settings.touchControlsOpacity - 0.1) * 10) / 10);
        settings.touchControlsOpacity = next;
        SaveManager.updateSettings({ touchControlsOpacity: next });
        this.refresh();
      },
      () => {
        const next = Math.min(1.0, Math.round((settings.touchControlsOpacity + 0.1) * 10) / 10);
        settings.touchControlsOpacity = next;
        SaveManager.updateSettings({ touchControlsOpacity: next });
        this.refresh();
      }
    );
    currentY += 65;

    // Back / Done Button
    this.createBackButton(cx, currentY, 'BACK', () => this.closeSettings());

    // Keyboard support: ESC to return
    this.input.keyboard?.on('keydown-ESC', () => this.closeSettings());
  }

  private refresh(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.restart({ returnSceneKey: this.returnSceneKey });
  }

  private closeSettings(): void {
    AudioSystem.getInstance().playMenuClick();
    this.scene.stop();
    if (this.returnSceneKey === 'PauseScene') {
      this.scene.resume('PauseScene');
    } else {
      this.scene.start(this.returnSceneKey);
    }
  }

  private createStepperRow(
    cx: number,
    y: number,
    label: string,
    valueStr: string,
    onMinus: () => void,
    onPlus: () => void
  ): void {
    const leftX = cx - 290;
    const rightX = cx + 140;

    // Label
    this.add.text(leftX, y, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    }).setOrigin(0, 0.5);

    // Minus Button
    this.createMiniButton(rightX - 55, y, '◀', onMinus);

    // Value Display
    this.add.text(rightX, y, valueStr, {
      fontFamily: 'Orbitron, monospace',
      fontSize: '15px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
    }).setOrigin(0.5);

    // Plus Button
    this.createMiniButton(rightX + 55, y, '▶', onPlus);
  }

  private createToggleRow(
    cx: number,
    y: number,
    label: string,
    valueStr: string,
    isActive: boolean,
    onToggle: () => void
  ): void {
    const leftX = cx - 290;
    const rightX = cx + 140;

    // Label
    this.add.text(leftX, y, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#e2e8f0',
    }).setOrigin(0, 0.5);

    // Toggle Button
    const btnContainer = this.add.container(rightX, y);
    const w = 120;
    const h = 34;

    const bg = this.add.graphics();
    bg.fillStyle(isActive ? 0x00f0ff : 0x1e293b, isActive ? 0.35 : 0.8);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, isActive ? 0x00f0ff : 0x475569, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    const txt = this.add.text(0, 0, valueStr, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: isActive ? COLORS.TEXT_CYAN : '#94a3b8',
    }).setOrigin(0.5);

    btnContainer.add([bg, txt]);
    btnContainer.setSize(w, h);
    btnContainer.setInteractive({ useHandCursor: true });
    btnContainer.on('pointerdown', onToggle);
  }

  private createMiniButton(x: number, y: number, text: string, callback: () => void): void {
    const btnContainer = this.add.container(x, y);
    const w = 32;
    const h = 30;

    const bg = this.add.graphics();
    bg.fillStyle(0x18243b, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    bg.lineStyle(1, 0x00f0ff, 0.7);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);

    const txt = this.add.text(0, 0, text, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      color: COLORS.TEXT_CYAN,
    }).setOrigin(0.5);

    btnContainer.add([bg, txt]);
    btnContainer.setSize(w, h);
    btnContainer.setInteractive({ useHandCursor: true });
    btnContainer.on('pointerdown', callback);
  }

  private createBackButton(x: number, y: number, label: string, callback: () => void): void {
    const btnContainer = this.add.container(x, y);
    const w = 180;
    const h = 42;

    const bg = this.add.graphics();
    bg.fillStyle(0x0e1628, 0.9);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    bg.lineStyle(1.5, 0x00f0ff, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: COLORS.TEXT_CYAN,
    }).setOrigin(0.5);

    btnContainer.add([bg, txt]);
    btnContainer.setSize(w, h);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x00f0ff, 0.25);
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
      bg.lineStyle(1.5, 0x00f0ff, 0.8);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
      txt.setColor(COLORS.TEXT_CYAN);
      btnContainer.setScale(1);
    });

    btnContainer.on('pointerdown', callback);
  }
}
