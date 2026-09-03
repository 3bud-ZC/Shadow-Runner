import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../game/constants';
import { CartoonRenderer } from '../render/CartoonRenderer';

export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Arena {
  private scene: Phaser.Scene;
  public platforms!: Phaser.Physics.Arcade.StaticGroup;
  public bouncePads!: Phaser.Physics.Arcade.StaticGroup;
  private graphics!: Phaser.GameObjects.Graphics;
  private bouncePadGraphics!: Phaser.GameObjects.Graphics;
  private lanternGraphics!: Phaser.GameObjects.Graphics;

  private leftPadCompressed: boolean = false;
  private rightPadCompressed: boolean = false;

  private platformConfigs: PlatformConfig[] = [
    // Bottom floor
    { x: 0, y: GAME_HEIGHT - 40, width: GAME_WIDTH, height: 40 },
    // Side boundaries (Wall Slide/Wall Jump surfaces)
    { x: 0, y: 0, width: 24, height: GAME_HEIGHT },
    { x: GAME_WIDTH - 24, y: 0, width: 24, height: GAME_HEIGHT },
    // Ceiling
    { x: 0, y: 0, width: GAME_WIDTH, height: 24 },
    // Lower tier platforms (y=540)
    { x: 100, y: 540, width: 340, height: 22 },
    { x: GAME_WIDTH - 440, y: 540, width: 340, height: 22 },
    // Mid tier center pagoda platform (y=410)
    { x: 420, y: 410, width: 440, height: 22 },
    // Upper tier ninja roosts (y=280)
    { x: 140, y: 280, width: 300, height: 22 },
    { x: GAME_WIDTH - 440, y: 280, width: 300, height: 22 },
  ];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    this.drawBackground();
    this.createPhysicsPlatforms();
    this.createBouncePads();
    this.drawPlatforms();

    this.bouncePadGraphics = this.scene.add.graphics();
    this.bouncePadGraphics.setDepth(2);

    this.lanternGraphics = this.scene.add.graphics();
    this.lanternGraphics.setDepth(3);

    this.drawBouncePads();
  }

  private drawBackground(): void {
    const bg = this.scene.add.graphics();
    bg.setDepth(-10);

    // 1. Deep vintage parchment ink-wash background
    bg.fillStyle(COLORS.CARTOON_PARCHMENT_BG, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 2. GIANT CRIMSON INK MOON
    bg.fillStyle(0xd90429, 0.35);
    bg.fillCircle(GAME_WIDTH / 2, 210, 110);
    bg.fillStyle(0xef233c, 0.25);
    bg.fillCircle(GAME_WIDTH / 2, 210, 85);
    bg.lineStyle(3, 0xd90429, 0.5);
    bg.strokeCircle(GAME_WIDTH / 2, 210, 110);

    // 3. SILHOUETTE MOUNTAINS (Far layer)
    bg.fillStyle(0x1a1626, 0.9);
    bg.beginPath();
    bg.moveTo(0, 500);
    bg.lineTo(220, 360);
    bg.lineTo(480, 510);
    bg.lineTo(760, 340);
    bg.lineTo(1040, 490);
    bg.lineTo(1280, 370);
    bg.lineTo(1280, 720);
    bg.lineTo(0, 720);
    bg.closePath();
    bg.fillPath();

    // 4. PAGODA ROOFS (Mid layer)
    bg.fillStyle(0x120e1c, 0.95);
    // Left pagoda roof
    bg.beginPath();
    bg.moveTo(60, 420);
    bg.lineTo(160, 370);
    bg.lineTo(260, 420);
    bg.lineTo(240, 450);
    bg.lineTo(80, 450);
    bg.closePath();
    bg.fillPath();

    // Right pagoda roof
    bg.beginPath();
    bg.moveTo(1020, 420);
    bg.lineTo(1120, 370);
    bg.lineTo(1220, 420);
    bg.lineTo(1200, 450);
    bg.lineTo(1040, 450);
    bg.closePath();
    bg.fillPath();

    // Center Torii / Dojo Gate Silhouette
    bg.fillStyle(0x191424, 0.85);
    bg.fillRect(520, 410, 16, 270);
    bg.fillRect(744, 410, 16, 270);
    bg.fillRect(490, 410, 300, 12);

    // Stylized paper grid lines
    bg.lineStyle(1, COLORS.CARTOON_GRID, 0.25);
    const gridSize = 40;
    for (let x = 0; x <= GAME_WIDTH; x += gridSize) {
      bg.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += gridSize) {
      bg.lineBetween(0, y, GAME_WIDTH, y);
    }
  }

  private createPhysicsPlatforms(): void {
    this.platforms = this.scene.physics.add.staticGroup();

    for (const config of this.platformConfigs) {
      const zone = this.scene.add.zone(
        config.x + config.width / 2,
        config.y + config.height / 2,
        config.width,
        config.height
      );
      this.scene.physics.world.enable(zone, Phaser.Physics.Arcade.STATIC_BODY);
      this.platforms.add(zone);
    }
  }

  private createBouncePads(): void {
    this.bouncePads = this.scene.physics.add.staticGroup();

    // Left Trampoline
    const leftPad = this.scene.add.zone(80, 672, 40, 16);
    this.scene.physics.world.enable(leftPad, Phaser.Physics.Arcade.STATIC_BODY);
    leftPad.setData('side', 'left');
    this.bouncePads.add(leftPad);

    // Right Trampoline
    const rightPad = this.scene.add.zone(1200, 672, 40, 16);
    this.scene.physics.world.enable(rightPad, Phaser.Physics.Arcade.STATIC_BODY);
    rightPad.setData('side', 'right');
    this.bouncePads.add(rightPad);
  }

  public triggerPadBounce(pad: Phaser.GameObjects.Zone): void {
    const side = pad.getData('side');
    if (side === 'left') {
      this.leftPadCompressed = true;
      this.scene.time.delayedCall(160, () => {
        this.leftPadCompressed = false;
        this.drawBouncePads();
      });
    } else {
      this.rightPadCompressed = true;
      this.scene.time.delayedCall(160, () => {
        this.rightPadCompressed = false;
        this.drawBouncePads();
      });
    }
    this.drawBouncePads();
  }

  public update(): void {
    this.drawLanterns();
  }

  private drawBouncePads(): void {
    this.bouncePadGraphics.clear();

    // Left Pad
    this.bouncePadGraphics.save();
    this.bouncePadGraphics.translateCanvas(80, 678);
    CartoonRenderer.drawBouncePad(this.bouncePadGraphics, this.leftPadCompressed);
    this.bouncePadGraphics.restore();

    // Right Pad
    this.bouncePadGraphics.save();
    this.bouncePadGraphics.translateCanvas(1200, 678);
    CartoonRenderer.drawBouncePad(this.bouncePadGraphics, this.rightPadCompressed);
    this.bouncePadGraphics.restore();
  }

  private drawLanterns(): void {
    this.lanternGraphics.clear();
    const time = this.scene.time.now;

    // Lanterns hanging under platforms
    const lanternPositions = [
      { x: 440, y: 432 },
      { x: 840, y: 432 },
      { x: 260, y: 302 },
      { x: 1020, y: 302 },
    ];

    for (let i = 0; i < lanternPositions.length; i++) {
      const pos = lanternPositions[i];
      const indSwing = Math.sin(time * 0.0028 + i * 1.2) * 0.14;
      this.lanternGraphics.save();
      this.lanternGraphics.translateCanvas(pos.x, pos.y);
      CartoonRenderer.drawLantern(this.lanternGraphics, indSwing);
      this.lanternGraphics.restore();
    }
  }

  private drawPlatforms(): void {
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(1);

    for (const config of this.platformConfigs) {
      this.graphics.fillStyle(COLORS.CARTOON_WOOD, 0.98);
      this.graphics.fillRect(config.x, config.y, config.width, config.height);

      this.graphics.lineStyle(2.5, COLORS.CARTOON_WOOD_STROKE, 1);
      this.graphics.strokeRect(config.x, config.y, config.width, config.height);

      if (config.y > 0 && config.height < 50) {
        this.graphics.fillStyle(COLORS.CARTOON_WOOD_TOP, 1);
        this.graphics.fillRect(config.x, config.y, config.width, 4);

        this.graphics.lineStyle(1.5, COLORS.CARTOON_WOOD_STROKE, 1);
        this.graphics.lineBetween(config.x, config.y + 4, config.x + config.width, config.y + 4);

        this.graphics.fillStyle(0x12131a, 0.9);
        this.graphics.fillCircle(config.x + 8, config.y + 11, 2.5);
        this.graphics.fillCircle(config.x + config.width - 8, config.y + 11, 2.5);
      }
    }
  }

  public getSpawnPosition(): { x: number; y: number } {
    return { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 120 };
  }

  public destroy(): void {
    if (this.graphics) this.graphics.destroy();
    if (this.bouncePadGraphics) this.bouncePadGraphics.destroy();
    if (this.lanternGraphics) this.lanternGraphics.destroy();
  }
}
