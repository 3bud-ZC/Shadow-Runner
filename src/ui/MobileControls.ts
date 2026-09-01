import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { InputSystem } from '../systems/InputSystem';
import { SaveManager } from '../storage/SaveManager';

export class MobileControls {
  private scene: Phaser.Scene;
  private inputSystem: InputSystem;
  private container: Phaser.GameObjects.Container;
  private isVisible: boolean = false;

  constructor(scene: Phaser.Scene, inputSystem: InputSystem) {
    this.scene = scene;
    this.inputSystem = inputSystem;
    this.container = scene.add.container(0, 0).setDepth(200);

    const settings = SaveManager.getSettings();
    this.container.setAlpha(settings.touchControlsOpacity);

    const isTouchDevice = this.checkTouchDevice();
    if (isTouchDevice) {
      this.createControls();
      this.isVisible = true;
    }
  }

  private checkTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      (navigator && navigator.maxTouchPoints > 0) ||
      window.innerWidth <= 1024
    );
  }

  private createControls(): void {
    const bottomY = GAME_HEIGHT - 65;

    // --- Left D-Pad (Left / Right) ---
    this.createTouchButton(
      70,
      bottomY,
      76,
      60,
      '◀',
      (down) => this.inputSystem.setTouchLeft(down),
      COLORS.TEXT_CYAN
    );

    this.createTouchButton(
      160,
      bottomY,
      76,
      60,
      '▶',
      (down) => this.inputSystem.setTouchRight(down),
      COLORS.TEXT_CYAN
    );

    // --- Right Action Buttons (Jump / Dash) ---
    this.createTouchButton(
      GAME_WIDTH - 160,
      bottomY,
      76,
      60,
      '▲',
      (down) => this.inputSystem.setTouchJump(down, down),
      COLORS.TEXT_CYAN
    );

    this.createTouchButton(
      GAME_WIDTH - 70,
      bottomY,
      76,
      60,
      '⚡',
      (down) => {
        if (down) this.inputSystem.setTouchDash(true);
      },
      COLORS.TEXT_GOLD
    );

    // --- Top-Right Pause Button ---
    this.createTouchButton(
      GAME_WIDTH - 40,
      28,
      44,
      36,
      '⏸',
      (down) => {
        if (down) this.inputSystem.setTouchPause(true);
      },
      COLORS.TEXT_WHITE
    );
  }

  private createTouchButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onStateChange: (isDown: boolean) => void,
    accentColor: string
  ): void {
    const btnContainer = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    const halfW = width / 2;
    const halfH = height / 2;

    const drawBg = (pressed: boolean) => {
      bg.clear();
      if (pressed) {
        bg.fillStyle(0x00f0ff, 0.4);
        bg.fillRoundedRect(-halfW, -halfH, width, height, 10);
        bg.lineStyle(2, 0xffffff, 0.9);
        bg.strokeRoundedRect(-halfW, -halfH, width, height, 10);
      } else {
        bg.fillStyle(0x0c1322, 0.55);
        bg.fillRoundedRect(-halfW, -halfH, width, height, 10);
        bg.lineStyle(1.5, 0x1f2e4d, 0.7);
        bg.strokeRoundedRect(-halfW, -halfH, width, height, 10);
      }
    };

    drawBg(false);

    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: height < 40 ? '16px' : '22px',
      fontStyle: 'bold',
      color: accentColor,
    }).setOrigin(0.5);

    btnContainer.add([bg, text]);
    btnContainer.setSize(width, height);
    btnContainer.setInteractive({ useHandCursor: true });

    let isDown = false;

    const handleDown = () => {
      if (!isDown) {
        isDown = true;
        drawBg(true);
        btnContainer.setScale(0.95);
        onStateChange(true);
      }
    };

    const handleUp = () => {
      if (isDown) {
        isDown = false;
        drawBg(false);
        btnContainer.setScale(1);
        onStateChange(false);
      }
    };

    btnContainer.on('pointerdown', handleDown);
    btnContainer.on('pointerup', handleUp);
    btnContainer.on('pointerout', handleUp);
    btnContainer.on('pointercancel', handleUp);

    this.container.add(btnContainer);
  }

  public setOpacity(opacity: number): void {
    const clamped = Math.min(1.0, Math.max(0.3, opacity));
    this.container.setAlpha(clamped);
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.container.setVisible(visible);
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public destroy(): void {
    this.container.destroy();
  }
}
